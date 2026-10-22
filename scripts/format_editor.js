const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'original_video_editor_mn.js');
let content = fs.readFileSync(file, 'utf8');

// Quick formatting to make it readable
let formatted = content
  .replace(/;/g, ';\n')
  .replace(/\{/g, '{\n')
  .replace(/\}/g, '\n}\n')
  .replace(/,children:/g, ',\nchildren:')
  .replace(/e\.jsx\(/g, '\ne.jsx(')
  .replace(/e\.jsxs\(/g, '\ne.jsxs(');

fs.writeFileSync(path.join(__dirname, '..', 'original_editor_formatted.js'), formatted);
console.log('Formatted lines:', formatted.split('\n').length);
