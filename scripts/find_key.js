const path = require('path');
const db = require(path.join(__dirname, '../license_server/db'));

const k = db.findKey('AIFORGE-ULTRA-365D-54F68AE4-F9A7BA76');
console.log('Key in database.json:', k);

const m = db.findMachine('d71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145');
console.log('Machine in database.json:', m);
