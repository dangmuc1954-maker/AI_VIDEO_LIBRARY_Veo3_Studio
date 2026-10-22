const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'original_video_editor_mn.js'), 'utf8');

// Let's inspect the JSX structure in mn
// Find return statement of mn
const returnIdx = content.indexOf('return e.jsxs(');
console.log('returnIdx:', returnIdx);

if (returnIdx !== -1) {
  const jsxSlice = content.slice(returnIdx, returnIdx + 30000);
  fs.writeFileSync(path.join(__dirname, '..', 'original_editor_jsx.js'), jsxSlice);
  console.log('Wrote original_editor_jsx.js, length:', jsxSlice.length);
}
