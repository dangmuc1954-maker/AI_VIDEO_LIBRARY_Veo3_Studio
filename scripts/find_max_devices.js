const fs = require('fs');
const code = fs.readFileSync('license_server/server.js', 'utf8');

const regex = /maxDevices/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log(`maxDevices at ${m.index}: ${code.slice(Math.max(0, m.index - 40), Math.min(code.length, m.index + 80))}`);
}
