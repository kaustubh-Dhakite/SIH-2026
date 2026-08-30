# 🚀 Quick Start Guide

## Complete! All 30/30 Tasks Finished ✅

Your Sovereign AI Workbench is **100% ready** for deployment!

## What's Been Built

### ✅ Backend (FastAPI)
- Complete REST API with all endpoints
- PostgreSQL database with full schema
- JWT authentication + RBAC (4 roles)
- Ollama LLM integration
- Qdrant vector database + RAG
- Document processing (PDF, DOCX, TXT)
- Agent orchestration with LangGraph
- Docker containerization

### ✅ Frontend (React + TypeScript)
- **Professional UI** with white/sky blue theme
- **Dark/Light mode** with toggle (top-right corner)
- **10 Complete Pages**:
  1. Login (with demo accounts)
  2. Dashboard (system health + quick actions)
  3. Knowledge Base (collections + upload)
  4. Agent Workspace (execution + trace + DOCX export)
  5. Documents (filtering + list/grid view)
  6. Models (switching + info modals)
  7. Multimodal (image analysis + OCR)
  8. Tools (testing interface)
  9. Audit Logs (complete history)
  10. Security Center (sovereignty metrics)
  11. Settings (account + system)

### ✅ Infrastructure
- Docker Compose for all services
- Complete environment configuration
- Comprehensive documentation

## 🎯 Start the Application

### Option 1: Docker (Recommended)

```bash
cd "f:\SIH 2026\sih-sovereign-ai"

# Start all services
docker-compose up -d

# Pull Ollama models (first time only)
docker exec -it sih-ollama ollama pull llama3.2:1b
docker exec -it sih-ollama ollama pull nomic-embed-text

# Verify models
docker exec -it sih-ollama ollama list
```

**Note:** Using `llama3.2:1b` (1.3GB) for quick setup. For better quality, use `qwen2.5:7b` (4.7GB). See MODEL_SETUP.md for details.

### Option 2: Development Mode

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🔑 Demo Accounts

| Username | Password | Role | Access |
|----------|----------|------|--------|
| admin | demo123 | Admin | Full access (including Security Center) |
| operator | demo123 | Operator | Manage agents, KB, models |
| analyst | demo123 | Analyst | Create tasks, upload docs |
| viewer | demo123 | Viewer | Read-only access |

## 🎨 Theme Toggle

Look for the **☀️/🌙 icon** in the top-right corner (next to your profile) to switch between light and dark modes. Theme preference is saved in localStorage!

## 📊 Key Features to Demo

1. **Login** → Use demo account selector (click "Demo Accounts ▼")
2. **Dashboard** → View system health (all services should show ✅)
3. **Knowledge Base** → Create collection → Upload document
4. **Agent Workspace** → Execute task → Watch trace animation → Export DOCX
5. **Models** → View available models → Switch active model (admin/operator only)
6. **Security Center** (admin only) → View sovereignty metrics → Export PDF report
7. **Theme Toggle** → Switch between light/dark modes

## 🐛 Troubleshooting

### Services Not Starting
```bash
docker-compose down
docker-compose up -d
docker-compose logs -f
```

### Ollama Models Missing
```bash
docker exec -it sih-ollama ollama list
docker exec -it sih-ollama ollama pull llama3.2:1b
docker exec -it sih-ollama ollama pull nomic-embed-text
```

### Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues
```bash
docker exec -it sih-backend bash
alembic upgrade head
```

## 📁 Project Structure

```
sih-sovereign-ai/
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── api/      # REST endpoints
│   │   ├── models/   # Database models
│   │   ├── services/ # Business logic
│   │   └── tools/    # Agent tools
│   └── alembic/      # Migrations
├── frontend/         # React + TypeScript
│   └── src/
│       ├── components/ # UI components
│       ├── pages/      # Page components
│       ├── services/   # API clients
│       ├── theme/      # Dark/light theme
│       └── types/      # TypeScript types
└── docker-compose.yml
```

## 🎓 For SIH 2026 Judges

This project demonstrates:

✅ **100% On-Premise** - No external API dependencies
✅ **Data Sovereignty** - All data stays local
✅ **Role-Based Security** - 4-tier RBAC system
✅ **Professional UI** - Clean, modern interface with dark mode
✅ **Complete Audit Trail** - Full activity logging
✅ **Production Ready** - Dockerized deployment
✅ **Agentic AI** - LangGraph workflows with real-time traces
✅ **RAG Implementation** - Semantic search with Qdrant
✅ **Multimodal Capable** - Vision + text analysis

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review README.md for detailed documentation
3. Check API docs: http://localhost:8000/docs

## 🎉 You're Ready!

Everything is built and ready to run. Just execute:

```bash
cd "f:\SIH 2026\sih-sovereign-ai"
docker-compose up -d
```

Then open http://localhost:3000 and login with any demo account!

**Happy demoing! 🚀**
