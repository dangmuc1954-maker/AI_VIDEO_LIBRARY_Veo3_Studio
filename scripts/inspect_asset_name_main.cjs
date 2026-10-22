const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find occurrences of role: 'generated' or role: "generated"
const p = mainCode.indexOf('role:"generated"');
console.log('pos of role:"generated":', p);
if (p !== -1) {
  console.log(mainCode.slice(p - 200, p + 500));
} else {
  // search for name: or asset name generation
  const p2 = mainCode.indexOf('.jpg');
  console.log('p2:', p2);
}
