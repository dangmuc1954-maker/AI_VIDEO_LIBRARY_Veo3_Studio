const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Patch sceneTitle extraction
const oldSceneTitle = 'sceneTitle=Ee(o.payload,"title")||(o.title&&o.title!==w?o.title:""),';
const newSceneTitle = 'sceneTitle=Ee(o.payload,"title")||(o.title&&o.title!==w?o.title:"")||(q?("Cảnh "+q):""),';

if (!code.includes(oldSceneTitle)) {
  console.error('❌ Could not find oldSceneTitle in VideoStudio-frcr8V6s.js');
  process.exit(1);
}
code = code.replace(oldSceneTitle, newSceneTitle);
console.log('✓ Patched sceneTitle fallback in VideoStudio');

// 2. Patch title in job payloads
// Match 1:
const oldPayload1 = 'promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),';
const newPayload1 = 'promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),';
if (code.includes(oldPayload1)) {
  code = code.replace(oldPayload1, newPayload1);
  console.log('✓ Patched payload 1 with scene title');
}

// Match 2:
const oldPayload2 = 'promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,ve),';
const newPayload2 = 'promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,ve),';
if (code.includes(oldPayload2)) {
  code = code.replace(oldPayload2, newPayload2);
  console.log('✓ Patched payload 2 with scene title');
}

// Match 3:
const oldPayload3 = 'promptOrder:v.index,batchIndex:ve,account:v.account,accountSelection:$e?"manual":"auto",referenceAssetIds:Ve,';
const newPayload3 = 'promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:ve,account:v.account,accountSelection:$e?"manual":"auto",referenceAssetIds:Ve,';
if (code.includes(oldPayload3)) {
  code = code.replace(oldPayload3, newPayload3);
  console.log('✓ Patched payload 3 with scene title');
}

// 3. Patch download filename
const oldDownload = 'r.download=(Ne.title&&Ne.title.trim()?`${Ne.title.trim().replace(/[\\\\/:*?"<>|]/g,"_")}.mp4`:`video-${Ne.promptOrder||Ne.promptId}.mp4`),';
const newDownload = 'r.download=(((Ne.title&&Ne.title.trim())||(Ne.promptOrder?("Cảnh "+Ne.promptOrder):"video")).replace(/[\\\\/:*?"<>|]/g,"_").replace(/\\.mp4$/i,"")+".mp4"),';

if (code.includes(oldDownload)) {
  code = code.replace(oldDownload, newDownload);
  console.log('✓ Patched download filename with default Cảnh X');
} else {
  console.warn('⚠️ Could not find exact oldDownload string, checking variations...');
}

// 4. Verify syntax with Acorn
console.log('Testing Acorn parse of VideoStudio-frcr8V6s.js...');
try {
  acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ VideoStudio-frcr8V6s.js is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in VideoStudio-frcr8V6s.js:', err.message);
  process.exit(1);
}

fs.writeFileSync(vsPath, code, 'utf8');
console.log('✓ Saved VideoStudio-frcr8V6s.js successfully!');
