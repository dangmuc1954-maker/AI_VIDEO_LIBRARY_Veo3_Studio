const fs = require('fs');

const ourRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

let p = 0;
while ((p = ourRunner.indexOf('yo(', p)) !== -1) {
  console.log('yo( at', p, ':\n', ourRunner.slice(p - 50, p + 150));
  p += 3;
}
