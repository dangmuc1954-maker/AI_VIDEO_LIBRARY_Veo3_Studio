const fs = require('fs');
const vm = require('vm');

const original = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js.bak_before_scene_title', 'utf8');

// Test original first
try {
  new vm.SourceTextModule(original);
  console.log('Original module syntax is valid!');
} catch (e) {
  console.log('Original module syntax error:', e.message);
}
