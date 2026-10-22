const fs = require('fs');
const path = require('path');

const dir = 'app/out/renderer/assets';
const files = fs.readdirSync(dir);

for (const f of files) {
  if (f.endsWith('.js')) {
    const content = fs.readFileSync(path.join(dir, f), 'utf8');
    if (content.includes('text-splitter')) {
      console.log(`Found "text-splitter" in ${f}`);
    }
  }
}
