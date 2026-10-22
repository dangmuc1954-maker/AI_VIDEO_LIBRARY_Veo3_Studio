const fs = require('fs');

let code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const marker = '"manual-merge")';
const idx = code.lastIndexOf(marker);
if (idx !== -1) {
  const newEnd = code.slice(0, idx + marker.length) + ']})})}export{Qn as default};\n';
  fs.writeFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', newEnd, 'utf8');
  console.log('Updated ending with ]})})}.');
}
