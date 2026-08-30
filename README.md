# Sovereign AI Workbench

**SIH 2026 - Problem Statement #117**

A complete on-premise agentic AI workbench with no external dependencies. Built for sovereignty, security, and compliance.

## 🌟 Features

### Core Capabilities
- **🤖 Agentic AI Workflows**: LangGraph-powered multi-step task execution
- **📚 Knowledge Base Management**: RAG with BGE-M3 embeddings + Qdrant vector DB
- **📄 Document Processing**: PDF, DOCX, TXT with OCR support (PaddleOCR)
- **🎨 Multimodal Analysis**: Image understanding with Qwen2.5-VL
- **🔧 Code Sandbox**: Isolated Python code execution
- **🔐 RBAC**: Admin, Operator, Analyst, Viewer roles
- **🌓 Dark/Light Mode**: Professional UI with sky blue accents
- **📊 Real-time Monitoring**: System health, task traces, audit logs
- **📦 DOCX Export**: Generate professional deliverables

### Security & Sovereignty
- ✅ 100% On-Premise - No external API calls
- ✅ Air-gapped capable
- ✅ Full audit trail
- ✅ Role-based access control
- ✅ Data sovereignty compliance

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   React     │────▶│   FastAPI    │────▶│  PostgreSQL │
│  Frontend   │     │   Backend    │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
            ┌────▼────┐         ┌───▼────┐
            │ Ollama  │         │ Qdrant │
            │  LLMs   │         │ Vector │
            └─────────┘         └────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 16GB+ RAM recommended
- GPU optional (CPU works fine for demo)

### 1. Clone and Setup

```bash
git clone <repository>
cd sih-sovereign-ai
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Start Services

```bash
docker-compose up -d
```

### 4. Pull Ollama Models (First Time)

```bash
# Access Ollama container
docker exec -it sih-ollama bash

# Pull models
ollama pull qwen:8b
ollama pull bge-m3

# Optional: vision and code models
ollama pull qwen:7b-vision
ollama pull qwen:8b-coder
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### 6. Login with Demo Accounts

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| Admin | `admin` | `demo123` | Full access |
| Operator | `operator` | `demo123` | Manage agents, KB, models |
| Analyst | `analyst` | `demo123` | Create tasks, upload docs |
| Viewer | `viewer` | `demo123` | Read-only |

## 📁 Project Structure

```
sih-sovereign-ai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # REST API endpoints
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── tools/          # Agent tools
│   ├── alembic/            # Database migrations
│   └── Dockerfile
│
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API clients
│   │   ├── hooks/          # Custom React hooks
│   │   ├── theme/          # Theme system
│   │   └── types/          # TypeScript types
│   └── Dockerfile
│
└── docker-compose.yml      # Orchestration
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (dark/light mode)
- **State**: Zustand
- **Routing**: React Router v6
- **HTTP**: Axios
- **Icons**: Lucide React
- **Export**: docx, jspdf

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.11+
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **LLM**: Ollama (Qwen3-8B, BGE-M3)
- **Vector DB**: Qdrant 2.7+
- **Agents**: LangGraph
- **Auth**: JWT + bcrypt
- **OCR**: PaddleOCR
- **Sandbox**: Docker SDK

## 🎯 Key Pages

### 1. Dashboard
- System health monitoring
- Quick actions
- Recent activity

### 2. Agent Workspace
- Create & configure agents
- Execute tasks with real-time trace
- View results & citations
- Export to DOCX

### 3. Knowledge Base
- Create collections
- Upload documents (PDF, DOCX, TXT)
- Automatic indexing & chunking
- RAG retrieval

### 4. Models
- View available models
- Switch active model
- Resource monitoring

### 5. Security Center (Admin Only)
- Sovereignty status
- Network monitoring
- Audit logs
- Export compliance report

## 🔒 Security Features

### Authentication
- JWT-based tokens
- Bcrypt password hashing
- Session management
- Role-based permissions

### Audit Trail
- All actions logged
- User, action, resource tracking
- IP address recording
- Filterable audit logs

### Data Protection
- No external API calls
- On-premise storage
- Encrypted connections
- Isolated code execution

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `POST /api/agents/{id}/query` - Execute task
- `GET /api/agents/{id}/task/{task_id}` - Get task status

### Knowledge Base
- `GET /api/knowledge-bases` - List KBs
- `POST /api/knowledge-bases` - Create KB
- `POST /api/documents/upload` - Upload document
- `POST /api/rag/query` - RAG search

### System
- `GET /api/health` - Health check
- `GET /api/models` - List models
- `GET /api/audit-logs` - View audit logs

## 🎨 Design System

### Colors
**Light Mode**: White (#ffffff) + Sky Blue (#0ea5e9)
**Dark Mode**: Dark Navy (#0f172a) + Sky Blue (#0ea5e9)

### Typography
- **Font**: Inter, Segoe UI
- **Code**: JetBrains Mono, Monaco

### Components
- **Border Radius**: 8px (cards), 12px (modals)
- **Shadows**: Soft & medium variants
- **Spacing**: 8px grid system

## 🧪 Development

### Backend Development

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sih_sovereign
OLLAMA_BASE_URL=http://localhost:11434
QDRANT_URL=http://localhost:6333
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Ollama Models Not Loading
```bash
docker exec -it sih-ollama bash
ollama pull qwen:8b
ollama pull bge-m3
```

### Database Connection Errors
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs sih-postgres
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📦 Production Deployment

1. Update `.env` files with production values
2. Set strong `SECRET_KEY`
3. Configure firewall rules
4. Enable HTTPS (add nginx reverse proxy)
5. Set up backup for PostgreSQL and Qdrant
6. Monitor logs and health endpoints

## 🎓 SIH 2026 Compliance

✅ **Fully On-Premise** - No cloud dependencies
✅ **Open Source Stack** - No proprietary software
✅ **Sovereignty** - Complete data control
✅ **Scalable** - Docker-based deployment
✅ **Secure** - RBAC + audit logging
✅ **Production Ready** - Health checks, error handling

## 📄 License

MIT License - See LICENSE file

## 👥 Team

Built for Smart India Hackathon 2026

## 🙏 Acknowledgments

- Ollama for local LLM serving
- Qdrant for vector search
- FastAPI & React communities

---

**Version**: 1.0.0  
**Last Updated**: August 2026  
**Status**: Production Ready ✅
