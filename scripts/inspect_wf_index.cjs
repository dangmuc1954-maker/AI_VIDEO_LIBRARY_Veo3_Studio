const fs = require('fs');

const p = 'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY\\workflows-v2\\index.json';
if (fs.existsSync(p)) {
  console.log(fs.readFileSync(p, 'utf-8'));
}
