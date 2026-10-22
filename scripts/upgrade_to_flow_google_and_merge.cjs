const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🚀 NÂNG CẤP LÕI FLOW.GOOGLE & TÍCH HỢP TÍNH NĂNG ĐỘC QUYỀN TRIS 🚀');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const unpDir = 'C:/Users/admin/.gemini/antigravity-ide/brain/a0f50469-996d-415b-b43d-14f2005aedd4/scratch/unpacked_aiforge/out';
const appOutDir = path.join(rootDir, 'app/out');

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

// 1. COPY NEW OUT
console.log('[1/6] Sao chép toàn bộ out mới từ Build #20260912124003 vào app/out...');
copyDir(unpDir, appOutDir);
console.log('  ✓ Đã cập nhật out/ mới thành công.');

// 2. PATCH app/out/main/index.js
console.log('\n[2/6] Ghép nối các module độc quyền vào main/index.js...');
const mainPath = path.join(appOutDir, 'main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 2a. Add top node imports
const topImports = `import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\nimport nodeChild from "node:child_process";\n`;
mainCode = topImports + mainCode;

// 2b. Add UserData Isolation and Branding early hook
if (!mainCode.includes('com.tris.aivideolibrary.studio')) {
  const reqMatch = mainCode.match(/([A-Za-z0-9_$]+=[A-Za-z0-9_$]+\.createRequire\(import\.meta\.url\),)/);
  if (reqMatch) {
    const targetAnchor = reqMatch[1];
    const baseAnchor = targetAnchor.endsWith(',') ? targetAnchor.slice(0, -1) : targetAnchor;
    const ISOLATION_SNIPPET = `;try{const _ud=L(F.getPath("appData"),"AI_VIDEO_LIBRARY_DATA");F.setName("AI VIDEO LIBRARY");F.setAppUserModelId("com.tris.aivideolibrary.studio");F.setPath("userData",_ud);if(!Je(_ud))Dd(_ud,{recursive:!0});}catch(e){console.error("[Isolation Hook Error]",e);};const `;
    mainCode = mainCode.replace(targetAnchor, baseAnchor + ISOLATION_SNIPPET);
    console.log('  ✓ Đã chèn UserData isolation & App name');
  } else {
    console.warn('  ⚠️ Không tìm thấy createRequire anchor trong main/index.js');
  }
}

// 2c. Inject Tris's 3 AssetStore methods
const customMethods = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/a0f50469-996d-415b-b43d-14f2005aedd4/scratch/clean_custom_methods.js', 'utf8');
const mergeAudiosAnchor = 'async mergeAudios(e,t=0,A={}){';
if (mainCode.includes(mergeAudiosAnchor)) {
  mainCode = mainCode.replace(mergeAudiosAnchor, customMethods + '\n' + mergeAudiosAnchor);
  console.log('  ✓ Đã chèn 3 phương thức (syncVoiceoverVideo, muxAudioIntoVideo, transcribeVideoAudio) vào AssetStore');
} else {
  console.error('  ❌ Không tìm thấy mergeAudiosAnchor trong main/index.js!');
  process.exit(1);
}

// 2d. Inject IPC Handlers
const ipmAnchor = 'E.handle("assets:cancelMerge",';
const customIpcHandlers = `
E.handle("assets:syncVoiceoverVideo", async (A, videoAssetId, audioAssetId, options) => {
  C(A);
  const s = lt.begin(Lo(options));
  try {
    K(s?.controller.signal);
    return await V.syncVoiceoverVideo(videoAssetId, audioAssetId, { ...options, signal: s?.controller.signal });
  } finally {
    lt.finish(s);
  }
}),
E.handle("assets:muxAudioVideo", async (A, videoAssetId, audioAssetId, options) => {
  C(A);
  const s = lt.begin(Lo(options));
  try {
    K(s?.controller.signal);
    return await V.muxAudioIntoVideo(videoAssetId, audioAssetId, { ...options, signal: s?.controller.signal });
  } finally {
    lt.finish(s);
  }
}),
E.handle("assets:transcribeVideoAudio", async (A, videoAssetId, options) => {
  C(A);
  const s = lt.begin(Lo(options));
  try {
    K(s?.controller.signal);
    return await V.transcribeVideoAudio(videoAssetId, { ...options, signal: s?.controller.signal });
  } finally {
    lt.finish(s);
  }
}),
`;

if (mainCode.includes(ipmAnchor)) {
  mainCode = mainCode.replace(ipmAnchor, customIpcHandlers + '\n' + ipmAnchor);
  console.log('  ✓ Đã đăng ký 3 IPC handlers cho Assets (syncVoiceoverVideo, muxAudioVideo, transcribeVideoAudio)');
} else {
  console.error('  ❌ Không tìm thấy ipmAnchor trong main/index.js!');
  process.exit(1);
}

// 2e. Rebranding in main/index.js
mainCode = mainCode.replace(/aiforge-asset:\/\//g, 'aivideo-asset://');
mainCode = mainCode.replace(/scheme:"aiforge-asset"/g, 'scheme:"aivideo-asset"');
mainCode = mainCode.replace(/\$i\.handle\("aiforge-asset"/g, '$i.handle("aivideo-asset"');
mainCode = mainCode.replace(/title:"AIForge\s*Studio"/g, 'title:"AI VIDEO LIBRARY"');
mainCode = mainCode.replace(/title:"AIForge"/g, 'title:"AI VIDEO LIBRARY"');
mainCode = mainCode.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
mainCode = mainCode.replace(/aiforge-studio/g, 'ai-video-library');

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  ✓ Đã lưu main/index.js hoàn tất.');

// 3. PATCH preload/index.cjs
console.log('\n[3/6] Cập nhật preload/index.cjs...');
const preloadPath = path.join(appOutDir, 'preload/index.cjs');
let preloadCode = fs.readFileSync(preloadPath, 'utf8');

// Add custom asset methods to assets api object
const assetApiTarget = 'd={importImageSource:';
const customAssetApi = 'd={syncVoiceoverVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:syncVoiceoverVideo",e,n,s),muxAudioVideo:(e,n,s)=>r.ipcRenderer.invoke("assets:muxAudioVideo",e,n,s),transcribeVideoAudio:(e,n)=>r.ipcRenderer.invoke("assets:transcribeVideoAudio",e,n),importImageSource:';
if (preloadCode.includes(assetApiTarget)) {
  preloadCode = preloadCode.replace(assetApiTarget, customAssetApi);
  console.log('  ✓ Đã bổ sung API syncVoiceoverVideo, muxAudioVideo, transcribeVideoAudio vào preload assets');
} else {
  console.warn('  ⚠️ Không tìm thấy assetApiTarget trong preload/index.cjs');
}

// Expose both aivideo and aiforge
const exposeTarget = 'r.contextBridge.exposeInMainWorld("aiforge",{';
if (preloadCode.includes(exposeTarget)) {
  preloadCode = preloadCode.replace(
    exposeTarget,
    'r.contextBridge.exposeInMainWorld("aivideo",{app:g,browser:s,browserRequest:t,queue:c,assets:d,tts:a,chat:l,workflows:p,http:v,excel:k,license:u,workflowStore:R,settings:w,googleFlowVideoCatalog:h});r.contextBridge.exposeInMainWorld("aiforge",{'
  );
  console.log('  ✓ Đã expose song song window.aivideo và window.aiforge');
}
fs.writeFileSync(preloadPath, preloadCode, 'utf8');

// 4. PATCH package.json
console.log('\n[4/6] Đồng bộ package.json...');
const pkgPath = path.join(rootDir, 'app/package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
pkg.name = 'ai-video-library';
pkg.productName = 'AI VIDEO LIBRARY';
pkg.description = 'AI VIDEO LIBRARY - Creative AI Video & Workflow Studio';
pkg.author = 'AI VIDEO LIBRARY';
pkg.version = '0.1.0-build.20260912124003';
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
console.log('  ✓ Đã cập nhật version và metadata trong app/package.json');

// 5. PATCH RENDERER: Top ElevenLabs Voice Bar in VideoStudio
console.log('\n[5/6] Tích hợp thanh điều khiển ElevenLabs Voice Bar vào VideoStudio...');
const vsDir = path.join(appOutDir, 'renderer/assets');
const vsFiles = fs.readdirSync(vsDir).filter(f => f.startsWith('VideoStudio-') && f.endsWith('.js'));

const topToolbarBanner = `e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/70 via-[#130f24] to-cyan-950/50 px-4 py-2.5 shadow-md",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:"flex items-center gap-2 cursor-pointer select-none",onClick:()=>{if(H){const u=H.tts?.enabled;Q(H.id,{tts:{enabled:!u,voiceId:H.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:H.tts?.voiceName||"Rachel",script:H.tts?.script||"",modelId:H.tts?.modelId||"eleven_multilingual_v2"}})}},children:[e.jsx("span",{className:"text-base animate-pulse",children:"🎙️"}),e.jsxs("div",{children:[e.jsx("span",{className:"text-xs font-bold text-cyan-300 uppercase tracking-wider block",children:"Lồng Tiếng ElevenLabs"}),e.jsx("span",{className:"text-[10px] text-text-muted block",children:H?\`Phân cảnh #\${H.index}: \${H.tts?.enabled?"Đang bật giọng "+(H.tts?.voiceName||"Rachel"):"Chưa bật"}\`:"Tự động ghép giọng vào video"})]})]}),e.jsxs("button",{type:"button",onClick:()=>{if(H){const u=H.tts?.enabled;Q(H.id,{tts:{enabled:!u,voiceId:H.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:H.tts?.voiceName||"Rachel",script:H.tts?.script||"",modelId:H.tts?.modelId||"eleven_multilingual_v2"}})}},className:\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-sm \${H?.tts?.enabled?"bg-cyan-500 text-black border-cyan-400 font-extrabold shadow-cyan-500/30":"bg-white/10 text-white/70 border-white/20 hover:border-cyan-400 hover:text-white"}\`,children:[e.jsx("span",{className:\`w-2 h-2 rounded-full \${H?.tts?.enabled?"bg-black":"bg-text-muted"}\`}),H?.tts?.enabled?"ĐANG BẬT":"TẮT"]}),e.jsx("button",{type:"button",title:"Bật/Tắt lồng tiếng cho TẤT CẢ các phân cảnh",onClick:()=>{const tg=!(H?.tts?.enabled);re.forEach(rw=>{Q(rw.id,{tts:{enabled:tg,voiceId:rw.tts?.voiceId||H?.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",voiceName:rw.tts?.voiceName||H?.tts?.voiceName||"Rachel",script:rw.tts?.script||"",modelId:rw.tts?.modelId||"eleven_multilingual_v2"}})})},className:"text-[10px] font-semibold text-cyan-400/90 hover:text-cyan-300 underline underline-offset-2 ml-1 cursor-pointer",children:H?.tts?.enabled?"Áp dụng tất cả":"Bật cho tất cả"})]}),H?.tts?.enabled?e.jsxs("div",{className:"flex flex-1 min-w-[300px] max-w-[650px] items-center gap-2 justify-end",children:[e.jsx("select",{value:H.tts?.voiceId||"21m00Tcm4TlvDq8ikWAM",onChange:p=>{const v=p.target.value,w=p.target.options[p.target.selectedIndex].text;Q(H.id,{tts:{...(H.tts||{}),voiceId:v,voiceName:w}})},className:"h-7 rounded-lg border border-cyan-500/40 bg-[#130f24] px-2 text-[11px] font-medium text-cyan-200 outline-none focus:border-cyan-400 shrink-0",children:[e.jsx("option",{value:"21m00Tcm4TlvDq8ikWAM",children:"Rachel (Nữ)"}),e.jsx("option",{value:"pNInz6obpgDQGcFmaJgB",children:"Adam (Nam)"}),e.jsx("option",{value:"ErXwobaYiN019PkySvjV",children:"Antoni (Nam)"}),e.jsx("option",{value:"EXAVITQu4vr4xnSDxMaL",children:"Bella (Nữ)"}),e.jsx("option",{value:"VR6AewLTigWG4xSOukaG",children:"Arnold (Nam)"}),e.jsx("option",{value:"AZnzlk1XvdvUeBnXmlld",children:"Domi (Nữ)"}),e.jsx("option",{value:"MF3mGyEYCl7XYWbV9V6O",children:"Elli (Nữ)"}),e.jsx("option",{value:"TxGEqnHWrfWFTfGW9XjX",children:"Josh (Nam)"})]}),e.jsx("input",{type:"text",value:H.tts?.voiceId||"",onChange:p=>{const v=p.target.value.trim().replace(/^.*voices\\//i,"").replace(/\\?.*$/,"");Q(H.id,{tts:{...(H.tts||{}),voiceId:v,voiceName:v?\`Custom (\${v.slice(0,6)}...)\`:""}})},placeholder:"Voice ID...",className:"w-24 h-7 rounded-lg border border-white/15 bg-[#130f24] px-2 text-[10px] text-text-primary outline-none focus:border-cyan-400 shrink-0"}),e.jsx("input",{type:"text",value:H.tts?.script||"",onChange:p=>Q(H.id,{tts:{...(H.tts||{}),script:p.target.value}}),placeholder:\`Nhập lời thoại nhân vật cho Phân cảnh #\${H.index}...\`,className:"flex-1 h-7 rounded-lg border border-cyan-500/50 bg-[#130f24] px-2.5 text-xs text-white placeholder:text-text-muted/60 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"})]}):e.jsx("div",{className:"text-[11px] text-text-muted italic",children:"Bấm nút [TẮT / ĐANG BẬT] ở trên để lồng tiếng ElevenLabs cho phân cảnh này"})]}),`;

for (const vsFile of vsFiles) {
  const fullVsPath = path.join(vsDir, vsFile);
  let vsCode = fs.readFileSync(fullVsPath, 'utf8');

  // Find header anchor in new VideoStudio
  const newVsAnchor = 'e.jsx("span",{children:P("videoStudio.videoCountText",{count:se})})]})]})]})]}),';
  if (vsCode.includes(newVsAnchor)) {
    if (!vsCode.includes('Lồng Tiếng ElevenLabs')) {
      vsCode = vsCode.replace(newVsAnchor, newVsAnchor + topToolbarBanner);
      fs.writeFileSync(fullVsPath, vsCode, 'utf8');
      console.log('  ✓ Đã gắn ElevenLabs Voice Bar vào:', vsFile);
    } else {
      console.log('  [-] Đã có sẵn ElevenLabs Voice Bar trong:', vsFile);
    }
  } else {
    console.warn('  ⚠️ Không tìm thấy newVsAnchor trong:', vsFile);
  }
}

// Rebrand all renderer assets
for (const file of fs.readdirSync(vsDir)) {
  if (!file.endsWith('.js') && !file.endsWith('.html') && !file.endsWith('.css')) continue;
  const fPath = path.join(vsDir, file);
  let content = fs.readFileSync(fPath, 'utf8');
  content = content.replace(/aiforge-asset:\/\//g, 'aivideo-asset://');
  content = content.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
  content = content.replace(/AIForge\s*License\s*Center/gi, 'AI VIDEO LIBRARY — License Center');
  content = content.replace(/AIForge\s*Hub/gi, 'AI VIDEO LIBRARY Hub');
  content = content.replace(/AIForge\s*Archive\s*History/gi, 'AI VIDEO LIBRARY Archive History');
  content = content.replace(/AIForge/g, 'AI VIDEO LIBRARY');
  content = content.replace(/aiforge-studio/g, 'ai-video-library');
  fs.writeFileSync(fPath, content, 'utf8');
}
console.log('  ✓ Đã hoàn tất đổi tên thương hiệu AI VIDEO LIBRARY trên toàn bộ Renderer');

// 6. SYNTAX VALIDATION
console.log('\n[6/6] Kiểm tra cú pháp file biên dịch...');
try {
  execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
  console.log('  ✅ main/index.js: CÚ PHÁP CHÍNH XÁC 100%!');
} catch (e) {
  console.error('  ❌ Lỗi cú pháp trong main/index.js:', e.message);
  process.exit(1);
}

try {
  execSync(`node --check "${preloadPath}"`, { stdio: 'inherit' });
  console.log('  ✅ preload/index.cjs: CÚ PHÁP CHÍNH XÁC 100%!');
} catch (e) {
  console.error('  ❌ Lỗi cú pháp trong preload/index.cjs:', e.message);
  process.exit(1);
}

console.log('\n🌟 TOÀN BỘ QUÁ TRÌNH NÂNG CẤP & GHÉP SOURCE ĐÃ THÀNH CÔNG RỰC RỠ! 🌟');
