const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = content.lastIndexOf('resolveRefreshUrl(e){', 70955);
console.log('definition at ' + idx + ': ' + content.slice(idx, idx + 400));
