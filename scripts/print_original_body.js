const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const idx = content.indexOf('createVideoGenerationBody(');
console.log(content.slice(idx, idx + 1500));
