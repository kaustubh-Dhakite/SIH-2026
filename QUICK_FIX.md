# 🔧 Quick Database Password Fix

## Problem
PostgreSQL authentication is failing because the password in the old volume doesn't match the configuration.

## ✅ QUICK FIX - Run This Script

```bash
cd "f:\SIH 2026\sih-sovereign-ai"
fix-database.bat
```

This will:
1. Stop PostgreSQL
2. Remove old container and volume
3. Create fresh PostgreSQL with correct password
4. Restart backend
5. Test health endpoint

**Time:** ~30 seconds

---

## OR Manual Commands

If you prefer to run commands one by one:

```bash
cd "f:\SIH 2026\sih-sovereign-ai"

# 1. Stop and remove PostgreSQL
docker-compose stop postgres
docker-compose rm -f postgres

# 2. Remove old volume with wrong password
docker volume rm sih-sovereign-ai_postgres_data

# 3. Start fresh PostgreSQL
docker-compose up -d postgres

# 4. Wait for it to initialize (15 seconds)
timeout /t 15

# 5. Restart backend to reconnect
docker-compose restart backend

# 6. Wait for backend (10 seconds)
timeout /t 10

# 7. Test health
curl http://localhost:8000/api/health
```

---

## ✅ Expected Result

After running the fix, health check should show:

```json
{
  "status": "healthy",
  "services": {
    "database": "healthy",
    "ollama": "UP",
    "qdrant": "UP",
    "ocr": "healthy"
  }
}
```

All services should be "healthy" or "UP"!

---

## Why This Happened

PostgreSQL stores its password in a Docker volume. When you first ran the containers, it created a volume with a password. Later changes to the password in `docker-compose.yml` or `.env` don't affect the existing volume.

**Solution:** Remove the volume and recreate the container.

---

## ⚠️ Note

This will delete any existing data in the database (which is fine since we're using demo accounts that are created automatically on startup).

---

## After Fix - Test the App

1. Open http://localhost:3000
2. Login: `admin` / `demo123`
3. Try creating an agent task
4. Upload a document
5. Everything should work now! ✅

---

**Run `fix-database.bat` now to resolve this issue!**

