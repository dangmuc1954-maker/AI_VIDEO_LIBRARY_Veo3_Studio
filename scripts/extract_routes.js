const fs = require('fs');
const content = fs.readFileSync('vercel_server/api/index.js', 'utf8');

const regex = /app\.(get|post|put|delete|all)\((['\"][^'\"]+['\"])/g;
let m;
const routes = [];
while ((m = regex.exec(content)) !== null) {
  routes.push(`${m[1].toUpperCase()} ${m[2]}`);
}
console.log('Server Routes:');
console.log(routes.join('\n'));
