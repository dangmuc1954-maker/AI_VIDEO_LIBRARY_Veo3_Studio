const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      search(full);
    } else if (f.name.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      let pos = 0;
      while ((pos = code.indexOf('type:"Video"', pos)) !== -1) {
        console.log(`[type:"Video"] in ${full} at ${pos}:`);
        console.log(code.substring(Math.max(0, pos - 80), Math.min(code.length, pos + 250)));
        console.log('---');
        pos += 12;
      }
    }
  }
}

search('app');
