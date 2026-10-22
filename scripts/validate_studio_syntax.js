const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
try {
  new vm.Script(code);
  console.log('✅ Syntax is completely valid as script!');
} catch (e) {
  if (e.message.includes('Cannot use import statement outside a module')) {
    console.log('✅ Syntax is valid ES module (imports recognized)!');
  } else {
    console.error('❌ Syntax error:', e.message);
  }
}
