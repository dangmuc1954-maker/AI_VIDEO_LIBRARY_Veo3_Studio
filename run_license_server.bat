@echo off
title AIForge License Server Management
cd /d "%~dp0"

echo ===================================================
echo     AIForge Commercial License Server
echo     Admin Dashboard: http://localhost:8787/admin
echo ===================================================
echo.

node license_server\server.js
pause
