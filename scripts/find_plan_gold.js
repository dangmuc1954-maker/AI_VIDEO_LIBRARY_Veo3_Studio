const fs = require('fs');
const path = require('path');

const dir = 'app/out';
function searchInDir(d) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) {
      searchInDir(full);
    } else if (f.endsWith('.js')) {
      const code = fs.readFileSync(full, 'utf8');
      if (code.includes('plan==="gold"') || code.includes('plan === "gold"') || code.includes("plan==='gold'")) {
        console.log('Found plan==="gold" in:', full);
      }
    }
  }
}
searchInDir(dir);
