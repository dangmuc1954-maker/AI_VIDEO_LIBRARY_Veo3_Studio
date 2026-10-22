const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      searchInDir(full, pattern);
    } else if (ent.isFile() && (full.endsWith('.js') || full.endsWith('.cjs') || full.endsWith('.json') || full.endsWith('.html'))) {
      try {
        const content = fs.readFileSync(full, 'utf8');
        if (content.includes(pattern)) {
          console.log(`Found "${pattern}" in: ${full}`);
        }
      } catch {}
    }
  }
}

console.log('=== Searching in scratch/zip3_source_app ===');
searchInDir('scratch/zip3_source_app', 'video-script-extract');
