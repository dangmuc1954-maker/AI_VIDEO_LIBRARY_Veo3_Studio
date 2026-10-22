const fs = require('fs');

function searchAllStrings(dir) {
  const files = fs.readdirSync(dir, { recursive: true });
  for (const f of files) {
    if (typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.json') || f.endsWith('.html'))) {
      const full = dir + '/' + f;
      try {
        const c = fs.readFileSync(full, 'utf8');
        ['coin', 'Coin', 'COIN', 'xu', 'Xu', 'credit', 'Credit'].forEach(w => {
          let pos = 0;
          while ((pos = c.indexOf(w, pos)) !== -1) {
            console.log(`Found "${w}" in ${f} at ${pos}:`);
            console.log(c.slice(Math.max(0, pos - 100), Math.min(c.length, pos + 150)));
            console.log('---');
            pos += w.length + 10;
          }
        });
      } catch (e) {}
    }
  }
}

searchAllStrings('extracted_original_20260912/out');
