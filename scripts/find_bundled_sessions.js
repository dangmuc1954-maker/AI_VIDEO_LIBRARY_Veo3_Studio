const fs = require('fs');
const path = require('path');

const targetDirs = [
  'app/out',
  'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0',
  'dist/AI_VIDEO_LIBRARY_Customer_Edition'
];

for (const d of targetDirs) {
  console.log(`Checking in ${d}:`);
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.name.includes('browser-session') || ent.name.includes('session')) {
        console.log('  Found file:', full);
      }
    }
  }
  walk(d);
}
