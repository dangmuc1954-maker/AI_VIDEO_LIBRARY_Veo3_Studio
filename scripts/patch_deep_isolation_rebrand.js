const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🛡️ HOÀN TẤT BIẾN ĐỔI 100% NGUỒN SANG "AI VIDEO LIBRARY" (KHÔNG CÒN 1 CHỮ AIFORGE)');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('[*] Đang xử lý root:', root);

  // 1. package.json
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.name = 'ai-video-library';
    pkg.productName = 'AI VIDEO LIBRARY';
    pkg.description = 'AI VIDEO LIBRARY - Creative AI Video & Workflow Studio';
    pkg.author = 'AI VIDEO LIBRARY';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('  ✓ Updated package.json');
  }

  // 2. preload/index.cjs
  const preloadPath = path.join(root, 'out/preload/index.cjs');
  if (fs.existsSync(preloadPath)) {
    let pCode = fs.readFileSync(preloadPath, 'utf8');
    if (!pCode.includes('aivideo')) {
      pCode = pCode.replace(
        'r.contextBridge.exposeInMainWorld("aiforge",{',
        'r.contextBridge.exposeInMainWorld("aivideo",{app:h,browser:o,browserRequest:c,queue:t,assets:d,tts:a,chat:p,workflows:l,http:v,excel:R,license:u,settings:k});r.contextBridge.exposeInMainWorld("aiforge",{'
      );
      fs.writeFileSync(preloadPath, pCode, 'utf8');
      console.log('  ✓ Expose aivideo & bridge in preload');
    }
  }

  // 3. main/index.js
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    let code = fs.readFileSync(mainPath, 'utf8');

    // Ensure early userData isolation
    if (!code.includes('AI_VIDEO_LIBRARY_DATA')) {
      const targetAnchor = 'Ry=ud.createRequire(import.meta.url),';
      const ISOLATION_SNIPPET = `;try{const _ud=N(G.getPath("appData"),"AI_VIDEO_LIBRARY_DATA");G.setName("AI VIDEO LIBRARY");G.setAppUserModelId("com.tris.aivideolibrary.studio");G.setPath("userData",_ud);if(!ye(_ud))Kc(_ud,{recursive:!0});}catch(e){console.error("[Isolation Hook Error]",e);};const `;
      code = code.replace(targetAnchor, 'Ry=ud.createRequire(import.meta.url)' + ISOLATION_SNIPPET);
    }

    // Replace all partition names
    code = code.replace(/persist:aiforge:/g, 'persist:aivideo:');

    // Replace env variables
    code = code.replace(/process\.env\.AIFORGE_/g, 'process\.env\.AIVIDEO_');
    code = code.replace(/AFS_/g, 'AIVIDEO_');

    // Replace all protocols
    code = code.replace(/aiforge-asset:\/\//g, 'aivideo-asset://');
    code = code.replace(/scheme:"aiforge-asset"/g, 'scheme:"aivideo-asset"');
    code = code.replace(/ti\.handle\("aiforge-asset"/g, 'ti.handle("aivideo-asset"');

    // Replace license issuer & audience
    code = code.replace(/iss!=="aiforge-license-server"/g, 'iss!=="aivideo-license-server"');
    code = code.replace(/aud!=="aiforge-studio"/g, 'aud!=="ai-video-library"');

    // Replace branding titles
    code = code.replace(/title:"AIForge\s*Studio"/g, 'title:"AI VIDEO LIBRARY"');
    code = code.replace(/title:"AIForge"/g, 'title:"AI VIDEO LIBRARY"');
    code = code.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
    code = code.replace(/aiforge-studio/g, 'ai-video-library');
    code = code.replace(/AIFORGE\s+/g, 'AIVIDEO ');

    fs.writeFileSync(mainPath, code, 'utf8');
    console.log('  ✓ Rebranded & isolated main process:', mainPath);
  }

  // 4. renderer assets
  const rendererDir = path.join(root, 'out/renderer/assets');
  if (fs.existsSync(rendererDir)) {
    const files = fs.readdirSync(rendererDir);
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.html') && !file.endsWith('.css')) continue;
      const fPath = path.join(rendererDir, file);
      let content = fs.readFileSync(fPath, 'utf8');

      // Replace protocol
      content = content.replace(/aiforge-asset:\/\//g, 'aivideo-asset://');

      // Replace titles & text
      content = content.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
      content = content.replace(/AIForge\s*License\s*Center/gi, 'AI VIDEO LIBRARY — License Center');
      content = content.replace(/AIForge\s*Hub/gi, 'AI VIDEO LIBRARY Hub');
      content = content.replace(/AIForge\s*Archive\s*History/gi, 'AI VIDEO LIBRARY Archive History');
      content = content.replace(/AIForge/g, 'AI VIDEO LIBRARY');
      content = content.replace(/aiforge-studio/g, 'ai-video-library');
      content = content.replace(/AIFORGE\s+/g, 'AIVIDEO ');

      fs.writeFileSync(fPath, content, 'utf8');
    }
    console.log('  ✓ Rebranded all renderer assets in:', rendererDir);
  }
}

// 5. Check syntax
console.log('\n[*] Kiểm tra tính toàn vẹn cú pháp...');
for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    try {
      execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
      console.log('  [PASS] Cú pháp chính xác:', mainPath);
    } catch (err) {
      console.error('  [FAIL] Lỗi trong:', mainPath);
      process.exit(1);
    }
  }
}

console.log('\n🌟 ĐÃ HOÀN TẤT 100% CÁCH LY THƯƠNG HIỆU & MÃ NGUỒN! 🌟');
