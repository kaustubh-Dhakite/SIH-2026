"""Main FastAPI application"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .config import settings
from .database import engine, Base, SessionLocal
from .services.auth_service import create_demo_users
from .api import auth, health, agents, knowledge, models, security, multimodal, tools


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    print("Starting application...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create demo users
    db = SessionLocal()
    try:
        create_demo_users(db)
        print("Demo users created/verified")
    finally:
        db.close()
    
    yield
    
    # Shutdown
    print("Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sovereign On-Premise Agentic AI Workbench",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(agents.router)
app.include_router(knowledge.router)
app.include_router(models.router)
app.include_router(security.router)
app.include_router(multimodal.router)
app.include_router(tools.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
