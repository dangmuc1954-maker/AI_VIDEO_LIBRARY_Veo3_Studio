@echo off
title AI VIDEO LIBRARY - Veo 3 Studio Launcher
cd /d "%~dp0"

echo ===================================================
echo     AI VIDEO LIBRARY - Creative AI Workflow Hub
echo     Author: Tris - 100%% Standalone & Independent
echo ===================================================
echo.

set "AFS_LICENSE_DEV_ALLOW=1"
set "NODE_ENV=production"

echo [*] Launching AI VIDEO LIBRARY GUI Window...
if exist "%~dp0electron_bin\electron.exe" (
    start "" "%~dp0electron_bin\electron.exe" "%~dp0app"
    echo.
    echo [OK] AI VIDEO LIBRARY has started in a new window!
    ping 127.0.0.1 -n 3 >nul
    exit
) else (
    start "" npx electron "%~dp0app"
    echo.
    echo [OK] AI VIDEO LIBRARY launched via npx!
    ping 127.0.0.1 -n 3 >nul
    exit
)
