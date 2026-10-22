const fs = require('fs');
const path = require('path');

function searchDir(dir, term) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.includes('node_modules') && !entry.name.includes('.git')) {
        searchDir(full, term);
      }
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.cjs') || entry.name.endsWith('.json')) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(term)) {
          console.log(`FOUND in ${full}!`);
          const idx = content.indexOf(term);
          console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 300)));
        }
      } catch (e) {}
    }
  }
}

console.log('Searching for "authentication is no longer valid"...');
searchDir('.', 'authentication is no longer valid');

console.log('\nSearching for "no longer valid"...');
searchDir('.', 'no longer valid');
