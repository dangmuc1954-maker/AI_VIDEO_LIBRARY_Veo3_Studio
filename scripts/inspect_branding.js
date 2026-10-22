const fs = require('fs');
const path = require('path');

function search(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory()) search(full);
    else if (f.name.endsWith('.js') || f.name.endsWith('.html') || f.name.endsWith('.json')) {
      const code = fs.readFileSync(full, 'utf8');
      const matches = code.match(/AIForge|aiforge|AIForgeStudio|aitoolforge/gi);
      if (matches) {
        console.log(`Found ${matches.length} branding occurrences in: ${full}`);
      }
    }
  }
}

console.log('--- Searching renderer ---');
search(path.join(__dirname, '../app/out/renderer'));
console.log('--- Searching main ---');
search(path.join(__dirname, '../app/out/main'));
