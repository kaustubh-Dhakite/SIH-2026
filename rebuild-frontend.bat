@echo off
echo ============================================
echo  REBUILD FRONTEND FROM SCRATCH
echo ============================================
echo.
echo This will rebuild the frontend container
echo to fix CSS/styling issues.
echo.
pause

cd "f:\SIH 2026\sih-sovereign-ai"

echo [Step 1/5] Stopping frontend...
docker-compose stop frontend
echo.

echo [Step 2/5] Removing old container...
docker-compose rm -f frontend
echo.

echo [Step 3/5] Removing old image...
docker rmi sih-sovereign-ai-frontend
echo.

echo [Step 4/5] Rebuilding frontend (no cache)...
docker-compose build --no-cache frontend
echo.

echo [Step 5/5] Starting new frontend...
docker-compose up -d frontend
echo.

echo Waiting 10 seconds for startup...
timeout /t 10 /nobreak >nul
echo.

echo ============================================
echo  REBUILD COMPLETE!
echo ============================================
echo.
echo Clear your browser cache (Ctrl+Shift+Delete)
echo Then open: http://localhost:3000
echo.
pause
