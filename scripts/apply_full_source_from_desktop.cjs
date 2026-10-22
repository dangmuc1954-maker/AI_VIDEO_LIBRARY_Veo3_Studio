const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🔄 ĐỒNG BỘ FULL SOURCE GỐC TỪ "AIForge Studio.lnk" SANG DỰ ÁN 🔄');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'scratch/full_source_aiforge_desktop');
const targetAppDir = path.join(rootDir, 'app');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// 1. Copy full out from desktop source
console.log('[1/5] Sao chép toàn bộ thư mục out/ từ app gốc...');
const targetOut = path.join(targetAppDir, 'out');
if (fs.existsSync(targetOut)) {
  fs.rmSync(targetOut, { recursive: true, force: true });
}
copyDir(path.join(srcDir, 'out'), targetOut);
console.log('  ✓ Đã chép sạch sẽ toàn bộ out/ gốc!');

// 2. Bảo tồn Logo của Tris
console.log('[2/5] Bảo toàn Logo thương hiệu Robot AI của Tris...');
const trisLogo = path.join(rootDir, 'assets/logo.png');
if (fs.existsSync(trisLogo)) {
  fs.copyFileSync(trisLogo, path.join(targetOut, 'renderer/app-icon.png'));
  console.log('  ✓ Đã cập nhật renderer/app-icon.png bằng logo của Tris.');
}

// 3. Patch out/main/index.js: Tích hợp License Server của Tris & App Name
console.log('[3/5] Tích hợp License Server Tris & Đặt tên ứng dụng AI VIDEO LIBRARY...');
const mainPath = path.join(targetOut, 'main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 3a. App Name & Isolation Hook
const quitAnchor = 'td||F.quit();';
if (mainCode.includes(quitAnchor)) {
  const isolationSnippet = `try{F.setName("AI VIDEO LIBRARY");const _ud=L(F.getPath("appData"),"AI_VIDEO_LIBRARY_DATA");F.setPath("userData",_ud);if(!Je(_ud))Dd(_ud,{recursive:!0});}catch(e){};`;
  mainCode = mainCode.replace(quitAnchor, `${quitAnchor}${isolationSnippet}`);
  console.log('  ✓ Đã cài đặt hook đổi tên app & cô lập UserData: AI_VIDEO_LIBRARY_DATA');
} else {
  console.warn('  ⚠️ Không tìm thấy quitAnchor trong main/index.js');
}

// 3b. Patch Wn() - License Server URL
const wnTarget = 'function Wn(){return(process.env.AFS_BACKEND_URL||od()?.backendUrl||"http://127.0.0.1:8787").replace(/\\/+$/,"")}';
const wnReplacement = 'function Wn(){return(process.env.AIVIDEO_BACKEND_URL||process.env.AFS_BACKEND_URL||od()?.backendUrl||"https://vercelserver-eight.vercel.app").replace(/\\/+$/,"")}';
if (mainCode.includes(wnTarget)) {
  mainCode = mainCode.replace(wnTarget, wnReplacement);
  console.log('  ✓ Đã cập nhật Wn() trỏ về License Server của Tris (https://vercelserver-eight.vercel.app)');
} else {
  console.error('  ❌ Không tìm thấy wnTarget trong main/index.js!');
  process.exit(1);
}

// 3c. Patch DB() - Public Key của Tris
const dbTarget = 'function DB(){const r=process.env.AFS_LICENSE_PUBLIC_KEYS_JSON;if(r)try{const o=JSON.parse(r);if(o&&typeof o=="object"&&!Array.isArray(o))return Object.fromEntries(Object.entries(o).filter(n=>typeof n[1]=="string"&&n[1].trim().length>0))}catch(o){B("license","unable to parse public key registry",{error:v(o)})}const e=process.env.AFS_LICENSE_PUBLIC_KEY_ED25519?.replace(/\\\\n/g,`\n`),t=process.env.AFS_LICENSE_PUBLIC_KEY_ID||"2026-q3";if(e)return{[t]:e};const A=od()?.licensePublicKeys;return A&&typeof A=="object"?Object.fromEntries(Object.entries(A).filter(o=>typeof o[1]=="string"&&o[1].trim().length>0)):{}}';
const dbReplacement = 'function DB(){const _k={"2026-q3":"-----BEGIN PUBLIC KEY-----\\nMCowBQYDK2VwAyEAMAXS0Ql/9WdX8ZAQQQwG4ZG/RYbkegjO2+C8Gptn4mo=\\n-----END PUBLIC KEY-----\\n"};const r=process.env.AIVIDEO_LICENSE_PUBLIC_KEYS_JSON||process.env.AFS_LICENSE_PUBLIC_KEYS_JSON;if(r)try{const o=JSON.parse(r);if(o&&typeof o=="object"&&!Array.isArray(o))return Object.assign({},_k,Object.fromEntries(Object.entries(o).filter(n=>typeof n[1]=="string"&&n[1].trim().length>0)))}catch(o){B("license","unable to parse public key registry",{error:v(o)})}const e=(process.env.AIVIDEO_LICENSE_PUBLIC_KEY_ED25519||process.env.AFS_LICENSE_PUBLIC_KEY_ED25519)?.replace(/\\\\n/g,`\\n`),t=process.env.AIVIDEO_LICENSE_PUBLIC_KEY_ID||process.env.AFS_LICENSE_PUBLIC_KEY_ID||"2026-q3";if(e)return Object.assign({},_k,{[t]:e});const A=od()?.licensePublicKeys;return Object.assign({},_k,A&&typeof A=="object"?Object.fromEntries(Object.entries(A).filter(o=>typeof o[1]=="string"&&o[1].trim().length>0)):{})}';

if (mainCode.includes(dbTarget)) {
  mainCode = mainCode.replace(dbTarget, dbReplacement);
  console.log('  ✓ Đã cập nhật DB() nạp sẵn Public Key Ed25519 bản quyền của Tris');
} else {
  console.error('  ❌ Không tìm thấy dbTarget trong main/index.js!');
  process.exit(1);
}

// 3d. Patch xy(r) - Chấp nhận Audience của Tris (ai-video-library & aiforge-studio)
const xyTarget = 'function xy(r){const e=Math.floor(Date.now()/1e3);if(r.iss!==Oy)throw new Error("Invalid token issuer");if(r.aud!==My)throw new Error("Invalid token audience");if(typeof r.exp!="number"||r.exp<=e)throw new Error("Token has expired");if(typeof r.nbf=="number"&&r.nbf>e+60)throw new Error("Token is not active yet");if(typeof r.iat=="number"&&r.iat>e+300)throw new Error("Token issued in the future")}';
const xyReplacement = 'function xy(r){const e=Math.floor(Date.now()/1e3);if(r.iss!=="aiforge-license-server"&&r.iss!=="ai-video-library-license-server")throw new Error("Invalid token issuer");if(r.aud!=="ai-video-library"&&r.aud!=="aiforge-studio")throw new Error("Invalid token audience");if(typeof r.exp!="number"||r.exp<=e)throw new Error("Token has expired");if(typeof r.nbf=="number"&&r.nbf>e+60)throw new Error("Token is not active yet");if(typeof r.iat=="number"&&r.iat>e+300)throw new Error("Token issued in the future")}';

if (mainCode.includes(xyTarget)) {
  mainCode = mainCode.replace(xyTarget, xyReplacement);
  console.log('  ✓ Đã cập nhật xy(r) xác thực audience ai-video-library & aiforge-studio');
} else {
  console.error('  ❌ Không tìm thấy xyTarget trong main/index.js!');
  process.exit(1);
}

// 3e. Patch requireCustomerIdentifier
const rciTarget = 'requireCustomerIdentifier(){const e=this.options.store.getState().customerIdentifier;if(!e)throw new Error("Enter and save your email or username before continuing.");return Ta(e)}';
const rciReplacement = 'requireCustomerIdentifier(){const e=this.options.store.getState().customerIdentifier;return e?Ta(e):"customer"}';
if (mainCode.includes(rciTarget)) {
  mainCode = mainCode.replace(rciTarget, rciReplacement);
  console.log('  ✓ Đã nới lỏng requireCustomerIdentifier() hỗ trợ fallback định danh');
}

// 3f. Window Title
const winCreationTarget = 'backgroundColor:"#070a11",show:!1,';
const winCreationReplacement = 'backgroundColor:"#070a11",title:"AI VIDEO LIBRARY",show:!0,';
if (mainCode.includes(winCreationTarget)) {
  mainCode = mainCode.replace(winCreationTarget, winCreationReplacement);
  console.log('  ✓ Đã đặt tiêu đề cửa sổ chính: "AI VIDEO LIBRARY"');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  ✓ Đã lưu main/index.js hoàn tất.');

// 4. Preload: Expose song song window.aivideo
console.log('[4/5] Cập nhật preload/index.cjs...');
const preloadPath = path.join(targetOut, 'preload/index.cjs');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');
const exposeTarget = 'r.contextBridge.exposeInMainWorld("aiforge",{';
if (preloadCode.includes(exposeTarget)) {
  preloadCode = preloadCode.replace(
    exposeTarget,
    'r.contextBridge.exposeInMainWorld("aivideo",{app:g,browser:s,browserRequest:t,queue:c,assets:d,tts:a,chat:l,workflows:p,http:v,excel:k,license:u,workflowStore:R,settings:w,googleFlowVideoCatalog:h});r.contextBridge.exposeInMainWorld("aiforge",{'
  );
  fs.writeFileSync(preloadPath, preloadCode, 'utf8');
  console.log('  ✓ Đã expose song song window.aivideo và window.aiforge trong preload');
}

// 5. Package.json
console.log('[5/5] Cập nhật package.json và renderer title...');
const pkgPath = path.join(targetAppDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = 'ai-video-library';
pkg.productName = 'AI VIDEO LIBRARY';
pkg.description = 'AI VIDEO LIBRARY - Creative AI Video & Workflow Studio';
pkg.author = 'AI VIDEO LIBRARY';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');

// Renderer branding
const rendererDir = path.join(targetOut, 'renderer');
const htmlPath = path.join(rendererDir, 'index.html');
if (fs.existsSync(htmlPath)) {
  let html = fs.readFileSync(htmlPath, 'utf8');
  html = html.replace(/<title>.*?<\/title>/i, '<title>AI VIDEO LIBRARY</title>');
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✓ Đã cập nhật tiêu đề index.html: AI VIDEO LIBRARY');
}

// Cú pháp kiểm tra
console.log('\n[*] Kiểm tra cú pháp JavaScript...');
execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
console.log('  ✅ main/index.js: Cú pháp chuẩn 100%');
execSync(`node --check "${preloadPath}"`, { stdio: 'inherit' });
console.log('  ✅ preload/index.cjs: Cú pháp chuẩn 100%');

console.log('\n🌟 ĐỒNG BỘ FULL SOURCE GỐC VÀ TÍCH HỢP BẢN QUYỀN TRIS THÀNH CÔNG! 🌟');
