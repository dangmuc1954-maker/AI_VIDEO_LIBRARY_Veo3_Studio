const fs = require('fs');
const crypto = require('crypto');

const p = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/df6b4daf-b183-43be-b84d-1c91eb545efc.mp4';
const buf = fs.readFileSync(p);
const sha = crypto.createHash('sha256').update(buf).digest('hex');
console.log('New bytes:', buf.length, 'New sha256:', sha);

const astPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json';
const ast = JSON.parse(fs.readFileSync(astPath, 'utf8'));
const item = ast.assets.find(x => x.id === 'df6b4daf-b183-43be-b84d-1c91eb545efc');
if (item) {
  item.bytes = buf.length;
  item.sha256 = sha;
  fs.writeFileSync(astPath, JSON.stringify(ast, null, 2));
  console.log('Updated asset-state.json successfully!');
}
