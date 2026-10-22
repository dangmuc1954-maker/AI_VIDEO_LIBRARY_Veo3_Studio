const fs = require('fs');
const path = require('path');

const ids = [
  '2f0f0fed-b25f-4970-af89-1a2d0a05423c',
  '88c8dbea-dcef-42f2-953a-2d2392ee7e3a',
  'dc285a49-338e-424b-8db6-e18768b2934e',
  'd9697c7b-1ab1-48cb-a17c-9280568d433e',
  '2bbf79ea-f055-423b-9c0a-cb3870321607',
  'cmtwimoa000wot001t5x2c5ah',
  'cmtv9z12500qznx01eyewy9i2',
  'cmtv34ycm00brnx01i8fd9avx',
  'cmthkzsvl00f5qu01f2pec1mk',
  'cmtcbvpbp000gms01hcoqwwug'
];

const keywords = [
  'Gia Công Đa Ngành',
  'Người Que Trending',
  'Gối Chặn Đầu',
  'Review Đồ Gia Dụng',
  'máy chạy bộ',
  'mẫu selfie',
  'trước gương',
  'Thợ Điện Thông Thái',
  'Bán Mọi Loại Đồ Đạc'
];

function searchDir(dir, maxDepth = 4, curDepth = 0) {
  if (curDepth > maxDepth) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!['node_modules', '.git', 'Cache', 'Code Cache', 'DawnGraphiteCache', 'DawnWebGPUCache'].includes(ent.name)) {
          searchDir(full, maxDepth, curDepth + 1);
        }
      } else if (ent.isFile()) {
        // if json or txt or db
        if (ent.size < 10 * 1024 * 1024) {
          try {
            const buf = fs.readFileSync(full);
            const str = buf.toString('utf-8');
            for (const id of ids) {
              if (str.includes(id)) {
                console.log(`[MATCH ID ${id}] in: ${full}`);
              }
            }
            for (const kw of keywords) {
              if (str.includes(kw)) {
                console.log(`[MATCH KEYWORD "${kw}"] in: ${full}`);
              }
            }
          } catch(e) {}
        }
      }
    }
  } catch(e) {}
}

console.log('Searching in AppData...');
searchDir('C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio');
searchDir('C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA');
searchDir('C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY');

console.log('Searching in workspace...');
searchDir('D:\\dự án antigravity\\AIForge_Veo3_Studio');
console.log('Search finished.');
