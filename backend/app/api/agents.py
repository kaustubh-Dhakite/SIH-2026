"""Agent management API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.db import Agent, Task, User
from ..schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    TaskResponse,
    TaskQueryRequest
)
from ..services.security import get_current_user, require_analyst, log_audit
from ..services.agent_orchestrator import agent_orchestrator

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("", response_model=List[AgentResponse])
async def list_agents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all agents"""
    agents = db.query(Agent).filter(Agent.owner_id == current_user.id).all()
    return agents


@router.post("", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Create a new agent"""
    db_agent = Agent(
        name=agent.name,
        description=agent.description,
        system_prompt=agent.system_prompt,
        default_model=agent.default_model,
        tools=agent.tools,
        owner_id=current_user.id
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    
    log_audit(db, current_user.id, "create_agent", "agent", str(db_agent.id), "success")
    
    return db_agent


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get agent by ID"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("/{agent_id}/query")
async def query_agent(
    agent_id: str,
    request: TaskQueryRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Execute agent query"""
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Create task
    task = Task(
        agent_id=agent.id,
        user_id=current_user.id,
        input_query=request.query,
        status="pending",
        model_used=agent.default_model
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    
    # Execute in background
    background_tasks.add_task(
        execute_task_background,
        task.id,
        agent.id,
        request.query,
        [str(kb_id) for kb_id in request.kb_ids] if request.kb_ids else [],
        agent.tools,
        agent.system_prompt,
        agent.default_model
    )
    
    return {"task_id": str(task.id), "status": "pending"}


@router.get("/{agent_id}/task/{task_id}", response_model=TaskResponse)
async def get_task(
    agent_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get task status and result"""
    task = db.query(Task).filter(Task.id == task_id, Task.agent_id == agent_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/{agent_id}/task/{task_id}/cancel")
async def cancel_task(
    agent_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """Cancel running task"""
    task = db.query(Task).filter(Task.id == task_id, Task.agent_id == agent_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status == "running":
        task.status = "cancelled"
        db.commit()
    
    return {"message": "Task cancelled"}


async def execute_task_background(
    task_id: str,
    agent_id: str,
    query: str,
    kb_ids: List[str],
    tools: List[str],
    system_prompt: str,
    model: str
):
    """Execute task in background"""
    from ..database import SessionLocal
    
    db = SessionLocal()
    try:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            return
        
        # Update status
        task.status = "running"
        db.commit()
        
        # Execute
        result = await agent_orchestrator.execute_task(
            query=query,
            kb_ids=kb_ids,
            tools=tools,
            system_prompt=system_prompt,
            model=model
        )
        
        # Update task
        task.status = result["status"]
        task.result = result["result"]
        task.trace = result["trace"]
        task.duration_seconds = result["duration"]
        task.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        print(f"Task execution error: {e}")
        task.status = "failed"
        task.result = f"Error: {str(e)}"
        db.commit()
    finally:
        db.close()
