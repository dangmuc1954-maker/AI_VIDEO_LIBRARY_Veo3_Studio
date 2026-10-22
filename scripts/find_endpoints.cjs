const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

const regex = /\/v1\/license\/[a-zA-Z0-9_-]+/g;
console.log('License endpoints in main_index.js:', [...new Set(content.match(regex))]);

const regex2 = /\/api\/license\/[a-zA-Z0-9_-]+/g;
console.log('Api license endpoints in main_index.js:', [...new Set(content.match(regex2))]);

const regex3 = /\/v1\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g;
console.log('All v1 endpoints sample:', [...new Set(content.match(regex3))].slice(0, 30));
