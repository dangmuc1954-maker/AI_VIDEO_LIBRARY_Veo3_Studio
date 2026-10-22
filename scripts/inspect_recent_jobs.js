const fs = require('fs');
const path = require('path');

function searchDir(d, q) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, f.name);
    if (f.isDirectory()) {
      if (f.name !== 'node_modules' && f.name !== '.git') searchDir(full, q);
    } else if (f.name.endsWith('.js') || f.name.endsWith('.cjs')) {
      const c = fs.readFileSync(full, 'utf8');
      let idx = 0;
      while ((idx = c.indexOf(q, idx)) !== -1) {
        console.log('Found "' + q + '" in', full, 'at', idx);
        console.log('Snippet:', c.slice(idx - 50, idx + 100));
        idx += q.length + 10;
      }
    }
  }
}

searchDir('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app', 'allows up to');
searchDir('app/out', 'allows up to');
