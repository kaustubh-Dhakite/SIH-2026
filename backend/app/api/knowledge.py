"""Knowledge base API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models.db import KnowledgeBase, Document, User
from ..schemas.knowledge import (
    KnowledgeBaseCreate,
    KnowledgeBaseResponse,
    DocumentResponse,
    RAGQueryRequest,
    RAGQueryResponse,
    RAGResult
)
from ..services.security import get_current_user, require_analyst, log_audit
from ..services.document_service import document_service
from ..services.rag_service import rag_service

router = APIRouter(prefix="/api", tags=["knowledge"])


@router.get("/knowledge-bases", response_model=List[KnowledgeBaseResponse])
async def list_knowledge_bases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all knowledge bases"""
    kbs = db.query(KnowledgeBase).filter(KnowledgeBase.owner_id == current_user.id).all()
    
    # Add document count
    result = []
    for kb in kbs:
        kb_dict = KnowledgeBaseResponse.from_orm(kb)
        kb_dict.document_count = len(kb.documents)
        result.append(kb_dict)
    
    return result


@router.post("/knowledge-bases", response_model=KnowledgeBaseResponse)
async def create_knowledge_base(
    kb: KnowledgeBaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Create a new knowledge base"""
    db_kb = KnowledgeBase(
        name=kb.name,
        classification=kb.classification,
        owner_id=current_user.id
    )
    db.add(db_kb)
    db.commit()
    db.refresh(db_kb)
    
    log_audit(db, current_user.id, "create_kb", "knowledge_base", str(db_kb.id), "success")
    
    return db_kb


@router.post("/documents/upload")
async def upload_document(
    kb_id: str = Form(...),
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Upload and process document"""
    # Validate KB
    kb = db.query(KnowledgeBase).filter(KnowledgeBase.id == kb_id).first()
    if not kb:
        raise HTTPException(status_code=404, detail="Knowledge base not found")
    
    # Read file
    file_content = await file.read()
    file_size = len(file_content)
    
    # Validate file
    is_valid, error_msg = document_service.validate_file(file.filename, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Save file
    file_path = document_service.save_file(file_content, file.filename, kb_id)
    file_type = document_service.get_file_type(file.filename)
    
    # Create document record
    doc = Document(
        kb_id=kb.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_type,
        size_bytes=file_size,
        created_by=current_user.id,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Process in background
    if background_tasks:
        background_tasks.add_task(process_document_background, str(doc.id), file_path, file_type, str(kb_id))
    
    log_audit(db, current_user.id, "upload_document", "document", str(doc.id), "success")
    
    return {
        "doc_id": str(doc.id),
        "status": "processing",
        "message": "Document uploaded successfully"
    }


@router.get("/documents", response_model=List[DocumentResponse])
async def list_documents(
    kb_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents"""
    query = db.query(Document)
    if kb_id:
        query = query.filter(Document.kb_id == kb_id)
    
    docs = query.all()
    return docs


@router.delete("/documents/{doc_id}")
async def delete_document(
    doc_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Delete document"""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete from vector store
    rag_service.delete_document(str(doc_id))
    
    # Delete from DB
    db.delete(doc)
    db.commit()
    
    log_audit(db, current_user.id, "delete_document", "document", doc_id, "success")
    
    return {"message": "Document deleted successfully"}


@router.post("/rag/query", response_model=RAGQueryResponse)
async def rag_query(
    request: RAGQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Query knowledge base"""
    kb_ids = [str(kb_id) for kb_id in request.kb_ids] if request.kb_ids else []
    
    results = await rag_service.search(
        query=request.query,
        kb_ids=kb_ids,
        top_k=request.top_k,
        score_threshold=request.score_threshold
    )
    
    formatted_results = [RAGResult(**r) for r in results]
    
    return RAGQueryResponse(
        results=formatted_results,
        query=request.query
    )


async def process_document_background(doc_id: str, file_path: str, file_type: str, kb_id: str):
    """Process document in background"""
    from ..database import SessionLocal
    
    db = SessionLocal()
    try:
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            print(f"Document {doc_id} not found in DB, aborting processing.")
            return
        
        # Extract text - use async version for images
        if file_type == "image":
            text = await document_service._extract_image(file_path)
        else:
            text = document_service.extract_text(file_path, file_type)
        
        if not text or not text.strip():
            print(f"No text extracted from {file_path} (type={file_type})")
            doc.status = "failed"
            db.commit()
            return
        
        print(f"Extracted {len(text)} chars from {doc.filename}")
        
        # Chunk text
        chunks = document_service.chunk_text(text)
        
        if not chunks:
            print(f"No chunks generated for {doc.filename}")
            doc.status = "failed"
            db.commit()
            return
        
        print(f"Generated {len(chunks)} chunks for {doc.filename}")
        
        # Index chunks
        chunks_count = await rag_service.index_document(
            doc_id=doc_id,
            kb_id=kb_id,
            chunks=chunks,
            metadata={
                "filename": doc.filename,
                "file_type": file_type
            }
        )
        
        print(f"Indexed {chunks_count} chunks for {doc.filename}")
        
        # Update document
        doc.chunks_count = chunks_count
        doc.status = "indexed"
        doc.indexed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        import traceback
        print(f"Document processing error: {e}")
        traceback.print_exc()
        try:
            doc = db.query(Document).filter(Document.id == doc_id).first()
            if doc:
                doc.status = "failed"
                db.commit()
        except:
            pass
    finally:
        db.close()
