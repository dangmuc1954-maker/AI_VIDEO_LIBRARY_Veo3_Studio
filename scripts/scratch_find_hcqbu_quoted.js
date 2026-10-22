const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

const regex = /["']hCQbU["']/g;
let m;
while ((m = regex.exec(code)) !== null) {
  console.log(`Found "hCQbU" at ${m.index}:`);
  console.log(code.slice(Math.max(0, m.index - 50), Math.min(code.length, m.index + 150)));
}
