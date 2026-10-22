// scripts/patch_google_flow_unified_accounts.js
const fs = require('fs');
const path = require('path');

// 1. PATCH app/out/main/index.js
const mainPath = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const targetMain = 'if(A.providerId!==this.providerId)throw new p("PROVIDER_REJECTED",`Selected account does not belong to Google Flow ${this.providerId==="banana"?"Image":"Video"}`);';
const replacementMain = 'const _isFlowCompat=(this.providerId==="banana"||this.providerId==="veo3")&&(A.providerId==="banana"||A.providerId==="veo3");if(A.providerId!==this.providerId&&!_isFlowCompat)throw new p("PROVIDER_REJECTED",`Selected account does not belong to Google Flow ${this.providerId==="banana"?"Image":"Video"}`);';

if (mainCode.includes(targetMain)) {
  mainCode = mainCode.replace(targetMain, replacementMain);
  fs.writeFileSync(mainPath, mainCode, 'utf8');
  console.log('✅ Patched app/out/main/index.js: Google Flow accounts (banana & veo3) are now 100% unified & cross-compatible!');
} else if (mainCode.includes('_isFlowCompat')) {
  console.log('ℹ️ app/out/main/index.js already patched with _isFlowCompat.');
} else {
  console.error('❌ Could not find targetMain in app/out/main/index.js');
}

// 2. PATCH app/out/renderer/assets/ImageStudio-4nmpUX3j.js
const imgStudioPath = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'ImageStudio-4nmpUX3j.js');
let imgCode = fs.readFileSync(imgStudioPath, 'utf8');

const targetImg = '_.filter(t=>t.providerId==="banana")';
const replacementImg = '_.filter(t=>t.providerId==="banana"||t.providerId==="veo3")';

if (imgCode.includes(targetImg)) {
  imgCode = imgCode.replaceAll(targetImg, replacementImg);
  fs.writeFileSync(imgStudioPath, imgCode, 'utf8');
  console.log('✅ Patched ImageStudio: Now displays both Banana and Veo3 Google Flow accounts!');
} else {
  console.log('ℹ️ ImageStudio already supports both or target not found.');
}

// 3. PATCH app/out/renderer/assets/VideoStudio-frcr8V6s.js
const vidStudioPath = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'VideoStudio-frcr8V6s.js');
let vidCode = fs.readFileSync(vidStudioPath, 'utf8');

const targetVid = 'X.filter(r=>r.providerId==="veo3")';
const replacementVid = 'X.filter(r=>r.providerId==="veo3"||r.providerId==="banana")';

if (vidCode.includes(targetVid)) {
  vidCode = vidCode.replaceAll(targetVid, replacementVid);
  fs.writeFileSync(vidStudioPath, vidCode, 'utf8');
  console.log('✅ Patched VideoStudio: Now displays both Veo3 and Banana Google Flow accounts!');
} else {
  console.log('ℹ️ VideoStudio already supports both or target not found.');
}
