const fs = require('fs');
const path = require('path');

// Tìm workflow runs trong AppData
const possibleStates = [
  'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/workflow-state.json',
  'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json',
  'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json'
];

for (const p of possibleStates) {
  if (fs.existsSync(p)) {
    console.log('Exists:', p);
    const c = fs.readFileSync(p, 'utf8');
    // Tìm các chuỗi error gần nhất
    const matches = c.match(/.{0,50}(?:error|Đọc Kịch Bản|video-script-extract).{0,100}/gi);
    console.log(`Matches in ${path.basename(p)}:`, matches?.slice(-5));
  }
}
