const fs = require('fs');

const filePath = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update getKocMediaUrl
const oldGetKocMediaUrl = `function getKocMediaUrl(asset) {
  if (!asset) return null;
  if (typeof asset === 'string' && asset.trim()) return asset.trim();
  if (asset.thumbnailUrl && typeof asset.thumbnailUrl === 'string' && asset.thumbnailUrl.trim()) return asset.thumbnailUrl.trim();
  if (asset.url && typeof asset.url === 'string' && asset.url.trim()) return asset.url.trim();
  if (asset.base64 && typeof asset.base64 === 'string' && asset.base64.trim()) return asset.base64.trim();
  if (asset.localPath && typeof asset.localPath === 'string' && asset.localPath.trim()) {
    return 'file:///' + asset.localPath.replace(/\\\\/g, '/');
  }
  return null;
}`;

const newGetKocMediaUrl = `function getKocMediaUrl(asset) {
  if (!asset) return null;
  if (typeof asset === 'string' && asset.trim()) return asset.trim();
  // 🎯 Ưu tiên số 1: Tệp cục bộ localPath để luôn hiển thị bản sạch 100% không watermark
  if (asset.localPath && typeof asset.localPath === 'string' && asset.localPath.trim()) {
    return 'file:///' + asset.localPath.replace(/\\\\/g, '/');
  }
  if (asset.thumbnailUrl && typeof asset.thumbnailUrl === 'string' && asset.thumbnailUrl.trim()) return asset.thumbnailUrl.trim();
  if (asset.url && typeof asset.url === 'string' && asset.url.trim()) return asset.url.trim();
  if (asset.base64 && typeof asset.base64 === 'string' && asset.base64.trim()) return asset.base64.trim();
  return null;
}`;

if (content.includes(oldGetKocMediaUrl)) {
  content = content.replace(oldGetKocMediaUrl, newGetKocMediaUrl);
  console.log('1. getKocMediaUrl updated successfully!');
} else {
  console.warn('1. getKocMediaUrl NOT found!');
}

// 2. Update bestUrl in checkJobsAndAssetsDirectly
const oldBestUrl = `                const bestUrl = matchedAsset ? (
                  matchedAsset.thumbnailUrl || 
                  matchedAsset.url || 
                  (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '') || 
                  matchedAsset.base64 || 
                  ''
                ) : '';`;

const newBestUrl = `                const bestUrl = matchedAsset ? (
                  (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '') ||
                  matchedAsset.thumbnailUrl || 
                  matchedAsset.url || 
                  matchedAsset.base64 || 
                  ''
                ) : '';`;

if (content.includes(oldBestUrl)) {
  content = content.replace(oldBestUrl, newBestUrl);
  console.log('2. bestUrl updated successfully!');
} else {
  console.warn('2. bestUrl NOT found!');
}

// 3. Update fallback bUrl in Fashion
const oldFallbackUrl = `              const bUrl = fallback.thumbnailUrl || fallback.url || (fallback.localPath ? 'file:///' + fallback.localPath.replace(/\\\\/g, '/') : '') || fallback.base64 || '';`;
const newFallbackUrl = `              const bUrl = (fallback.localPath ? 'file:///' + fallback.localPath.replace(/\\\\/g, '/') : '') || fallback.thumbnailUrl || fallback.url || fallback.base64 || '';`;

if (content.includes(oldFallbackUrl)) {
  content = content.replace(oldFallbackUrl, newFallbackUrl);
  console.log('3. fallback bUrl updated successfully!');
} else {
  console.warn('3. fallback bUrl NOT found!');
}

// 4. Update the 6 image job payloads in Fashion:
const oldPayloadChunk = `          autoRemoveWatermark: cs.removeWatermark,
          removeWatermark: cs.removeWatermark,
          upscale2k: cs.imageResolution === '2k',
          resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

const newPayloadChunk = `          autoRemoveWatermark: cs.removeWatermark,
          removeWatermark: cs.removeWatermark,
          upsampleResolution: cs.imageResolution === '2k' ? '2K' : 'Full HD',
          resolution: cs.imageResolution === '2k' ? '2K' : 'Standard',
          quality: cs.imageResolution === '2k' ? '2K' : 'Standard',
          imageResolution: cs.imageResolution,
          upscale2k: cs.imageResolution === '2k',
          resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

const oldPayloadChunkIndent14 = `              autoRemoveWatermark: cs.removeWatermark,
              removeWatermark: cs.removeWatermark,
              upscale2k: cs.imageResolution === '2k',
              resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

const newPayloadChunkIndent14 = `              autoRemoveWatermark: cs.removeWatermark,
              removeWatermark: cs.removeWatermark,
              upsampleResolution: cs.imageResolution === '2k' ? '2K' : 'Full HD',
              resolution: cs.imageResolution === '2k' ? '2K' : 'Standard',
              quality: cs.imageResolution === '2k' ? '2K' : 'Standard',
              imageResolution: cs.imageResolution,
              upscale2k: cs.imageResolution === '2k',
              resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

let count10 = 0;
while (content.includes(oldPayloadChunk)) {
  content = content.replace(oldPayloadChunk, newPayloadChunk);
  count10++;
}
console.log('4a. Replaced', count10, 'instances of indent 10 payload chunks');

let count14 = 0;
while (content.includes(oldPayloadChunkIndent14)) {
  content = content.replace(oldPayloadChunkIndent14, newPayloadChunkIndent14);
  count14++;
}
console.log('4b. Replaced', count14, 'instances of indent 14 payload chunks');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Saved', filePath);
