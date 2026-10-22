const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Thử parse bằng acorn hoặc vm
const vm = require('vm');
try {
  new vm.SourceTextModule(content);
  console.log('Module syntax is 100% VALID!');
} catch (e) {
  console.log('Syntax Error:', e.message);
  console.log('Line/column info:');
  const stack = e.stack;
  console.log(stack);
}
