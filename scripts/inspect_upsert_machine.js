const fs = require('fs');
const code = fs.readFileSync('license_server/db.js', 'utf8');

const idx = code.indexOf('upsertMachine');
console.log(code.slice(idx, idx + 800));
