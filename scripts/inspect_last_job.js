const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
const dataDir = path.join(appData, 'AI_VIDEO_LIBRARY_DATA');

console.log('=== INSPECTING RECENT JOB IN AI_VIDEO_LIBRARY_DATA ===');

// Check queue file or asset state
const assetStatePath = path.join(dataDir, 'asset-state.json');
if (fs.existsSync(assetStatePath)) {
  const data = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));
  const assets = (data.assets || []).filter(a => a.name?.includes('df6b4daf') || a.id?.includes('df6b4daf'));
  console.log('Asset matches in asset-state:', assets);
}

// Check other json files in dataDir
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
console.log('JSON files in dataDir:', files);

files.forEach(f => {
  const p = path.join(dataDir, f);
  const content = fs.readFileSync(p, 'utf8');
  if (content.includes('df6b4daf')) {
    console.log(`\nFound reference in ${f}:`);
    // Extract snippet
    const idx = content.indexOf('df6b4daf');
    console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 400)));
  }
  if (content.includes('f5102f2d')) {
    console.log(`\nFound wav reference in ${f}:`);
    const idx = content.indexOf('f5102f2d');
    console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 400)));
  }
});
