const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find occurrences of `ge +` or `${ge}`
const matches = [...c.matchAll(/(\$\{ge\}[^"`]+|ge\s*\+\s*["'][^"']+["'])/g)];
console.log('=== Usages of ge ===');
for (const m of matches) {
  console.log(m[0]);
}

// Find occurrences of `${ge}`
let idx = 0;
while (true) {
  const f = c.indexOf('${ge}', idx);
  if (f === -1) break;
  console.log(`\n--- at ${f} ---`);
  console.log(c.substring(f - 100, f + 400));
  idx = f + 5;
}
