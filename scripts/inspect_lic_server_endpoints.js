const fs = require('fs');
const s = fs.readFileSync('license_server/server.js', 'utf8');

const idx = s.indexOf('/v1/licenses/activate');
console.log('activate at:', idx);
console.log(s.slice(idx - 20, idx + 800));
