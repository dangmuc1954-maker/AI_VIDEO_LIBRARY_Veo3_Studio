const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
  try {
    for (const f of fs.readdirSync(dir)) {
      if (f === 'node_modules' || f === '.git' || f === 'electron_bin') continue;
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        searchInDir(p, pattern);
      } else if (stat.isFile() && (f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.cjs') || f.endsWith('.html') || f.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(p, 'utf8');
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            console.log(`Found in: ${p}`);
            let idx = 0;
            while ((idx = content.toLowerCase().indexOf(pattern.toLowerCase(), idx)) !== -1) {
              console.log(content.slice(Math.max(0, idx - 80), idx + 120));
              idx += pattern.length;
            }
          }
        } catch(e) {}
      }
    }
  } catch(e) {}
}

console.log('=== SEARCHING: "Video Upscale" ===');
searchInDir('.', 'Video Upscale');

console.log('=== SEARCHING: "does not include" ===');
searchInDir('.', 'does not include');
