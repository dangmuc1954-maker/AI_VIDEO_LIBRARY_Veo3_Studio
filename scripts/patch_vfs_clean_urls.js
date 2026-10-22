const fs = require('fs');
const filePath = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldV1 = `                const bestVideoUrl = matchedVideoAsset ? (
                  matchedVideoAsset.url || 
                  (matchedVideoAsset.localPath ? 'file:///' + matchedVideoAsset.localPath.replace(/\\\\/g, '/') : '') || 
                  matchedVideoAsset.base64 || 
                  ''
                ) : '';`;

const newV1 = `                const bestVideoUrl = matchedVideoAsset ? (
                  (matchedVideoAsset.localPath ? 'file:///' + matchedVideoAsset.localPath.replace(/\\\\/g, '/') : '') || 
                  matchedVideoAsset.url || 
                  matchedVideoAsset.base64 || 
                  ''
                ) : '';`;

if (content.includes(oldV1)) {
  content = content.replace(oldV1, newV1);
  console.log('Fixed bestVideoUrl to prefer clean localPath!');
} else {
  console.warn('oldV1 not matched!');
}

const oldV2 = `const bUrl = fallbackVid.url || (fallbackVid.localPath ? 'file:///' + fallbackVid.localPath.replace(/\\\\/g, '/') : '') || fallbackVid.base64 || '';`;
const newV2 = `const bUrl = (fallbackVid.localPath ? 'file:///' + fallbackVid.localPath.replace(/\\\\/g, '/') : '') || fallbackVid.url || fallbackVid.base64 || '';`;

if (content.includes(oldV2)) {
  content = content.replace(oldV2, newV2);
  console.log('Fixed fallbackVid bUrl to prefer clean localPath!');
} else {
  console.warn('oldV2 not matched!');
}

fs.writeFileSync(filePath, content, 'utf8');
