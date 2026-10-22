const fs = require('fs');

const file = 'app/out/main/index.js';
let s = fs.readFileSync(file, 'utf8');

const target = "if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')))";
const replacement = "const isAccepted = (!initial.has(src)) || (Date.now() - promptTime > 40000);\n              if (src && isAccepted && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')))";

if (s.includes(target)) {
  s = s.replace(target, replacement);
  fs.writeFileSync(file, s, 'utf8');
  console.log('✓ Successfully patched elapsed fallback into probe!');
} else {
  console.log('Target string not found in app/out/main/index.js');
}
