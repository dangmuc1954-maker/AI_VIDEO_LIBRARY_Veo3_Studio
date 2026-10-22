const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app/out/main/index.js', 'utf8');
try {
  new vm.Script(code);
  console.log('✅ Syntax of app/out/main/index.js is 100% valid!');
} catch (e) {
  console.error('❌ Syntax error in app/out/main/index.js:', e.message);
  process.exit(1);
}
