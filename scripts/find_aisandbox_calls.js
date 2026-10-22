const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const matches = [...c.matchAll(/https:\/\/aisandbox-pa\.googleapis\.com[^\s"']+/g)];
console.log('=== All aisandbox endpoints in app/out/main/index.js ===');
console.log([...new Set(matches.map(m => m[0]))]);

// Find the code around aisandbox
for (const m of matches) {
  const idx = m.index;
  console.log(`\n--- Around ${m[0]} (at ${idx}) ---`);
  console.log(c.substring(Math.max(0, idx - 150), Math.min(c.length, idx + 400)));
}
