@echo off
title TimeLens Public Production Server
echo ============================================================
echo        STARTING TIMELENS PRODUCTION SERVER (PORT 5000)
echo ============================================================
cd /d "%~dp0"

:: Start Backend + Built Frontend Server in background
start "TimeLens Server" /min cmd /c "cd backend && node server.js"

:: Wait 3 seconds for PostgreSQL & Express to initialize
timeout /t 3 /nobreak >nul

echo.
echo ============================================================
echo        LAUNCHING PUBLIC HTTPS URL (CLOUDFLARE TUNNEL)
echo   Keep this window minimized while sharing your public URL!
echo ============================================================
npx --yes cloudflared tunnel --url http://localhost:5000
pause
