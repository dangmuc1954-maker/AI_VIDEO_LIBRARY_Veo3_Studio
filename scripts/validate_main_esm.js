const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app/out/main/index.js', 'utf8');
try {
  new vm.SourceTextModule(code);
  console.log('✅ Syntax of app/out/main/index.js is 100% valid ES module!');
} catch (e) {
  console.error('❌ Error:', e.message);
}
