const fs = require('fs');
const path = require('path');

const statePath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json';
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

// Find videos from google-flow provider or with prompt
const flowVideos = state.assets.filter(a => a.type === 'video').slice(-10);
console.log('Last 10 video assets in DB:');
flowVideos.forEach(v => {
  console.log({
    id: v.id,
    name: v.name,
    providerAssetId: v.providerAssetId,
    url: v.url,
    localPath: v.localPath,
    exists: fs.existsSync(v.localPath || '')
  });
});
