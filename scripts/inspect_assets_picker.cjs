const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const p = content.indexOf('We=qe(r=>r.assets)');
console.log('Context around We=qe(r=>r.assets):');
console.log(content.slice(Math.max(0, p - 400), p + 200));

// Find definition of qe
const qeMatches = content.match(/const\s+qe\s*=[^;]+/g) || content.match(/import\s*\{[^}]*qe[^}]*\}\s*from[^;]+/g);
console.log('qe matches:', qeMatches);
