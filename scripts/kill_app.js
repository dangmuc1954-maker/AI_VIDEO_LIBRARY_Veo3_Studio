const cp = require('child_process');
try {
  cp.execSync('powershell -Command "Get-Process -Name \'AI VIDEO LIBRARY\' -ErrorAction SilentlyContinue | Stop-Process -Force"', { stdio: 'ignore' });
} catch (e) {}
try {
  cp.execSync('taskkill /F /IM "AI VIDEO LIBRARY.exe"', { stdio: 'ignore' });
} catch (e) {}
console.log('Done stopping processes cleanly!');
