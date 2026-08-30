# 🔧 Frontend Port Fix

## Problem Found!
The frontend is running on port 3000 inside the container, but Docker was mapping `3000:80` (host:container).

## ✅ FIXED!
Changed docker-compose.yml to map `3000:3000` correctly.

---

## 🚀 Apply the Fix

### Option 1: Run the Script

```bash
cd f:\SIH 2026\sih-sovereign-ai
restart-frontend.bat
```

### Option 2: Manual Commands

```bash
cd f:\SIH 2026\sih-sovereign-ai

docker-compose stop frontend
docker-compose rm -f frontend
docker-compose up -d frontend

timeout /t 5
```

---

## ✅ Expected Result

After restarting, open your browser:

**http://localhost:3000**

You should see the **Sovereign AI Workbench Login Page** with:
- Demo account selector
- Login form
- Dark/light theme toggle (top-right)

---

## 🎉 Then Login

Use any of these demo accounts:
- **admin** / demo123
- **operator** / demo123
- **analyst** / demo123
- **viewer** / demo123

---

**Run `restart-frontend.bat` now!**

