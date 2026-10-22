const fs = require('fs');
const cp = require('child_process');

try {
  const ps = `(New-Object -ComObject WScript.Shell).CreateShortcut('C:\\Users\\admin\\Desktop\\AIForge Studio.lnk').TargetPath`;
  const target = cp.execSync(`powershell -NoProfile -Command "${ps}"`, { encoding: 'utf8' }).trim();
  console.log('Original App Target:', target);
} catch (e) {
  console.error(e.message);
}
