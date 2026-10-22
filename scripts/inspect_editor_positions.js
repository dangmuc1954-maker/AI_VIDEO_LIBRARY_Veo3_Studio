const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');
const s = fs.readFileSync(file, 'utf8');

// Find all matches for video-script-extract
let pos = 0;
while ((pos = s.indexOf('video-script-extract', pos)) !== -1) {
  console.log('--- Pos:', pos, '---');
  console.log(s.slice(Math.max(0, pos - 80), pos + 180));
  pos += 'video-script-extract'.length;
}
