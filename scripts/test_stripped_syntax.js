const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

// Replace all imports with comments
let stripped = content;
// Semicolon-terminated imports
stripped = stripped.replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, '/*import*/;');
stripped = stripped.replace(/import\s*["'][^"']+["'];?/g, '/*import*/;');
// Strip export
stripped = stripped.replace(/export\s*\{[^}]*\};?/g, '/*export*/;');

try {
  new Function(stripped);
  console.log('NO SYNTAX ERRORS! Clean parsing!');
} catch (e) {
  console.log('Syntax error caught:', e.message);
  
  // Binary search to find where it breaks
  let low = 0, high = stripped.length, best = 0;
  // Let's test prefixes wrapped in function
  // Actually, use node's vm module to get line/col
  const vm = require('vm');
  try {
    new vm.Script(stripped, { filename: 'checked.js' });
  } catch (err) {
    console.log('VM Error:', err.message);
    console.log('VM Stack:', err.stack ? err.stack.slice(0, 500) : '');
  }
}
