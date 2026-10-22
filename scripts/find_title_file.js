const fs = require('fs');
const path = require('path');
const dir = 'app/out/renderer/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('AI VIDEO LIBRARY')) {
    console.log('Found in:', f);
  }
}
