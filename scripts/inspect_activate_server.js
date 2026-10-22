const fs = require('fs');
const code = fs.readFileSync('license_server/server.js', 'utf8');

const idx = code.indexOf('/v1/licenses/activate');
console.log(code.slice(idx, idx + 2500));
