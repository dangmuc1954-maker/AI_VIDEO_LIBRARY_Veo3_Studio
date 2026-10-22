const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  // 1. Update ImageStudio-4nmpUX3j.js to send sceneName in input.title and payload
  const isPath = path.join(root, 'out/renderer/assets/ImageStudio-4nmpUX3j.js');
  if (fs.existsSync(isPath)) {
    let isCode = fs.readFileSync(isPath, 'utf8');
    const oldInputTitle = 'input:{title:y.prompt,type:"Image"';
    const newInputTitle = 'input:{title:y.sceneName||y.title||("Cảnh "+y.index)||y.prompt,type:"Image"';
    if (isCode.includes(oldInputTitle)) {
      isCode = isCode.replace(oldInputTitle, newInputTitle);
      fs.writeFileSync(isPath, isCode, 'utf8');
      console.log('Updated input.title in', isPath);
    }
    try {
      execSync(`node --check "${isPath}"`);
      console.log('✅ ImageStudio syntax valid in', isPath);
    } catch (e) {
      console.error('❌ ImageStudio syntax error:', e.message);
    }
  }

  // 2. Update main/index.js to name generated assets by sceneName (Cảnh 1, Cảnh 2...)
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    let mainCode = fs.readFileSync(mainPath, 'utf8');

    // Add helper function _getGenName right before function or(r,e) if not present
    if (!mainCode.includes('function _getGenName(')) {
      const helper = 'function _getGenName(e,m){const s=e?.payload?.sceneName||e?.payload?.title||(e?.payload?.promptOrder?("Cảnh "+e.payload.promptOrder):(e?.title&&/^Cảnh\\s*\\d+/i.test(e.title)?e.title:void 0));return or(s||(typeof e?.payload?.prompt=="string"?e.payload.prompt:e?.title),m)}';
      mainCode = mainCode.replace('function or(r,e){', helper + 'function or(r,e){');
      console.log('Added _getGenName helper to', mainPath);
    }

    // Replace the 3 asset naming calls in main/index.js
    // Match 1: image
    const oldImgName = 'name:or(typeof e.payload?.prompt=="string"?e.payload.prompt:e.title,t.mimeType),type:"image"';
    const newImgName = 'name:_getGenName(e,t.mimeType),sceneName:e.payload?.sceneName||(e.payload?.promptOrder?("Cảnh "+e.payload.promptOrder):void 0),type:"image"';
    if (mainCode.includes(oldImgName)) {
      mainCode = mainCode.replace(oldImgName, newImgName);
      console.log('Updated Image asset name to use sceneName in', mainPath);
    }

    // Match 2: video
    const oldVidName = 'name:or(typeof e.payload?.prompt=="string"?e.payload.prompt:e.title,t.mimeType),type:"video"';
    const newVidName = 'name:_getGenName(e,t.mimeType),sceneName:e.payload?.sceneName||(e.payload?.promptOrder?("Cảnh "+e.payload.promptOrder):void 0),type:"video"';
    if (mainCode.includes(oldVidName)) {
      mainCode = mainCode.replace(oldVidName, newVidName);
      console.log('Updated Video asset name to use sceneName in', mainPath);
    }

    // Match 3: queue asset
    const oldQName = 'name:or(typeof e.payload?.prompt=="string"?e.payload.prompt:e.title,n.mimeType),type:t.type';
    const newQName = 'name:_getGenName(e,n.mimeType),sceneName:e.payload?.sceneName||(e.payload?.promptOrder?("Cảnh "+e.payload.promptOrder):void 0),type:t.type';
    if (mainCode.includes(oldQName)) {
      mainCode = mainCode.replace(oldQName, newQName);
      console.log('Updated Queue asset name to use sceneName in', mainPath);
    }

    fs.writeFileSync(mainPath, mainCode, 'utf8');
    try {
      execSync(`node --check "${mainPath}"`);
      console.log('✅ Main syntax valid in', mainPath);
    } catch (e) {
      console.error('❌ Main syntax error:', e.message);
    }
  }
}
