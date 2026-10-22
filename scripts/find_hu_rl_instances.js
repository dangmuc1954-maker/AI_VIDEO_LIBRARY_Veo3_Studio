const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

['new Hu(', 'new rl('].forEach(k => {
  let pos = 0;
  while ((pos = content.indexOf(k, pos)) !== -1) {
    console.log(k, 'at', pos, ':', content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 300)));
    pos += k.length;
  }
});
