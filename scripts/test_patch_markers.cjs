const fs = require('fs');

const vs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const s1 = 'const targetIds=(n&&n.length>0)?n:(w&&w.length>0?w.filter(c=>c.type==="video").slice(0,30).map(c=>c.id):[]);';
console.log('Test 1 (fn targetIds):', vs.includes(s1));

const idx2 = vs.indexOf('window.__openAiforgeVideoEditorModal=');
console.log('Test 2 (open modal hook index):', idx2);
if (idx2 !== -1) {
  console.log(vs.slice(idx2, idx2 + 400));
}

const idxBS = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
const s3 = 'J=await C.mergeVideos(T,"none",{name:ce,source:"video-studio"})';
console.log('Test 3 (AE mergeVideos call):', idxBS.includes(s3));

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const s4 = '/*__AIFORGE_AUTO_DOWNLOAD_WRITEASSET__*/';
console.log('Test 4 (main writeAsset marker):', main.includes(s4));
