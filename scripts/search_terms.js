const fs = require('fs');
const path = require('path');

function search(dir, terms) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      search(p, terms);
    } else if (f.endsWith('.js') || f.endsWith('.cjs') || f.endsWith('.html') || f.endsWith('.css')) {
      const content = fs.readFileSync(p, 'utf8');
      for (const t of terms) {
        if (content.includes(t)) {
          console.log(`Found "${t}" in: ${p}`);
        }
      }
    }
  }
}

search(
  path.join(__dirname, '..', 'extracted_aiforge_studio', 'out'),
  ['Ghép tự động', 'Biên tập video', 'ghép', 'stitch', 'editor', 'autoMerge', 'autoStitch', 'videoEditor', 'Hàng đợi Video']
);
