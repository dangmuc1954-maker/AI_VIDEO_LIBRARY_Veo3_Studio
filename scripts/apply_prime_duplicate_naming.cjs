const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

// ========================================================
// 1. PATCH MAIN PROCESS (AUTO DOWNLOAD WITH ' INSTEAD OF _2)
// ========================================================
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const oldMainLoop = `let targetName=prefix+sNum+ext,targetPath=ptm.join(cfg.directory,targetName),cnt=1;while(fsm.existsSync(targetPath)){cnt++;targetPath=ptm.join(cfg.directory,prefix+sNum+"_"+cnt+ext)}`;
const newMainLoop = `let prime="";let targetName=prefix+sNum+prime+ext,targetPath=ptm.join(cfg.directory,targetName);while(fsm.existsSync(targetPath)){prime+="'";targetName=prefix+sNum+prime+ext;targetPath=ptm.join(cfg.directory,targetName)}`;

if (!mainCode.includes(oldMainLoop)) {
  console.error('❌ Could not find oldMainLoop in app/out/main/index.js');
  process.exit(1);
}

mainCode = mainCode.replace(oldMainLoop, newMainLoop);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✓ Successfully updated auto-download duplicate naming in app/out/main/index.js!');

// ========================================================
// 2. PATCH RENDERER PROCESS (SMART PRIME MATCHING IN MODAL)
// ========================================================
const sfbPath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let sfbCode = fs.readFileSync(sfbPath, 'utf8');

const oldMatchBlock = `    // A. Match scene number in image filename (1.png, canh1.png, scene_01.jpg, cảnh 1)
    let matched = imageFiles.find(img => {
      const raw = img.name.replace(/\\.[a-zA-Z0-9]+$/, '').toLowerCase();
      const r1 = new RegExp('(canh|cảnh|scene|p|c|phancanh)[_\\\\s-]*0*' + nStr + '([^0-9]|$)', 'i');
      if (r1.test(raw)) return true;
      const r2 = new RegExp('(^|[^0-9])0*' + nStr + '([^0-9]|$)');
      if (r2.test(raw)) return true;
      return false;
    });
    if (matched) return matched;`;

const newMatchBlock = `    // A. Match scene number in image filename (Ảnh Cảnh 1.png, Ảnh Cảnh 1'.png, 1.png, 1'.png...)
    const matchingImages = imageFiles.filter(img => {
      const raw = (img.name || "").replace(/\\.[a-zA-Z0-9]+$/, '').toLowerCase();
      const mPrefix = raw.match(/(?:canh|cảnh|scene|phancanh|p|c)[_\\s-]*0*(\\d+)/i);
      if (mPrefix && parseInt(mPrefix[1], 10) === sceneNum) return true;

      const mStandalone = raw.match(/^(?:ảnh\\s*|anh\\s*|video\\s*)?0*(\\d+)(?:'+|\\b|$)/i);
      if (mStandalone && parseInt(mStandalone[1], 10) === sceneNum) return true;

      const r1 = new RegExp('(canh|cảnh|scene|phancanh|p|c)[_\\s-]*0*' + nStr + "([^0-9]|$)", 'i');
      if (r1.test(raw)) return true;

      return false;
    });

    if (matchingImages.length > 0) {
      matchingImages.sort((f1, f2) => {
        const p1 = (f1.name.match(/'/g) || []).length;
        const p2 = (f2.name.match(/'/g) || []).length;
        if (p2 !== p1) return p2 - p1;
        return (f2.file?.lastModified || 0) - (f1.file?.lastModified || 0);
      });
      return matchingImages[0];
    }`;

if (!sfbCode.includes(oldMatchBlock)) {
  console.error('❌ Could not find oldMatchBlock in StudioFailedBulkActions-Zv2NpUPy.js');
  process.exit(1);
}

sfbCode = sfbCode.replace(oldMatchBlock, newMatchBlock);

console.log('Validating StudioFailedBulkActions-Zv2NpUPy.js with Acorn...');
try {
  acorn.parse(sfbCode, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ StudioFailedBulkActions-Zv2NpUPy.js is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in StudioFailedBulkActions-Zv2NpUPy.js:', err.message);
  process.exit(1);
}

fs.writeFileSync(sfbPath, sfbCode, 'utf8');
console.log('✓ Successfully updated smart prime matching in StudioFailedBulkActions-Zv2NpUPy.js!');

console.log('🌟 HOÀN TẤT CẬP NHẬT TỰ ĐỘNG ĐỔI TÊN DẤU PHẨY ĐƠN (\') VÀ NHẬN DIỆN THAM CHIẾU! 🌟');
