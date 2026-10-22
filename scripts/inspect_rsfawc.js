const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = content.indexOf('refreshSessionForAutomationWithoutCoordination(');
console.log('at ' + idx + ': ' + content.slice(idx, idx + 600));
