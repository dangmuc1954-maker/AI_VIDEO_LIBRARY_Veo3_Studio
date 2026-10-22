const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = content.indexOf('evaluateCurrentTokenSync(');
if (pos !== -1) {
  console.log('pos', pos);
  console.log(content.slice(pos, pos + 800));
} else {
  pos = content.indexOf('evaluateCurrentTokenSync()');
  console.log('pos', pos);
  console.log(content.slice(pos, pos + 800));
}
