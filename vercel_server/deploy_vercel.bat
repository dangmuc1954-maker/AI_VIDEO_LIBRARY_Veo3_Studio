@echo off
title Deploy AIForge License Server to Vercel
echo ======================================================================
echo  DANG TRIEN KHAI LICENSE SERVER LEN VERCEL SERVERLESS CLOUD 
echo ======================================================================
cd /d "%~dp0"
node -e "
const fs = require('fs');
const { execSync } = require('child_process');
try {
  const auth = JSON.parse(fs.readFileSync('C:/Users/admin/AppData/Roaming/com.vercel.cli/Data/auth.json'));
  console.log('🚀 Dang deploy voi token he thong...');
  execSync('npx -y vercel --prod --token ' + auth.token + ' --yes', { stdio: 'inherit' });
} catch (e) {
  console.log('⚠️ Chay vercel truc tiep...');
  execSync('npx -y vercel --prod', { stdio: 'inherit' });
}
"
echo ======================================================================
echo  HOAN TAT DEPLOY LEN VERCEL PRODUCTION!
echo ======================================================================
pause
