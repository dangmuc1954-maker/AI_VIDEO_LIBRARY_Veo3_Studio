const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA';
if (!fs.existsSync(targetDir)) {
  console.log('Target dir does not exist');
  process.exit(0);
}

const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.json'));
for (const f of files) {
  try {
    const filePath = path.join(targetDir, f);
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    console.log('File:', f, 'Keys:', Object.keys(json).slice(0, 10));
    if (f.includes('browser') || f.includes('session') || f.includes('state')) {
      const str = JSON.stringify(json);
      const matches = str.match(/"(providerId|provider|service|type|apiKey|token)":\s*"[^"]+"/gi) || [];
      if (matches.length > 0) {
        console.log('  Matches in', f, ':', [...new Set(matches)]);
      }
    }
  } catch (e) {
    // console.log(f, e.message);
  }
}
