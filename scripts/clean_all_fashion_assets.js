const fs = require('fs');
const path = require('path');
const Cleaner = require('../app/modules/media_watermark_cleaner.cjs');

const cleaner = new Cleaner();
const dir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA';
const assetStateFile = path.join(dir, 'asset-state.json');

async function cleanAll() {
  if (!fs.existsSync(assetStateFile)) return;
  const state = JSON.parse(fs.readFileSync(assetStateFile, 'utf8'));
  const assets = state.assets || [];

  let count = 0;
  for (const a of assets) {
    if (a.type === 'image' && a.localPath && fs.existsSync(a.localPath)) {
      // Check if it's a fashion/koc or showroom image that had watermarkRemoved: false
      const isCandidate = a.name?.includes('Consistency_Check') || 
                          a.name?.includes('Character_and_Outfit') || 
                          a.name?.includes('The_female_KOC') || 
                          a.name?.includes('The_same_female') || 
                          a.name?.includes('The_KOC') || 
                          a.name?.includes('Final_Scene') ||
                          a.name?.includes('koc_scene') ||
                          a.watermarkRemoved === false;
      if (isCandidate) {
        try {
          await cleaner.cleanMediaWatermark(a.localPath, a.localPath, { removeWatermark: true });
          a.watermarkRemoved = true;
          count++;
          console.log(`[Cleaned] ${a.id} -> ${a.name?.slice(0, 40)}`);
        } catch (err) {
          console.warn(`[Failed] ${a.id}:`, err.message);
        }
      }
    }
  }

  fs.writeFileSync(assetStateFile, JSON.stringify(state, null, 2), 'utf8');
  console.log(`Done! Cleaned and updated ${count} assets.`);
}

cleanAll();
