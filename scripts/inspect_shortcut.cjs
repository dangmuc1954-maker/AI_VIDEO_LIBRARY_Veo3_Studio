const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const psCmd = `powershell -NoProfile -Command "$s = (New-Object -ComObject WScript.Shell).CreateShortcut('C:\\Users\\admin\\Desktop\\AIForge Studio.lnk'); Write-Output $s.TargetPath; Write-Output $s.WorkingDirectory"`;
  const res = execSync(psCmd, { encoding: 'utf-8' });
  console.log('Shortcut info:\n', res);
} catch (e) {
  console.error(e);
}
