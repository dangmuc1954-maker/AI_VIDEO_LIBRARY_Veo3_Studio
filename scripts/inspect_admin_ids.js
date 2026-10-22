const fs = require('fs');
const content = fs.readFileSync('vercel_server/public/admin/index.html', 'utf8');

const regex = /id=['"]([^'"]*(?:modal|gen|key)[^'"]*)['"]/gi;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Found ID:', m[1]);
}
