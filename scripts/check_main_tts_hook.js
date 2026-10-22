const fs = require('fs');
const path = require('path');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    const code = fs.readFileSync(mainPath, 'utf8');
    const hasTtsHook = code.includes('if(n.payload?.tts?.enabled && c.assets?.length>0)');
    console.log(`[${root}] out/main/index.js TTS Hook present:`, hasTtsHook);
  }
}
