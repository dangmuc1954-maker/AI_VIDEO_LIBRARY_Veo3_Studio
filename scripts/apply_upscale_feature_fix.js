const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('======================================================================');
console.log('🚀 FIX & MỞ KHÓA TOÀN DIỆN TÍNH NĂNG UPSCALE ẢNH & VIDEO CHO AI VIDEO LIBRARY');
console.log('======================================================================');

// 1. Patch app/out/renderer/assets/licenseCapabilities-HpsCBvbh.js
const capJsPath = path.resolve(__dirname, '../app/out/renderer/assets/licenseCapabilities-HpsCBvbh.js');
if (fs.existsSync(capJsPath)) {
  const capContent = `import{bE as s,bn as r}from"./index-BS7vgKVV.js";import{n as t}from"./license-DSPJjoqg.js";function m(a,e=s.getState().status){return!0}function c(a,e){return[]}function d(a){const e=s(i=>i.status);return{allowed:!0,allowedPlanNames:[],currentPlanName:e?.planName||"VIP"}}export{m as h,d as u};\n`;
  fs.writeFileSync(capJsPath, capContent, 'utf8');
  console.log('✅ [1] Đã mở khóa 100% licenseCapabilities hook cho renderer (2K, 4K, video autoUpscale, watermark)');
} else {
  console.error('❌ Không tìm thấy file:', capJsPath);
}

// 2. Patch app/out/main/index.js
const mainJsPath = path.resolve(__dirname, '../app/out/main/index.js');
if (fs.existsSync(mainJsPath)) {
  let mainCode = fs.readFileSync(mainJsPath, 'utf8');

  // 2a. Bypass missingCapabilityForJob
  const oldMissingCap = 'missingCapabilityForJob(e,t){const A=jy(e);if(A.length===0)return;const o=new Set(Oo(t));return A.find(n=>!o.has(n))}';
  const newMissingCap = 'missingCapabilityForJob(e,t){return void 0}';
  if (mainCode.includes(oldMissingCap)) {
    mainCode = mainCode.replace(oldMissingCap, newMissingCap);
    console.log('✅ [2a] Đã bypass missingCapabilityForJob() trong backend');
  } else if (mainCode.includes(newMissingCap)) {
    console.log('ℹ️ [2a] missingCapabilityForJob() đã được bypass từ trước');
  } else {
    console.warn('⚠️ [2a] Không tìm thấy pattern oldMissingCap trong main/index.js');
  }

  // 2b. Always provide all capabilities in toStatusSnapshot
  const oldSnapshot = 'capabilities:Oo(e.capabilities)';
  const newSnapshot = 'capabilities:Vg';
  if (mainCode.includes(oldSnapshot)) {
    mainCode = mainCode.replace(oldSnapshot, newSnapshot);
    console.log('✅ [2b] Đã cập nhật toStatusSnapshot() luôn trả về đầy đủ capabilities Vg');
  } else if (mainCode.includes(newSnapshot)) {
    console.log('ℹ️ [2b] toStatusSnapshot() đã trả về Vg từ trước');
  } else {
    console.warn('⚠️ [2b] Không tìm thấy pattern capabilities:Oo(e.capabilities)');
  }

  fs.writeFileSync(mainJsPath, mainCode, 'utf8');
} else {
  console.error('❌ Không tìm thấy file:', mainJsPath);
}

// 3. Patch license_server/server.js
const serverJsPath = path.resolve(__dirname, '../license_server/server.js');
if (fs.existsSync(serverJsPath)) {
  let serverCode = fs.readFileSync(serverJsPath, 'utf8');
  
  // Ensure capabilities array in payload
  const defaultCaps = 'capabilities: ["upscale_image", "upscale_video", "remove_watermark_image", "remove_watermark_video"],';
  
  // Patch check-in payload (around line 600+)
  if (!serverCode.includes('capabilities: ["upscale_image", "upscale_video"')) {
    serverCode = serverCode.replace(
      /isTrial:\s*effectivePlanCode\s*===\s*'trial',/g,
      `isTrial: effectivePlanCode === 'trial',\n        ${defaultCaps}`
    );
    serverCode = serverCode.replace(
      /isTrial:\s*true,/g,
      `isTrial: true,\n        ${defaultCaps}`
    );
    serverCode = serverCode.replace(
      /isTrial:\s*false,/g,
      `isTrial: false,\n        ${defaultCaps}`
    );
    fs.writeFileSync(serverJsPath, serverCode, 'utf8');
    console.log('✅ [3] Đã thêm full capabilities vào token generator của license server');
  } else {
    console.log('ℹ️ [3] License server đã có cấu hình capabilities');
  }
}

// 4. Update local user license in %APPDATA%/AI VIDEO LIBRARY/license-state.production.json
const localLicensePath = path.resolve(process.env.APPDATA, 'AI VIDEO LIBRARY/license-state.production.json');
if (fs.existsSync(localLicensePath)) {
  try {
    const licData = JSON.parse(fs.readFileSync(localLicensePath, 'utf8'));
    const { getOrCreateKeyPair, signEntitlementToken } = require('../license_server/cryptoUtils');
    const keyData = getOrCreateKeyPair();

    // Decode existing token payload
    const tokenParts = licData.entitlementToken.split('.');
    if (tokenParts.length >= 2) {
      const payloadBuf = Buffer.from(tokenParts[1], 'base64');
      const payload = JSON.parse(payloadBuf.toString('utf8'));
      
      // Upgrade payload with full capabilities & Pro/VIP tier
      payload.capabilities = [
        "upscale_image",
        "upscale_video",
        "remove_watermark_image",
        "remove_watermark_video"
      ];
      payload.plan = "vip";
      payload.planName = "VIP Vĩnh Viễn";
      payload.planTier = "ultra";
      payload.status = "active";
      payload.limits = {
        unlimited: true,
        maxConcurrency: 50
      };

      const newToken = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);
      licData.entitlementToken = newToken;
      fs.writeFileSync(localLicensePath, JSON.stringify(licData, null, 2), 'utf8');
      console.log('✅ [4] Đã ký lại license token bản quyền trên máy Tris với FULL 4 CAPABILITIES!');
    }
  } catch (err) {
    console.warn('⚠️ [4] Không thể cập nhật local license state:', err.message);
  }
}

console.log('🎉 TẤT CẢ PATCH ĐÃ ÁP DỤNG XONG!');
