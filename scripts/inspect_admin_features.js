const fs = require('fs');
const html = fs.readFileSync('license_server/admin/index.html', 'utf8');

const matches = html.match(/id=["'][a-zA-Z0-9_\-]+["']/g) || [];
console.log('Sample IDs in license_server/admin/index.html:');
console.log(Array.from(new Set(matches)).slice(0, 40));

// Also check vercel_server/public/admin/index.html
const vHtml = fs.readFileSync('vercel_server/public/admin/index.html', 'utf8');
const vMatches = vHtml.match(/id=["'][a-zA-Z0-9_\-]+["']/g) || [];
console.log('\nSample IDs in vercel_server/public/admin/index.html:');
console.log(Array.from(new Set(vMatches)).slice(0, 40));
