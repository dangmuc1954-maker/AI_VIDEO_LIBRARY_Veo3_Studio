const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('Testing bundle syntax & scene sorting for:', target);
  const code = fs.readFileSync(target, 'utf8');

  // Check key markers
  const markers = [
    'sceneIndex',
    'sceneName',
    '🎬 Phân cảnh',
    'Phan_Canh_'
  ];
  for (const m of markers) {
    if (!code.includes(m)) {
      console.error(`[FAIL] Marker ${m} not found in ${target}`);
      process.exit(1);
    }
  }

  // Simulate Lo sorting
  const er = 3e4;
  function rt(t){const o=t?new Date(t).getTime():Number.NaN;return Number.isFinite(o)?o:0}
  function or(t){const o=rt(t.generationRunCreatedAt);if(o>0)return o;const s=rt(t.createdAt);return s>0?Math.floor(s/er)*er:0}

  const startLo = code.indexOf('function Lo(');
  const endLo = code.indexOf('function Oo(');
  const loSnippet = code.substring(startLo, endLo);
  eval(loSnippet);

  // Mock items created out of order:
  // Scene 3 completed first at 12:05:00
  // Scene 1 completed second at 12:05:10
  // Scene 2 completed third at 12:05:20
  const mockItems = [
    { id: 'job-3-asset-0', promptId: 'p3', sceneIndex: 3, promptOrder: 3, sceneName: 'Phân cảnh 3: Kết thúc', createdAt: '2026-09-02T12:05:00Z', generationRunCreatedAt: '2026-09-02T12:04:00Z' },
    { id: 'job-1-asset-0', promptId: 'p1', sceneIndex: 1, promptOrder: 1, sceneName: 'Phân cảnh 1: Mở đầu', createdAt: '2026-09-02T12:05:10Z', generationRunCreatedAt: '2026-09-02T12:04:00Z' },
    { id: 'job-2-asset-0', promptId: 'p2', sceneIndex: 2, promptOrder: 2, sceneName: 'Phân cảnh 2: Thân bài', createdAt: '2026-09-02T12:05:20Z', generationRunCreatedAt: '2026-09-02T12:04:00Z' }
  ];

  const mockPrompts = [
    { id: 'p1', index: 1 },
    { id: 'p2', index: 2 },
    { id: 'p3', index: 3 }
  ];

  const sorted = Lo(mockItems, mockPrompts);
  console.log('Sorted output scene indices:', sorted.map(x => x.sceneIndex));
  if (sorted[0].sceneIndex === 1 && sorted[1].sceneIndex === 2 && sorted[2].sceneIndex === 3) {
    console.log('[PASS] Lo correctly sorted items into exact sequential order 1 -> 2 -> 3!');
  } else {
    console.error('[FAIL] Sorting failed:', sorted);
    process.exit(1);
  }
}

console.log('\n🌟 ALL SCENE MODE & SORTING TESTS PASSED! 🌟');
