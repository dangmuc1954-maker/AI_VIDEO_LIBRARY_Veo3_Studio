const fs = require('fs');
const content = fs.readFileSync('vercel_server/public/admin/index.html', 'utf8');

const pos = content.indexOf('async function submitCreateKeys');
console.log('submitCreateKeys:');
console.log(content.slice(pos, pos + 1000));
