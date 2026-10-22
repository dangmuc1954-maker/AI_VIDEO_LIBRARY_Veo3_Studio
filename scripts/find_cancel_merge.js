const fs = require('fs');

const ourRunner = fs.readFileSync('app/out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js', 'utf8');

let p = 0;
while ((p = ourRunner.indexOf('cancelMerge', p)) !== -1) {
  console.log('cancelMerge at', p, ':\n', ourRunner.slice(p - 150, p + 150));
  p += 'cancelMerge'.length;
}
