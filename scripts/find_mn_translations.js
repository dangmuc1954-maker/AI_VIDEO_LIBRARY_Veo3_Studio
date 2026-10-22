const fs = require('fs');
const code = fs.readFileSync('original_mn_exact.js', 'utf8');

const matches = code.match(/m\(['"][^'"]+['"](?:,[^)]+)?\)/g) || [];
const uniqueKeys = Array.from(new Set(matches));

console.log('Total m() calls:', matches.length);
console.log('Unique translation keys in mn:');
uniqueKeys.forEach(k => console.log(k));

// Also check if there are o("...") calls
const oMatches = code.match(/\bo\(['"][^'"]+['"](?:,[^)]+)?\)/g) || [];
console.log('Total o() calls:', oMatches.length);
Array.from(new Set(oMatches)).forEach(k => console.log(k));
