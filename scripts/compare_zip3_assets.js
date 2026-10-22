const fs = require('fs');
const path = require('path');

const zip3Out = 'scratch/zip3_source_app/resources/app/out';
const ourOut = 'app/out';

console.log('--- zip3 renderer assets: ---');
const zip3Assets = fs.readdirSync(path.join(zip3Out, 'renderer/assets'));
console.log('Total assets in zip3:', zip3Assets.length);

// List files with "video", "editor", "transition", "merge", or similar
zip3Assets.filter(f => /video|editor|transition|merge|studio/i.test(f)).forEach(f => {
  console.log('zip3 asset:', f, fs.statSync(path.join(zip3Out, 'renderer/assets', f)).size);
});

console.log('--- our renderer assets: ---');
const ourAssets = fs.readdirSync(path.join(ourOut, 'renderer/assets'));
ourAssets.filter(f => /video|editor|transition|merge|studio/i.test(f)).forEach(f => {
  console.log('our asset:', f, fs.statSync(path.join(ourOut, 'renderer/assets', f)).size);
});
