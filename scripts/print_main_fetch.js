const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const start = c.indexOf('async fetchAccessToken(e,t){');
const end = c.indexOf('return this.store.upsertAccount(i)}', start) + 'return this.store.upsertAccount(i)}'.length;

console.log('=== FULL fetchAccessToken in app/out/main/index.js ===');
console.log(c.substring(start, end));
