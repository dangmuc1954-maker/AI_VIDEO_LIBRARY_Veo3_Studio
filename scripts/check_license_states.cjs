const fs = require('fs');
const path = require('path');

const dirs = [
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio',
  'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY',
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA',
  'C:\\Users\\admin\\AppData\\Roaming\\ai-video-library',
  'C:\\Users\\admin\\AppData\\Roaming\\veo3-studio-pro'
];

for (const d of dirs) {
  console.log('--- Checking:', d);
  try {
    const f1 = path.join(d, 'license-state.production.json');
    if (fs.existsSync(f1)) {
      console.log('license-state.production.json:');
      const data = JSON.parse(fs.readFileSync(f1, 'utf-8'));
      console.log(JSON.stringify(data, null, 2));
    }
  } catch(e) { console.error(e.message); }
}
