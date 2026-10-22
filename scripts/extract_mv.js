const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const m = content.match(/Mv="(data:image\/png;base64,[^"]+)"/);
if (m) {
  console.log('Mv data URI length:', m[1].length);
  const base64Data = m[1].replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync('scripts/extracted_mv.png', Buffer.from(base64Data, 'base64'));
  console.log('Saved scripts/extracted_mv.png, size:', fs.statSync('scripts/extracted_mv.png').size);
  if (fs.existsSync('app/app-icon.png')) {
    console.log('app/app-icon.png size:', fs.statSync('app/app-icon.png').size);
  }
} else {
  console.log('Mv not matched with regex');
}
