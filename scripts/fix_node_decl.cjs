const fs = require('fs');

const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

// Remove redundant declarations
const badDecl = "const nodeFs = require('fs');\nconst nodePath = require('path');\n\n";
if (content.includes(badDecl)) {
  content = content.replace(badDecl, '');
  fs.writeFileSync(file, content, 'utf8');
  console.log('✓ Removed duplicate nodeFs/nodePath declarations');
} else {
  console.log('badDecl not found');
}
