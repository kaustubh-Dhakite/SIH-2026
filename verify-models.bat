@echo off
echo ============================================
echo  MODEL VERIFICATION SCRIPT
echo ============================================
echo.

echo [Step 1/5] Checking installed models...
echo.
docker exec -it sih-ollama ollama list
echo.

echo [Step 2/5] Restarting backend to load new config...
echo.
docker-compose restart backend
echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul
echo.

echo [Step 3/5] Checking backend logs for errors...
echo.
docker logs sih-backend --tail 30
echo.

echo [Step 4/5] Testing health endpoint...
echo.
curl -s http://localhost:8000/api/health
echo.
echo.

echo [Step 5/5] Quick model test...
echo Type "Hello!" to test qwen2.5:7b (press Ctrl+C to skip)
echo.
docker exec -it sih-ollama ollama run qwen2.5:7b "Say hello in one sentence"
echo.

echo ============================================
echo  VERIFICATION COMPLETE!
echo ============================================
echo.
echo Next steps:
echo 1. Open http://localhost:3000 in your browser
echo 2. Login with: admin / demo123
echo 3. Go to Agent Workspace and try a query!
echo.
pause
