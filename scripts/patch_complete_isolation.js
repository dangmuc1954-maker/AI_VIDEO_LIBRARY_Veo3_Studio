const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🛡️ HOÀN TOÀN TÁCH BIỆT & CÁCH LY ĐỘC LẬP 100%: AI VIDEO LIBRARY');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

const ISOLATION_SNIPPET = `;try{const _ud=N(G.getPath("appData"),"AI_VIDEO_LIBRARY_DATA");G.setName("AI VIDEO LIBRARY");G.setAppUserModelId("com.tris.aivideolibrary.studio");G.setPath("userData",_ud);if(!ye(_ud))Kc(_ud,{recursive:!0});}catch(e){console.error("[Isolation Hook Error]",e);};const `;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  console.log('[*] Đang xử lý thư mục:', root);

  // 1. Update package.json
  const pkgPath = path.join(root, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.name = 'ai-video-library';
    pkg.productName = 'AI VIDEO LIBRARY';
    pkg.description = 'AI VIDEO LIBRARY - AI Video Creation & Media Studio';
    pkg.author = 'AI VIDEO LIBRARY';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('  ✓ Đã cập nhật package.json');
  }

  // 2. Update main process index.js (Data Isolation & UserData Path Separation)
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    let code = fs.readFileSync(mainPath, 'utf8');

    // Clean any broken snippets from previous runs
    code = code.replace(/,;?\(\(\)=>\{try\{const _ud=N\(G\.getPath\("appData"\),"AI_VIDEO_LIBRARY_DATA"\);G\.setName\("AI VIDEO LIBRARY"\);G\.setAppUserModelId\("com\.tris\.aivideolibrary\.studio"\);G\.setPath\("userData",_ud\);if\(!ye\(_ud\)\)Kc\(_ud,\{recursive:!0\}\);\}catch\(e\)\{console\.error\("\[Isolation Hook Error\]",e\);\}\}\)\(\);/g, ',');
    code = code.replace(/;try\{const _ud=N\(G\.getPath\("appData"\),"AI_VIDEO_LIBRARY_DATA"\);G\.setName\("AI VIDEO LIBRARY"\);G\.setAppUserModelId\("com\.tris\.aivideolibrary\.studio"\);G\.setPath\("userData",_ud\);if\(!ye\(_ud\)\)Kc\(_ud,\{recursive:!0\}\);\}catch\(e\)\{console\.error\("\[Isolation Hook Error\]",e\);\}\};const /g, ',');

    // Clean any old isolation attempts
    code = code.replace(/G\.setAppUserModelId\("com\.aivideolibrary\.studio"\);try\{G\.setName\("AI VIDEO LIBRARY"\);G\.setPath\("userData",N\(G\.getPath\("appData"\),"AI_VIDEO_LIBRARY_DATA"\)\);\}catch\(e\)\{\}/g, '');

    // Now inject clean isolation snippet
    const targetAnchor = 'Ry=ud.createRequire(import.meta.url),un=';
    if (code.includes(targetAnchor)) {
      code = code.replace(targetAnchor, 'Ry=ud.createRequire(import.meta.url)' + ISOLATION_SNIPPET + 'un=');
    }

    // Replace any leftover window title & branding
    code = code.replace(/title:"AIForge\s*Studio"/g, 'title:"AI VIDEO LIBRARY"');
    code = code.replace(/title:"AIForge"/g, 'title:"AI VIDEO LIBRARY"');
    code = code.replace(/Activate AIForgeStudio to run jobs/g, 'Vui lòng kích hoạt bản quyền AI VIDEO LIBRARY để sử dụng');
    code = code.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
    code = code.replace(/aiforge-studio/g, 'ai-video-library');
    code = code.replace(/AIFORGE\s+/g, 'AIVIDEO ');

    fs.writeFileSync(mainPath, code, 'utf8');
    console.log('  ✓ Đã tiêm mã cách ly UserData độc lập 100% vào:', mainPath);
  }

  // 3. Update renderer assets
  const rendererDir = path.join(root, 'out/renderer/assets');
  if (fs.existsSync(rendererDir)) {
    const files = fs.readdirSync(rendererDir);
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.html')) continue;
      const fPath = path.join(rendererDir, file);
      let content = fs.readFileSync(fPath, 'utf8');

      content = content.replace(/AIForge\s*Studio/g, 'AI VIDEO LIBRARY');
      content = content.replace(/AIForge\s*License\s*Center/gi, 'AI VIDEO LIBRARY — License Center');
      content = content.replace(/AIForge\s*Hub/gi, 'AI VIDEO LIBRARY Hub');
      content = content.replace(/AIForge/g, 'AI VIDEO LIBRARY');
      content = content.replace(/AIFORGE\s+/g, 'AIVIDEO ');

      fs.writeFileSync(fPath, content, 'utf8');
    }
    console.log('  ✓ Đã kiểm tra và đồng bộ tên thương hiệu renderer:', rendererDir);
  }
}

// 4. Validate syntax of all files
console.log('\n[*] Đang kiểm tra tính toàn vẹn cú pháp của tất cả file...');
for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    try {
      execSync(`node --check "${mainPath}"`, { stdio: 'inherit' });
      console.log('  [PASS] Cú pháp hoàn hảo:', mainPath);
    } catch (err) {
      console.error('  [FAIL] Lỗi cú pháp trong:', mainPath);
      process.exit(1);
    }
  }
}

console.log('\n🌟 100% HOÀN TẤT TÁCH BIỆT DỮ LIỆU & NGUỒN APP THÀNH "AI VIDEO LIBRARY"! 🌟');
