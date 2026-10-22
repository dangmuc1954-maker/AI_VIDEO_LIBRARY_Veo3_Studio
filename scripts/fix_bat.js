const fs = require('fs');
const content = `@echo off
title XIENG NUONG BE HUYEN - POS 20 BAN
cls
echo ============================================================
echo   XIENG NUONG BE HUYEN - HE THONG POS 20 BAN & ORDER
echo ============================================================
echo.
echo [1] Dang mo trinh duyet...
start "" http://localhost:3000
echo [2] Dang khoi dong may chu...
node server.js
pause
`;
fs.writeFileSync('d:/dự án antigravity/Xieng_Nuong_Be_Huyen/START_QUAN_AN.bat', content, 'utf-8');
console.log('Fixed BAT file successfully!');
