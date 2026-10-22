const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const m = content.match(/Mv="(data:image\/png;base64,[^"]+)"/);
const b64 = fs.readFileSync('scripts/robot_icon_base64.txt', 'utf8').trim();

console.log('Match in file length:', m ? m[1].length : 'null');
console.log('b64 file length:', b64.length);
console.log('Are they identical?:', m ? (m[1] === b64) : false);

const installedContent = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const mInstalled = installedContent.match(/Mv="(data:image\/png;base64,[^"]+)"/);
console.log('Installed match length:', mInstalled ? mInstalled[1].length : 'null');
console.log('Is installed identical?:', mInstalled ? (mInstalled[1] === b64) : false);
