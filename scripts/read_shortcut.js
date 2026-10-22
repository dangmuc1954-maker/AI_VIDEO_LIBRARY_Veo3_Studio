const { execSync } = require('child_process');
const fs = require('fs');

const psScript = `
$w = New-Object -ComObject WScript.Shell
$sc = $w.CreateShortcut('C:\\Users\\admin\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\AIForge Studio.lnk')
Write-Output $sc.TargetPath
Write-Output $sc.WorkingDirectory
`;
fs.writeFileSync('temp_sc.ps1', psScript, 'utf8');
try {
  const out = execSync('powershell -ExecutionPolicy Bypass -File temp_sc.ps1').toString();
  console.log('Shortcut Target:\n' + out);
} finally {
  if (fs.existsSync('temp_sc.ps1')) fs.unlinkSync('temp_sc.ps1');
}
