const fs = require('fs');
const path = require('path');

const dir = 'scratch/shop_app_unpacked/out/renderer/assets';
const files = fs.readdirSync(dir);

for (const f of files) {
  if (!f.endsWith('.js')) continue;
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes('mergeVideos') || content.includes('editAndMergeVideos')) {
    console.log('File:', f);
    let idx = 0;
    while ((idx = content.indexOf('editAndMergeVideos', idx)) !== -1) {
      console.log('  editAndMergeVideos at', idx, ':', content.substring(idx - 100, idx + 200));
      idx += 20;
    }
  }
}
