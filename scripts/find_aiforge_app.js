const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const psCmd = `$sh = New-Object -ComObject WScript.Shell
$sc = $sh.CreateShortcut('C:\\Users\\admin\\Desktop\\AIForge Studio.lnk')
$sc.TargetPath
`;

fs.writeFileSync('scripts/get_target.ps1', psCmd, 'utf8');

try {
  const target = execSync('powershell -ExecutionPolicy Bypass -File scripts/get_target.ps1', { encoding: 'utf8' }).trim();
  console.log('TARGET:', target);
  if (target && fs.existsSync(target)) {
    const dir = path.dirname(target);
    console.log('App dir:', dir);
    const resourcesApp = path.join(dir, 'resources', 'app');
    const resourcesAsar = path.join(dir, 'resources', 'app.asar');
    console.log('resources/app exists:', fs.existsSync(resourcesApp));
    console.log('resources/app.asar exists:', fs.existsSync(resourcesAsar));
  }
} catch (e) {
  console.error('Error:', e.message);
}
