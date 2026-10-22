const crypto = require('crypto');
const { execSync } = require('child_process');

function readWindowsUuid() {
  const commands = [
    'powershell.exe -NoLogo -NoProfile -NonInteractive -Command "(Get-CimInstance -ClassName Win32_ComputerSystemProduct -ErrorAction Stop).UUID"',
    'wmic.exe csproduct get UUID'
  ];
  for (const cmd of commands) {
    try {
      const out = execSync(cmd).toString().trim();
      const lines = out.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const uuid = lines.find(l => l.length > 20 && !l.toLowerCase().includes('uuid'));
      if (uuid) return uuid;
    } catch(e) {}
  }
  return '';
}

const uuid = readWindowsUuid();
console.log('UUID:', uuid);
const salt = 'aiforge-studio'; // or check Cy in main/index.js
// Check Cy in main/index.js
const fs = require('fs');
const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const cyMatch = main.match(/update\(\`\$\{([a-zA-Z0-9_$]+)\}:/);
let cyVal = 'ai-video-library';
if (cyMatch) {
  const varName = cyMatch[1];
  const valMatch = main.match(new RegExp(`const ${varName}="([^"]+)"`));
  if (valMatch) cyVal = valMatch[1];
}
console.log('Salt (Cy):', cyVal);

const hwid = crypto.createHash('sha256').update(`${cyVal}:win32:${uuid}`).digest('hex');
console.log('Calculated Machine Code:', hwid);
console.log('Short code:', (hwid.slice(0, 8) + '...' + hwid.slice(-4)).toUpperCase());
