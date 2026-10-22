const fs = require('fs');
const path = require('path');

function searchInDir(dir, terms) {
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const f of files) {
    if (f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.cjs') || f.name.endsWith('.html'))) {
      const full = path.join(f.parentPath || f.path, f.name);
      const content = fs.readFileSync(full, 'utf8');
      terms.forEach(term => {
        if (content.includes(term)) {
          console.log(`Found [${term}] in ${f.name}`);
        }
      });
    }
  }
}

console.log('=== SEARCHING IN ZIP3 SOURCE APP ===');
searchInDir('scratch/zip3_source_app/resources/app/out', ['video-dubbing', 'video-script-extract']);
