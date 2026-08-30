"""Sandbox service for code execution"""
import docker
from typing import Dict, Any
import tempfile
import os


class SandboxService:
    """Service for sandboxed code execution"""
    
    def __init__(self):
        try:
            self.client = docker.from_env()
            self.enabled = True
        except:
            print("Docker not available - sandbox disabled")
            self.client = None
            self.enabled = False
    
    async def execute_python(self, code: str, timeout: int = 30) -> Dict[str, Any]:
        """Execute Python code in sandbox"""
        if not self.enabled:
            return {
                "success": False,
                "output": "",
                "error": "Sandbox not available"
            }
        
        try:
            # Create temporary file with code
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            # Run in container
            container = self.client.containers.run(
                "python:3.11-slim",
                f"python /code/{os.path.basename(temp_file)}",
                volumes={os.path.dirname(temp_file): {'bind': '/code', 'mode': 'ro'}},
                remove=True,
                detach=False,
                stdout=True,
                stderr=True,
                timeout=timeout
            )
            
            # Clean up
            os.unlink(temp_file)
            
            return {
                "success": True,
                "output": container.decode('utf-8'),
                "error": None
            }
        
        except docker.errors.ContainerError as e:
            return {
                "success": False,
                "output": "",
                "error": e.stderr.decode('utf-8')
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e)
            }


# Singleton instance
sandbox_service = SandboxService()
