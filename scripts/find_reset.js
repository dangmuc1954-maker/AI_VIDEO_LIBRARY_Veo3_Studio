const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

console.log(content.substring(24400, 26500));
