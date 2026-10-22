const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

const idx = content.indexOf('function parseBody');
console.log(content.substring(idx, idx + 600));
