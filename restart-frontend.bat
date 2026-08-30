@echo off
echo ============================================
echo  RESTARTING FRONTEND WITH CORRECT PORT
echo ============================================
echo.

cd "f:\SIH 2026\sih-sovereign-ai"

echo [Step 1/3] Stopping frontend...
docker-compose stop frontend
echo.

echo [Step 2/3] Removing old container...
docker-compose rm -f frontend
echo.

echo [Step 3/3] Starting frontend with correct port...
docker-compose up -d frontend
echo.

echo Waiting 5 seconds...
timeout /t 5 /nobreak >nul
echo.

echo ============================================
echo  FRONTEND RESTARTED!
echo ============================================
echo.
echo Open http://localhost:3000 in your browser
echo You should now see the login page!
echo.
pause
