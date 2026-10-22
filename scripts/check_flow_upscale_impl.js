const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = content.indexOf('async upscaleImage(');
if (pos !== -1) {
  console.log('--- upscaleImage in FlowImageRpcClient: ---');
  console.log(content.slice(pos, pos + 1200));
} else {
  console.log('upscaleImage not found!');
}
