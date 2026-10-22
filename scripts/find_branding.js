const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../app/out/renderer/assets');

for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, file), 'utf8');
  const re = /(AIForge|AI VIDEO LIBRARY|app-icon|v3\.\d|v0\.\d|logo)/gi;
  let match;
  let count = 0;
  while ((match = re.exec(content)) !== null) {
    count++;
    if (count <= 10) {
      const start = Math.max(0, match.index - 80);
      const end = Math.min(content.length, match.index + 100);
      console.log(`[${file}] match '${match[0]}' @ ${match.index}:`);
      console.log('   ...' + content.slice(start, end).replace(/\s+/g, ' ') + '...');
    }
  }
}
