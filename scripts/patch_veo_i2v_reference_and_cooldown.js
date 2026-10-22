const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Bắt đầu sửa lỗi Omni Flash / Veo3 bị kẹt Hàng đợi (I2V maxReferenceImages)...');

// 1. Sửa app/out/main/index.js
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const targetMain = 'if(this.providerId==="veo3"){const A=vr(e.payload,this.getVideoCatalog?.()),o=this.readVideoMode(e),n=this.readReferenceAssetIds(e);if(o==="R2V"&&n.length<1)throw new p("PROVIDER_REJECTED","Reference-to-Video needs at least 1 reference image");if(o==="I2V"&&n.length<1)throw new p("PROVIDER_REJECTED","Image-to-Video needs at least 1 reference image");if(o==="Frames"&&n.length<2)throw new p("PROVIDER_REJECTED","Frames mode needs start and end reference images");if(n.length>A.maxReferenceImages)throw new p("PROVIDER_REJECTED",`${A.modelName} allows up to ${A.maxReferenceImages} reference images in ${o}`);return}';

const replMain = 'if(this.providerId==="veo3"){const A=vr(e.payload,this.getVideoCatalog?.()),o=this.readVideoMode(e),n=Zm(o,this.readReferenceAssetIds(e));if(o==="R2V"&&n.length<1)throw new p("PROVIDER_REJECTED","Reference-to-Video needs at least 1 reference image");if(o==="I2V"&&n.length<1)throw new p("PROVIDER_REJECTED","Image-to-Video needs at least 1 reference image");if(o==="Frames"&&n.length<2)throw new p("PROVIDER_REJECTED","Frames mode needs start and end reference images");if(n.length>A.maxReferenceImages)throw new p("PROVIDER_REJECTED",`${A.modelName} allows up to ${A.maxReferenceImages} reference images in ${o}`);return}';

if (!mainContent.includes(targetMain)) {
  throw new Error('targetMain not found in app/out/main/index.js');
}
mainContent = mainContent.replace(targetMain, replMain);
fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('✅ Đã vá app/out/main/index.js: tự động chuẩn hóa số lượng ảnh tham chiếu cho Veo3!');

// 2. Sửa app/out/renderer/assets/VideoFactoryStudio.js
const vfsPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let vfsContent = fs.readFileSync(vfsPath, 'utf8');

// Target Fashion 1 (single video)
const ft1 = 'videoMode: validAssetId ? "I2V" : "T2V",\n          mode: validAssetId ? "I2V" : "T2V",\n          referenceAssetIds: sceneRefIds,';
const fr1 = 'videoMode: validAssetId ? "I2V" : "T2V",\n          mode: validAssetId ? "I2V" : "T2V",\n          referenceAssetIds: validAssetId ? [validAssetId] : [],';
if (!vfsContent.includes(ft1)) {
  // Try CRLF
  const ft1_crlf = 'videoMode: validAssetId ? "I2V" : "T2V",\r\n          mode: validAssetId ? "I2V" : "T2V",\r\n          referenceAssetIds: sceneRefIds,';
  if (!vfsContent.includes(ft1_crlf)) throw new Error('ft1 not found in VideoFactoryStudio.js');
  vfsContent = vfsContent.replace(ft1_crlf, fr1);
} else {
  vfsContent = vfsContent.replace(ft1, fr1);
}

// Target Fashion 2 (batch videos)
const ft2 = 'videoMode: validAssetId ? "I2V" : "T2V",\n            mode: validAssetId ? "I2V" : "T2V",\n            referenceAssetIds: sceneRefIds,';
const fr2 = 'videoMode: validAssetId ? "I2V" : "T2V",\n            mode: validAssetId ? "I2V" : "T2V",\n            referenceAssetIds: validAssetId ? [validAssetId] : [],';
if (!vfsContent.includes(ft2)) {
  const ft2_crlf = 'videoMode: validAssetId ? "I2V" : "T2V",\r\n            mode: validAssetId ? "I2V" : "T2V",\r\n            referenceAssetIds: sceneRefIds,';
  if (!vfsContent.includes(ft2_crlf)) throw new Error('ft2 not found in VideoFactoryStudio.js');
  vfsContent = vfsContent.replace(ft2_crlf, fr2);
} else {
  vfsContent = vfsContent.replace(ft2, fr2);
}

// Target Household Goods 1 & 2
const ht1 = 'flowVideoMode: hasRef ? "I2V" : "T2V",\n            mode: hasRef ? "I2V" : "T2V",\n            referenceAssetIds: allRefIds.slice(0, 3),';
const hr1 = 'flowVideoMode: hasRef ? "I2V" : "T2V",\n            mode: hasRef ? "I2V" : "T2V",\n            referenceAssetIds: validShowroomId ? [validShowroomId] : (allRefIds[0] ? [allRefIds[0]] : []),';

if (vfsContent.includes(ht1)) {
  vfsContent = vfsContent.replaceAll(ht1, hr1);
} else {
  const ht1_crlf = 'flowVideoMode: hasRef ? "I2V" : "T2V",\r\n            mode: hasRef ? "I2V" : "T2V",\r\n            referenceAssetIds: allRefIds.slice(0, 3),';
  if (!vfsContent.includes(ht1_crlf)) throw new Error('ht1 not found in VideoFactoryStudio.js');
  vfsContent = vfsContent.replaceAll(ht1_crlf, hr1);
}

fs.writeFileSync(vfsPath, vfsContent, 'utf8');
console.log('✅ Đã vá app/out/renderer/assets/VideoFactoryStudio.js: nạp đúng 1 ảnh bắt đầu cho Veo3 I2V!');

// 3. Kiểm tra cú pháp
execSync(`node -c "${mainPath}"`);
execSync(`node -c "${vfsPath}"`);
console.log('🎉 Cú pháp JavaScript hợp lệ 100%!');

// 4. Mở khóa Cooldown các tài khoản Veo3 trong AI_VIDEO_LIBRARY_DATA
const sessionPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/browser-sessions.json';
if (fs.existsSync(sessionPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
    let unlocked = 0;
    (data.sessions || []).forEach(s => {
      if (s.providerId === 'veo3' && s.diagnostics?.cooldownUntil) {
        delete s.diagnostics.cooldownUntil;
        delete s.diagnostics.cooldownReason;
        s.diagnostics.lastError = undefined;
        unlocked++;
      }
    });
    fs.writeFileSync(sessionPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`⚡ Đã mở khóa ngay lập tức ${unlocked} tài khoản Veo3 đang bị dính cooldown!`);
  } catch (err) {
    console.warn('Không thể mở khóa cooldown session:', err.message);
  }
}
