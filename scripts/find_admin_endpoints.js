const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

const regex = /pathname\s*===?\s*['"]([^'"]+)['"]|pathname\.startsWith\(['"]([^'"]+)['"]\)/g;
let m;
const routes = new Set();
while ((m = regex.exec(content)) !== null) {
  routes.add(m[1] || m[2]);
}
console.log('Routes in vercel_server:');
console.log(Array.from(routes));
