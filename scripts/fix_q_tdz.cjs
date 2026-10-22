const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

const target = 'sceneTitle=Ee(o.payload,"title")||(o.title&&o.title!==w?o.title:"")||(q?("Cảnh "+q):""),';
const replacement = 'sceneTitle=Ee(o.payload,"title")||(o.title&&o.title!==w?o.title:"")||(Wt(o.payload,"promptOrder")?("Cảnh "+Wt(o.payload,"promptOrder")):""),';

if (!code.includes(target)) {
  console.error('❌ Could not find target in VideoStudio-frcr8V6s.js');
  process.exit(1);
}

code = code.replace(target, replacement);

console.log('Testing Acorn parse...');
acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
console.log('✓ Acorn parse successful!');

fs.writeFileSync(vsPath, code, 'utf8');
console.log('✓ Fixed TDZ error in VideoStudio-frcr8V6s.js successfully!');
