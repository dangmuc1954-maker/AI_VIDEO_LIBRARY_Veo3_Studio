const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/out/renderer/assets/useWorkflowRunner-BmcV20yZ.js');
const s = fs.readFileSync(file, 'utf8');

let pos = 0;
while((pos = s.indexOf('elevenlabs', pos)) !== -1) {
  console.log('Pos:', pos);
  console.log(s.slice(Math.max(0, pos - 40), pos + 250));
  pos += 15;
}
