# ✅ Deployment Checklist

Use this checklist to verify everything is working before your SIH 2026 demo.

## Pre-Deployment

- [ ] Docker and Docker Compose installed
- [ ] Port 3000, 8000, 5432, 6333, 11434 are available
- [ ] At least 16GB RAM available
- [ ] 20GB disk space available

## First-Time Setup

```bash
cd "f:\SIH 2026\sih-sovereign-ai"
```

- [ ] Created `.env` files from examples
  ```bash
  copy backend\.env.example backend\.env
  copy frontend\.env.example frontend\.env
  ```

- [ ] Started services
  ```bash
  docker-compose up -d
  ```

- [ ] Pulled Ollama models
  ```bash
  docker exec -it sih-ollama ollama pull qwen:8b
  docker exec -it sih-ollama ollama pull bge-m3
  ```

- [ ] Verified all containers running
  ```bash
  docker-compose ps
  ```

## Service Health Checks

- [ ] Backend API responding: http://localhost:8000/api/health
- [ ] Frontend loading: http://localhost:3000
- [ ] API docs accessible: http://localhost:8000/docs
- [ ] PostgreSQL running (check docker logs)
- [ ] Qdrant accessible: http://localhost:6333
- [ ] Ollama accessible: http://localhost:11434

## Authentication Testing

- [ ] Login page loads correctly
- [ ] Demo accounts selector expands/collapses
- [ ] Can login with admin/demo123
- [ ] Can login with operator/demo123
- [ ] Can login with analyst/demo123
- [ ] Can login with viewer/demo123
- [ ] Token stored in localStorage
- [ ] Logout redirects to login

## Theme System Testing

- [ ] Light mode displays correctly (default)
- [ ] Dark mode toggle visible (top-right corner)
- [ ] Clicking toggle switches to dark mode
- [ ] Dark mode applies to all pages
- [ ] Theme persists after page refresh
- [ ] Theme stored in localStorage

## Page Access Testing (as Admin)

- [ ] Dashboard loads with system health
- [ ] Knowledge Base page accessible
- [ ] Agent Workspace page accessible
- [ ] Documents page accessible
- [ ] Models page accessible
- [ ] Multimodal page accessible
- [ ] Tools page accessible
- [ ] Audit Logs page accessible
- [ ] Security Center page accessible (admin only)
- [ ] Settings page accessible

## Role-Based Access Control

### As Viewer (viewer/demo123)
- [ ] Can access Dashboard
- [ ] Can access Documents (read-only)
- [ ] Can access Models (view only)
- [ ] Can access Audit Logs (own actions only)
- [ ] Can access Settings
- [ ] CANNOT access Agent Workspace
- [ ] CANNOT access Knowledge Base
- [ ] CANNOT access Multimodal
- [ ] CANNOT access Tools
- [ ] CANNOT access Security Center

### As Analyst (analyst/demo123)
- [ ] Can create agents
- [ ] Can upload documents
- [ ] Can execute tasks
- [ ] Can export results
- [ ] CANNOT access Security Center
- [ ] CANNOT switch models

### As Operator (operator/demo123)
- [ ] Can manage agents
- [ ] Can manage knowledge bases
- [ ] Can switch models
- [ ] Can view all audit logs
- [ ] CANNOT access Security Center

### As Admin (admin/demo123)
- [ ] Full access to all pages
- [ ] Can access Security Center
- [ ] Can export sovereignty report
- [ ] Can modify system settings

## Feature Testing

### Knowledge Base
- [ ] Can create new collection
- [ ] Can upload PDF document
- [ ] Document shows "processing" status
- [ ] Document changes to "indexed" status
- [ ] Can view documents in collection
- [ ] Can delete document
- [ ] Can filter documents

### Agent Workspace
- [ ] Can select agent
- [ ] Can enter query
- [ ] Can select knowledge bases
- [ ] Can execute task
- [ ] Trace animation displays
- [ ] Steps show with icons (running/completed)
- [ ] Results display after completion
- [ ] Can export to DOCX
- [ ] DOCX file downloads successfully
- [ ] Can copy result to clipboard

### Documents Page
- [ ] Lists all documents
- [ ] Can search documents
- [ ] Can filter by collection
- [ ] Can filter by type (PDF/DOCX/TXT)
- [ ] Can filter by status
- [ ] Can switch between list/grid view
- [ ] Can delete documents

### Models Page
- [ ] Displays all models (Qwen3-8B, BGE-M3, etc.)
- [ ] Shows model status (ready/loading)
- [ ] Shows current active model
- [ ] Can view model info modal
- [ ] Can switch models (admin/operator only)
- [ ] Switch disabled for analyst/viewer

### Multimodal Page
- [ ] Can upload image
- [ ] Image preview displays
- [ ] Can select task type (OCR/Description)
- [ ] Can analyze image
- [ ] Results display
- [ ] Can export results

### Tools Page
- [ ] Lists all tools
- [ ] Shows tool status
- [ ] Can test tool
- [ ] Test modal opens
- [ ] Can execute test
- [ ] Results display

### Audit Logs Page
- [ ] Displays log entries
- [ ] Can search logs
- [ ] Can filter by action
- [ ] Can filter by status
- [ ] Pagination works
- [ ] Admin sees all logs
- [ ] Viewer sees only own logs

### Settings Page
- [ ] Can view account info
- [ ] Can update email
- [ ] Can change password
- [ ] Admin sees system settings
- [ ] Non-admin doesn't see system settings

### Security Center (Admin Only)
- [ ] Shows sovereignty status (SECURE)
- [ ] Displays security metrics
- [ ] Shows 0 external calls
- [ ] Shows firewall rules
- [ ] Can export sovereignty report
- [ ] PDF downloads successfully
- [ ] Non-admin redirected on direct access

## UI/UX Verification

- [ ] No console errors in browser
- [ ] All buttons have hover states
- [ ] Loading spinners show during operations
- [ ] Success toasts appear for actions
- [ ] Error toasts appear for failures
- [ ] Modals open and close smoothly
- [ ] Forms validate input
- [ ] Responsive layout (1920×1080)
- [ ] Text is readable in both themes
- [ ] Icons display correctly
- [ ] Badges colored appropriately

## Performance Checks

- [ ] Pages load in < 2 seconds
- [ ] API responses in < 1 second
- [ ] File upload works for files up to 10MB
- [ ] No memory leaks (check browser dev tools)
- [ ] Docker containers not consuming excessive CPU
- [ ] Database queries optimized

## Production Readiness

- [ ] All environment variables configured
- [ ] Secret keys changed from defaults
- [ ] CORS origins properly set
- [ ] Database migrations applied
- [ ] Docker volumes persist data
- [ ] Logs accessible via docker-compose logs
- [ ] Health endpoints responding
- [ ] Error handling works properly

## Final Demo Preparation

- [ ] Clear browser cache
- [ ] Reset to light mode (default)
- [ ] Logout all users
- [ ] Verify demo accounts work
- [ ] Prepare sample documents for upload
- [ ] Prepare sample queries for agents
- [ ] Test complete user journey (login → upload → execute → export)
- [ ] Verify dark mode toggle multiple times
- [ ] Check all 4 roles in quick succession
- [ ] Practice explaining sovereignty features

## Common Issues & Solutions

### Issue: Ollama models not found
**Solution:**
```bash
docker exec -it sih-ollama bash
ollama pull qwen:8b
ollama pull bge-m3
```

### Issue: Frontend can't connect to backend
**Solution:** Check CORS settings in backend/.env

### Issue: Database connection error
**Solution:**
```bash
docker-compose restart postgres
docker-compose restart backend
```

### Issue: Theme toggle not working
**Solution:** Clear browser localStorage and refresh

### Issue: Documents stuck in "processing"
**Solution:** Check Qdrant and Ollama are running

## Success Criteria

✅ All services running
✅ All demo accounts working
✅ Dark/light mode toggle working
✅ All pages accessible based on role
✅ Can upload and process documents
✅ Can execute agent tasks with trace
✅ Can export DOCX files
✅ Security Center shows 0 external calls
✅ No console errors
✅ Professional appearance

---

**When all boxes are checked, you're ready for demo! 🎉**
