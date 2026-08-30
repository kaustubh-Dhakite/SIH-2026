"""RAG service for vector search with Qdrant"""
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import uuid
from ..config import settings
from .llm_service import llm_service


class RAGService:
    """Service for RAG operations"""
    
    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self.collection_name = settings.QDRANT_COLLECTION
        self.embedding_model = settings.OLLAMA_MODEL_EMBEDDINGS
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Ensure collection exists with correct vector dimensions"""
        try:
            collections = self.client.get_collections().collections
            existing = [c.name for c in collections]
            
            if self.collection_name in existing:
                # Delete and recreate to ensure correct dimensions
                try:
                    self.client.delete_collection(self.collection_name)
                    print(f"Deleted existing collection '{self.collection_name}' to fix dimensions")
                except Exception:
                    pass
            
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )
            print(f"Created Qdrant collection '{self.collection_name}' with 768-dim vectors")
        except Exception as e:
            # Collection might already exist with correct config
            print(f"Collection setup: {e}")
    
    async def index_document(
        self,
        doc_id: str,
        kb_id: str,
        chunks: List[str],
        metadata: Dict[str, Any]
    ) -> int:
        """Index document chunks"""
        points = []
        
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = await llm_service.embed(self.embedding_model, chunk)
            
            if not embedding:
                continue
            
            point = PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "doc_id": doc_id,
                    "kb_id": kb_id,
                    "chunk_index": i,
                    "text": chunk,
                    **metadata
                }
            )
            points.append(point)
        
        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
        
        return len(points)
    
    async def search(
        self,
        query: str,
        kb_ids: Optional[List[str]] = None,
        top_k: int = 5,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        # Generate query embedding
        query_embedding = await llm_service.embed(self.embedding_model, query)
        
        if not query_embedding:
            return []
        
        # Build filter
        query_filter = None
        if kb_ids:
            query_filter = Filter(
                should=[
                    FieldCondition(
                        key="kb_id",
                        match=MatchValue(value=kb_id)
                    )
                    for kb_id in kb_ids
                ]
            )
        
        # Search
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=query_filter,
            limit=top_k,
            score_threshold=score_threshold
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "text": result.payload.get("text", ""),
                "source": result.payload.get("filename", "Unknown"),
                "score": result.score,
                "metadata": {
                    "doc_id": result.payload.get("doc_id"),
                    "kb_id": result.payload.get("kb_id"),
                    "chunk_index": result.payload.get("chunk_index")
                }
            })
        
        return formatted_results
    
    def delete_document(self, doc_id: str):
        """Delete document from vector store"""
        try:
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="doc_id",
                            match=MatchValue(value=doc_id)
                        )
                    ]
                )
            )
        except Exception as e:
            print(f"Delete document error: {e}")
    
    def check_health(self) -> bool:
        """Check if Qdrant is healthy"""
        try:
            self.client.get_collections()
            return True
        except:
            return False


# Singleton instance
rag_service = RAGService()
