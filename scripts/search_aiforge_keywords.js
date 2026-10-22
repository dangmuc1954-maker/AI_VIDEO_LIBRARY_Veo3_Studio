const fs = require('fs');
const path = require('path');

const base = 'C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out';

const terms = ['Biên tập video', 'Ghép tự động', 'Ghép nối', 'autoMerge', 'auto_merge', 'editor', 'concat', 'merge'];

function searchInDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      searchInDir(p);
    } else if (p.endsWith('.js') || p.endsWith('.html') || p.endsWith('.json') || p.endsWith('.css')) {
      const content = fs.readFileSync(p, 'utf-8');
      for (const t of terms) {
        if (content.includes(t)) {
          console.log(`Found "${t}" in: ${p}`);
        }
      }
    }
  }
}

searchInDir(base);
