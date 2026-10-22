const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

const idx = content.indexOf('B6. Trial Activation');
console.log(content.substring(idx, idx + 400));
