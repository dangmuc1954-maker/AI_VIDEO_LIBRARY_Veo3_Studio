const fs = require('fs');
const file = 'vercel_server/api/index.js';
let code = fs.readFileSync(file, 'utf8');

const target = "if ((pathname.includes('/licenses/activate') || pathname.endsWith('/activate')) && method === 'POST')";
const replacement = "if ((pathname.endsWith('/licenses/activate') || pathname.endsWith('/activate')) && !pathname.includes('trial') && method === 'POST')";

code = code.replace(target, replacement);
fs.writeFileSync(file, code, 'utf8');
console.log('✅ Fixed B1 routing!');
