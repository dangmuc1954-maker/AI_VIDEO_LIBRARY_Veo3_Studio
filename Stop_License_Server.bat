@echo off
title Stop License Server
echo [*] Stopping background License Server...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8787 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)
echo [OK] License Server has been stopped!
timeout /t 2 >nul
