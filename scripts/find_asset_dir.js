const fs = require('fs');
const path = require('path');
const os = require('os');

const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

console.log('Searching for video assets in AppData...');
const possibleDirs = [
  path.join(appData, 'AI_VIDEO_LIBRARY_DATA'),
  path.join(appData, 'aiforge-studio'),
  path.join(appData, 'AI VIDEO LIBRARY'),
  path.join(localAppData, 'Programs', 'AI VIDEO LIBRARY'),
  'D:/dự án antigravity/AIForge_Veo3_Studio/app/userData'
];

for (const dir of possibleDirs) {
  if (fs.existsSync(dir)) {
    console.log('Exists:', dir);
    try {
      const list = fs.readdirSync(dir);
      console.log('  Contents:', list.slice(0, 10));
    } catch (e) {
      console.log('  Error:', e.message);
    }
  }
}
