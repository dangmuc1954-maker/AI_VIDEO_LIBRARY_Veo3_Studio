const fs = require('fs');
const vm = require('vm');

let code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

// Replace imports and exports to parse as script
const noImports = code.replace(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g, '// import')
                      .replace(/export\s*\{[^}]*\};?/g, '// export');

try {
  new vm.Script(noImports, { filename: 'VideoStudio-BZY_1pM8.js' });
  console.log('Valid syntax!');
} catch (e) {
  console.log('Error:', e.message);
  console.log(e.stack);
}
