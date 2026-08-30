@echo off
echo ============================================
echo  DATABASE PASSWORD FIX
echo ============================================
echo.
echo This will recreate the PostgreSQL container
echo with the correct password.
echo.
pause

cd "f:\SIH 2026\sih-sovereign-ai"

echo [Step 1/6] Stopping PostgreSQL container...
docker-compose stop postgres
echo.

echo [Step 2/6] Removing old container...
docker-compose rm -f postgres
echo.

echo [Step 3/6] Removing old data volume...
docker volume rm sih-sovereign-ai_postgres_data
echo.

echo [Step 4/6] Starting fresh PostgreSQL container...
docker-compose up -d postgres
echo Waiting 15 seconds for PostgreSQL to initialize...
timeout /t 15 /nobreak >nul
echo.

echo [Step 5/6] Restarting backend...
docker-compose restart backend
echo Waiting 10 seconds for backend to connect...
timeout /t 10 /nobreak >nul
echo.

echo [Step 6/6] Testing health endpoint...
echo.
curl -s http://localhost:8000/api/health
echo.
echo.

echo ============================================
echo  FIX COMPLETE!
echo ============================================
echo.
echo If all services show "healthy", you're good to go!
echo Open http://localhost:3000 to test the app.
echo.
pause
