const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('await win.loadURL("https://muse.ai/thread/new");');
console.log(content.slice(idx, idx + 4000));
