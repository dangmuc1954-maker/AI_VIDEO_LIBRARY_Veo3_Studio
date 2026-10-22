const fs = require('fs');
const path = require('path');

console.log('=== BẮT ĐẦU CHUYỂN MUSE AI THÀNH NỀN TẢNG MẶC ĐỊNH (DEFAULT PROVIDER) TRONG BROWSER HUB ===');

// =========================================================================
// 1. PATCH app/out/main/index.js
// =========================================================================
const mainPath = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

// A. Add muse_def to ic array
const targetIc = 'ic=[$d,Au,ou,ru,Vd]';
if (mainContent.includes(targetIc)) {
  const replacementIc = `muse_sc=MA("muse")||{id:"muse",name:"Muse AI",startUrl:"https://muse.ai/",supportedJobTypes:["Video Generation","Image to Video","Chat","Reference Assets"]},muse_def={definition:{...muse_sc,loginUrlPatterns:[/login/i,/sign-in/i,/auth/i],readyUrlPatterns:[/muse\\.ai/i]},resolveAuthStatus:Gn,detectPageState:ec},ic=[$d,Au,ou,ru,Vd,muse_def]`;
  mainContent = mainContent.replace(targetIc, replacementIc);
  console.log('✓ [main/index.js] Đã thêm muse_def vào mảng ic (Built-in Providers array)');
} else if (mainContent.includes('ic=[$d,Au,ou,ru,Vd,muse_def]')) {
  console.log('✓ [main/index.js] ic đã chứa muse_def trước đó');
} else {
  console.warn('⚠️ [main/index.js] Không tìm thấy chuỗi targetIc!');
}

// B. Normalize session provider for Muse AI & isCustomProvider in main
const targetSessionMap = 's=A.providerId||oA().find(m=>m.name===A.provider)?.id||A.provider,i=s==="banana"||s==="veo3";';
if (mainContent.includes(targetSessionMap)) {
  const replaceSessionMap = `s=A.providerId||oA().find(m=>m.name===A.provider)?.id||A.provider;if((s&&String(s).toLowerCase().includes("muse"))||(A.provider&&A.provider.toLowerCase().includes("muse"))||(A.startUrl&&A.startUrl.includes("muse.ai"))){s="muse";A.provider="Muse AI"}const i=s==="banana"||s==="veo3";`;
  mainContent = mainContent.replace(targetSessionMap, replaceSessionMap);
  console.log('✓ [main/index.js] Đã chuẩn hóa session provider cho Muse AI');
} else {
  console.log('ℹ️ [main/index.js] targetSessionMap đã được thay thế hoặc có định dạng khác');
}

// C. Ensure listProviders() never tags Muse AI as custom
const targetListProviders = 'listProviders(){return oA().map(e=>({providerId:e.id,name:e.name,startUrl:e.startUrl,supportedJobTypes:e.supportedJobTypes,isCustom:!dA.some(t=>t.id===e.id)}))}';
if (mainContent.includes(targetListProviders)) {
  const replaceListProviders = `listProviders(){return oA().map(e=>{const _m=e.id==="muse"||(e.name&&e.name.toLowerCase().includes("muse"))||(e.startUrl&&e.startUrl.includes("muse.ai"));return{providerId:_m?"muse":e.id,name:_m?"Muse AI":e.name,startUrl:_m?"https://muse.ai/":e.startUrl,supportedJobTypes:_m?["Video Generation","Image to Video","Reference Assets","Browser Request"]:e.supportedJobTypes,isCustom:_m?false:!dA.some(t=>t.id===e.id)}})}`;
  mainContent = mainContent.replace(targetListProviders, replaceListProviders);
  console.log('✓ [main/index.js] Đã cập nhật listProviders() để Muse AI luôn là Mặc Định (isCustom: false)');
} else {
  console.log('ℹ️ [main/index.js] listProviders() đã được cập nhật trước đó');
}

// D. Filter out custom provider duplicate for muse in Gl (Custom Provider Manager)
const targetGlHydrate = 'this.providers=(t.providers||[]).flatMap(A=>{try{return typeof A.providerId!="string"||!A.providerId.startsWith("custom-")?[]:[{providerId:A.providerId,name:so(A.name),startUrl:io(A.startUrl),createdAt:A.createdAt||new Date().toISOString(),updatedAt:A.updatedAt||A.createdAt||new Date().toISOString()}]}catch{return[]}})';
if (mainContent.includes(targetGlHydrate)) {
  const replaceGlHydrate = 'this.providers=(t.providers||[]).flatMap(A=>{try{if(A.startUrl&&A.startUrl.includes("muse.ai"))return[];if(A.name&&A.name.toLowerCase().includes("muse"))return[];return typeof A.providerId!="string"||!A.providerId.startsWith("custom-")?[]:[{providerId:A.providerId,name:so(A.name),startUrl:io(A.startUrl),createdAt:A.createdAt||new Date().toISOString(),updatedAt:A.updatedAt||A.createdAt||new Date().toISOString()}]}catch{return[]}})';
  mainContent = mainContent.replace(targetGlHydrate, replaceGlHydrate);
  console.log('✓ [main/index.js] Đã loại bỏ custom provider trùng lặp cho Muse AI trong Gl.hydrate');
}

fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('✅ Đã lưu main/index.js thành công!');

// =========================================================================
// 2. PATCH app/out/renderer/assets/BrowserHub-44JPDUjK.js
// =========================================================================
const hubPath = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'BrowserHub-44JPDUjK.js');
let hubContent = fs.readFileSync(hubPath, 'utf8');

// A. Patch oe(t) function
const targetOe = 'function oe(t){return{providerId:t.providerId,provider:t.name,startUrl:t.startUrl,capabilities:(t.name&&t.name.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))?["Video Generation","Image to Video","Reference Assets","Browser Request"]:t.supportedJobTypes,isCustom:t.isCustom===!0}}';
if (hubContent.includes(targetOe)) {
  const replaceOe = 'function oe(t){const _m=(t.name&&t.name.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))||t.providerId==="muse"||t.id==="muse";return{providerId:_m?"muse":t.providerId,provider:_m?"Muse AI":t.name,startUrl:_m?"https://muse.ai/":t.startUrl,capabilities:_m?["Video Generation","Image to Video","Reference Assets","Browser Request"]:t.supportedJobTypes,isCustom:_m?false:t.isCustom===!0}}';
  hubContent = hubContent.replace(targetOe, replaceOe);
  console.log('✓ [BrowserHub] Đã cập nhật hàm oe(t) để Muse AI luôn nhận isCustom = false (Mặc Định)');
} else {
  console.log('ℹ️ [BrowserHub] Hàm oe(t) đã được cập nhật trước đó');
}

// B. Patch session mapping right before oe
const targetHubSession = 'return{accountId:t.accountId,providerId:t.providerId,provider:t.provider,';
if (hubContent.includes(targetHubSession)) {
  const replaceHubSession = 'const _mSes=(t.provider&&t.provider.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))||t.providerId==="muse";return{accountId:t.accountId,providerId:_mSes?"muse":t.providerId,provider:_mSes?"Muse AI":t.provider,';
  hubContent = hubContent.replace(targetHubSession, replaceHubSession);
  console.log('✓ [BrowserHub] Đã chuẩn hóa session mapping cho Muse AI');
}

fs.writeFileSync(hubPath, hubContent, 'utf8');
console.log('✅ Đã lưu BrowserHub-44JPDUjK.js thành công!');

console.log('=== HOÀN TẤT BẢN VÁ CHO MUSE AI THÀNH NỀN TẢNG MẶC ĐỊNH! ===');
