const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

const b1Line = content.indexOf("if ((pathname.includes('/licenses/activate') || pathname.endsWith('/activate')) && method === 'POST')");
console.log('b1Line exists:', b1Line !== -1);
