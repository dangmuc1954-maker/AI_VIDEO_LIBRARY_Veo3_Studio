const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

console.log(content.substring(45400, 48800));
