"""Python code execution tool"""
from typing import Dict, Any
from ..services.sandbox_service import sandbox_service


async def execute_python_code(code: str) -> Dict[str, Any]:
    """Execute Python code in sandbox"""
    result = await sandbox_service.execute_python(code, timeout=30)
    
    return {
        "tool": "python_executor",
        "success": result["success"],
        "output": result["output"],
        "error": result["error"]
    }
