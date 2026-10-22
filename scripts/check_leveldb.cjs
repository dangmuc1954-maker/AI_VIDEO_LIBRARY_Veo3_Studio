const fs = require('fs');
const path = require('path');

const levelDirs = [
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio\\Local Storage\\leveldb',
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio\\IndexedDB',
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\Local Storage\\leveldb',
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\IndexedDB'
];

for (const ld of levelDirs) {
  if (fs.existsSync(ld)) {
    console.log('Checking:', ld);
    try {
      const files = fs.readdirSync(ld);
      for (const f of files) {
        if (f.endsWith('.ldb') || f.endsWith('.log')) {
          const full = path.join(ld, f);
          const buf = fs.readFileSync(full);
          const str = buf.toString('latin1');
          if (str.includes('Công Xưởng') || str.includes('Người Que') || str.includes('Gối Chặn') || str.includes('Thợ Điện')) {
            console.log(`Found match in ${full}!`);
          }
        }
      }
    } catch(e) {}
  }
}
console.log('Done leveldb check.');
