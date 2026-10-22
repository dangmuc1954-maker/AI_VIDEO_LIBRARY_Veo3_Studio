const fs = require('fs');
const path = require('path');

const dir = 'app/out/renderer/assets';
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('This Device')) {
    console.log('Found "This Device" in:', f);
    const idx = content.indexOf('This Device');
    console.log(content.slice(Math.max(0, idx - 400), Math.min(content.length, idx + 200)));
  }
}
