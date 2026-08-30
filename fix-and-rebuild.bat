@echo off
echo ============================================
echo  FIX AND REBUILD FRONTEND
echo ============================================
echo.
echo Fixed: Changed npm ci to npm install
echo Now rebuilding...
echo.

cd "f:\SIH 2026\sih-sovereign-ai"

echo [Step 1/3] Removing old image...
docker rmi sih-sovereign-ai-frontend 2>nul
echo.

echo [Step 2/3] Building frontend with fix...
docker-compose build frontend
echo.

echo [Step 3/3] Starting frontend...
docker-compose up -d frontend
echo.

echo Waiting 10 seconds...
timeout /t 10 /nobreak >nul
echo.

echo Testing frontend...
docker exec sih-frontend ls -la /usr/share/nginx/html
echo.

echo ============================================
echo  BUILD COMPLETE!
echo ============================================
echo.
echo Open http://localhost:3000 in your browser
echo Press Ctrl+Shift+R to hard refresh
echo.
pause
