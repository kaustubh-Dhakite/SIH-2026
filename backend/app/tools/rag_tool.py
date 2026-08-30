"""RAG tool for knowledge retrieval"""
from typing import Dict, Any, List
from ..services.rag_service import rag_service


async def rag_search(query: str, kb_ids: List[str], top_k: int = 5) -> Dict[str, Any]:
    """Search knowledge base"""
    results = await rag_service.search(
        query=query,
        kb_ids=kb_ids,
        top_k=top_k,
        score_threshold=0.7
    )
    
    return {
        "tool": "rag_search",
        "results": results,
        "count": len(results)
    }
