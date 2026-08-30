# ✅ Models Verification Checklist

## Status: READY TO VERIFY

### Downloaded Models ✅
- ✅ qwen2.5:7b (4.7GB) - Main language model
- ✅ nomic-embed-text (274MB) - Embeddings
- ✅ llava:7b (4.7GB) - Vision model

### Configuration ✅
- ✅ backend/.env created with correct model names
- ✅ verify-models.bat script created

---

## 🚀 QUICK START - Run This Now

```bash
cd "f:\SIH 2026\sih-sovereign-ai"
verify-models.bat
```

This will:
1. Show your installed models
2. Restart backend with new config
3. Check logs for errors
4. Test health endpoint
5. Quick model test

---

## OR Manual Commands

```bash
# 1. Verify models
docker exec -it sih-ollama ollama list

# 2. Restart backend
cd "f:\SIH 2026\sih-sovereign-ai"
docker-compose restart backend

# 3. Wait 10 seconds, then check health
timeout /t 10
curl http://localhost:8000/api/health

# 4. Check logs
docker logs sih-backend --tail 50
```

---

## ✅ Success Indicators

### Models List Should Show:
```
qwen2.5:7b       4.7 GB
nomic-embed-text 274 MB
llava:7b         4.7 GB
```

### Health Endpoint Should Return:
```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "ollama": "healthy",
    "qdrant": "healthy",
    "ocr": "healthy"
  }
}
```

### Backend Logs Should Show:
- ✅ "Qdrant client initialized"
- ✅ "Application startup complete"
- ❌ No errors about models

---

## 🎯 Test the Application

After verification passes:

1. Open http://localhost:3000
2. Login: `admin` / `demo123`
3. Go to **Agent Workspace**
4. Try query: "Explain how neural networks work"
5. Watch qwen2.5:7b generate a professional response!

---

## 📞 If Something's Wrong

### Models not found in `ollama list`
```bash
# Re-download
docker exec -it sih-ollama ollama pull qwen2.5:7b
docker exec -it sih-ollama ollama pull nomic-embed-text
docker exec -it sih-ollama ollama pull llava:7b
```

### Backend errors
```bash
# Check .env exists
dir backend\.env

# Full restart
docker-compose down
docker-compose up -d

# Wait 30 seconds
timeout /t 30

# Check status
docker-compose ps
```

### Health check fails
```bash
# Check all containers running
docker-compose ps

# Check backend logs
docker logs sih-backend --tail 100

# Check Ollama logs
docker logs sih-ollama --tail 50
```

---

## 📊 Expected Performance

With qwen2.5:7b you'll get:
- 🎯 High-quality, coherent responses
- 🚀 Professional demo-ready output
- 🧠 Good reasoning capabilities
- 📝 Excellent code generation

---

**Ready to verify? Run:** `verify-models.bat`

