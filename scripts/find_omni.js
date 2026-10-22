const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(fullPath, query);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let idx = 0;
      while ((idx = content.toLowerCase().indexOf(query.toLowerCase(), idx)) !== -1) {
        console.log(`Match in ${fullPath} at ${idx}:`);
        console.log(content.substring(Math.max(0, idx - 80), Math.min(content.length, idx + 120)));
        idx += query.length;
      }
    }
  }
}

searchDir(path.join(__dirname, '../app/out'), 'Omni');
