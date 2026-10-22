const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const search = 'typeof e.payload?.prompt=="string"';

let pos = 0;
let count = 0;
while ((pos = mainCode.indexOf(search, pos)) !== -1) {
  count++;
  console.log(`Match ${count} at ${pos}:`);
  console.log(mainCode.slice(Math.max(0, pos - 60), pos + 140));
  console.log('---------------------------');
  pos += search.length;
}
console.log('Total matches in main:', count);
