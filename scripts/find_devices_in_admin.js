const fs = require('fs');
const html = fs.readFileSync('license_server/admin/index.html', 'utf8');

const regex = /device|thiết bị|máy/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(`Match at ${m.index}: ${html.slice(Math.max(0, m.index - 30), Math.min(html.length, m.index + 80))}`);
}
