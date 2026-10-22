const fs = require('fs');
const path = require('path');
const os = require('os');

// Usually Electron app data is in %APPDATA%/AIForge_Veo3_Studio or similar, or C:\Users\admin\AppData\Roaming\...
const appData = process.env.APPDATA;
console.log('APPDATA path:', appData);

const dirs = fs.readdirSync(appData).filter(d => d.toLowerCase().includes('video') || d.toLowerCase().includes('veo') || d.toLowerCase().includes('studio') || d.toLowerCase().includes('aiforge'));
console.log('Matching app dirs:', dirs);

for (const d of dirs) {
  const p = path.join(appData, d, 'browser-sessions.json');
  if (fs.existsSync(p)) {
    console.log('Found browser-sessions.json in', d);
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log('Sessions:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Error reading:', e.message);
    }
  }
  const cp = path.join(appData, d, 'custom-browser-providers.json');
  if (fs.existsSync(cp)) {
    console.log('Found custom-browser-providers.json in', d);
    try {
      const data = JSON.parse(fs.readFileSync(cp, 'utf8'));
      console.log('Custom providers:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Error reading:', e.message);
    }
  }
}
