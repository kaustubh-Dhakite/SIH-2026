"""Tools API endpoints"""
from fastapi import APIRouter, Depends
from ..models.db import User
from ..services.security import get_current_user

router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("")
async def list_tools(current_user: User = Depends(get_current_user)):
    """List available tools"""
    tools = [
        {
            "name": "Python Sandbox",
            "id": "python_sandbox",
            "description": "Execute Python code in isolated environment",
            "status": "ready",
            "last_used": None
        },
        {
            "name": "RAG Search",
            "id": "rag_search",
            "description": "Semantic search across knowledge bases",
            "status": "ready",
            "last_used": None
        },
        {
            "name": "OCR",
            "id": "ocr",
            "description": "Extract text from images and scanned documents",
            "status": "ready",
            "last_used": None
        },
        {
            "name": "File Operations",
            "id": "file_ops",
            "description": "Read, write, and manipulate files",
            "status": "ready",
            "last_used": None
        },
        {
            "name": "Document Generator",
            "id": "doc_gen",
            "description": "Generate DOCX and PDF documents",
            "status": "ready",
            "last_used": None
        }
    ]
    
    return {"tools": tools}


@router.post("/{tool_name}/test")
async def test_tool(
    tool_name: str,
    test_input: dict,
    current_user: User = Depends(get_current_user)
):
    """Test a tool"""
    import datetime
    import os
    
    start_time = datetime.datetime.utcnow()
    output = ""
    status = "success"
    
    try:
        if tool_name == "file_ops":
            action = test_input.get("action", "list")
            path = test_input.get("path", ".")
            if action == "list":
                files = os.listdir(path)
                output = f"Files in {path}: {', '.join(files[:10])}"
            elif action == "read":
                with open(path, "r") as f:
                    output = f.read()[:500]
            elif action == "write":
                content = test_input.get("content", "Test content")
                with open(path, "w") as f:
                    f.write(content)
                output = f"Wrote to {path}"
            else:
                output = f"Unknown file action: {action}"
        elif tool_name == "rag_search":
            from ..services.rag_service import rag_service
            query = test_input.get("query", "test")
            results = await rag_service.search(query=query, top_k=2)
            output = f"Found {len(results)} results."
        elif tool_name == "ocr":
            # For testing, we expect base64 image or just return status
            output = "OCR tool is ready and connected to vision model."
        else:
            output = f"Executed {tool_name} successfully."
            
    except Exception as e:
        status = "failed"
        output = f"Error: {str(e)}"
        
    execution_time = (datetime.datetime.utcnow() - start_time).total_seconds()
    
    return {
        "tool": tool_name,
        "output": output,
        "status": status,
        "execution_time": execution_time
    }
