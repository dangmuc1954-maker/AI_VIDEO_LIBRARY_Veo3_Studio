/**
 * OBFUSCATE RELEASE PIPELINE - ANTI-AI & REVERSE-ENGINEERING SHIELD
 * ----------------------------------------------------------------
 * This script transforms clean production builds into an impenetrable "Black Box".
 * It encrypts all strings (URLs, DOM selectors, Server APIs, license checks)
 * using dynamic RC4 encryption pools, mangles all identifiers into hexadecimal,
 * and splits strings so that AI decompilers and scanners cannot extract logic.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const JavaScriptObfuscator = require('./obfuscator/node_modules/javascript-obfuscator');

function obfuscateFile(filePath, options) {
  if (!fs.existsSync(filePath)) {
    console.log(`[!] Bỏ qua file không tồn tại: ${filePath}`);
    return;
  }
  const relPath = path.relative(process.cwd(), filePath);
  console.log(`[*] Đang mã hóa & bảo vệ: ${relPath}...`);
  const src = fs.readFileSync(filePath, 'utf8');
  const t0 = Date.now();

  try {
    const obfResult = JavaScriptObfuscator.obfuscate(src, options);
    const obfCode = obfResult.getObfuscatedCode();
    fs.writeFileSync(filePath, obfCode, 'utf8');
    
    // Verify syntax
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    const duration = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`  ✓ Đã mã hóa thành công trong ${duration}s (${(src.length / 1024).toFixed(1)} KB -> ${(obfCode.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`  ❌ Lỗi khi mã hóa ${relPath}:`, err.message);
    throw err;
  }
}

function runShieldOnTarget(targetDir) {
  console.log(`\n======================================================`);
  console.log(`🛡️ KÍCH HOẠT LỚP BẢO VỆ CHỐNG AI CHO: ${targetDir}`);
  console.log(`======================================================`);

  const outDir = path.join(targetDir, 'out');
  if (!fs.existsSync(outDir)) {
    console.log(`[!] Thư mục ${outDir} không tồn tại.`);
    return;
  }

  // 1. Obfuscate Main Process (index.js)
  const mainFile = path.join(outDir, 'main/index.js');
  obfuscateFile(mainFile, {
    target: 'node',
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.85,
    splitStrings: true,
    splitStringsChunkLength: 6,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    reservedNames: [
      '^electron', '^require', '^module', '^exports', '^process',
      '^__dirname', '^__filename', '^global', '^Buffer', '^setTimeout',
      '^clearTimeout', '^setInterval', '^clearInterval', '^Promise'
    ]
  });

  // 2. Obfuscate Preload
  const preloadFile = path.join(outDir, 'preload/index.cjs');
  if (fs.existsSync(preloadFile)) {
    obfuscateFile(preloadFile, {
      target: 'node',
      compact: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.85,
      splitStrings: true,
      splitStringsChunkLength: 6,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      reservedNames: ['^contextBridge', '^ipcRenderer', '^require', '^module', '^exports', '^process']
    });
  }

  // 3. Obfuscate Security Trap Chip
  const trapFile = path.join(outDir, 'main/security_trap.cjs');
  if (fs.existsSync(trapFile)) {
    obfuscateFile(trapFile, {
      target: 'node',
      compact: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.9,
      splitStrings: true,
      splitStringsChunkLength: 5,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      reservedNames: ['^electron', '^require', '^module', '^exports', '^process']
    });
  }
  
  // Dọn dẹp manifest cũ nếu có để tránh báo sai khi người dùng giải nén bình thường
  const oldManifest = path.join(outDir, 'main/security_manifest.json');
  if (fs.existsSync(oldManifest)) {
    try { fs.unlinkSync(oldManifest); } catch(e) {}
  }

  console.log(`✨ BẢO VỆ HOÀN TẤT CHO: ${targetDir} ✨\n`);
}

module.exports = { runShieldOnTarget };

if (require.main === module) {
  const rootDir = path.resolve(__dirname, '..');
  const targets = [
    path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
    path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
  ];

  for (const t of targets) {
    if (fs.existsSync(t)) {
      runShieldOnTarget(t);
    }
  }
}
