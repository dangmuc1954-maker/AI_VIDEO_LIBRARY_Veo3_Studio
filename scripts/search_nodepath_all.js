const fs = require('fs');
const path = require('path');

function search(dir, str) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      search(full, str);
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.cjs'))) {
      const c = fs.readFileSync(full, 'utf8');
      if (c.includes(str)) {
        console.log(`Found "${str}" in: ${full}`);
        let p = 0;
        while ((p = c.indexOf(str, p)) !== -1) {
          console.log('  -> at offset', p, c.slice(Math.max(0, p - 30), p + 50));
          p += str.length;
        }
      }
    }
  }
}

console.log('=== In workspace app/out ===');
search('D:/dự án antigravity/AIForge_Veo3_Studio/app/out', 'nodePath');

console.log('\n=== In installed app ===');
search('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out', 'nodePath');
