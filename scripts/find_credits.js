const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) searchDir(p);
    else if (f.name.endsWith('.js')) {
      const code = fs.readFileSync(p, 'utf8');
      if (code.includes('pE=') || code.includes('4s":7') || code.includes('"4s":7')) {
        console.log('Found match in:', p);
      }
    }
  }
}

searchDir(path.join(__dirname, '../app/out'));
searchDir(path.join(__dirname, '../extracted_original/out'));
searchDir(path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out'));
