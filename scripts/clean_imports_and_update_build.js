const fs = require('fs');
const path = require('path');

// 1. Clean up source files
['app/out/main/index.js', 'extracted_original/out/main/index.js'].forEach(p => {
  const full = path.join(__dirname, '..', p);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/import\s+nodeCrypto\s+from\s+"node:crypto";\r?\n?/g, '');
    content = content.replace(/import\s+nodeFs\s+from\s+"node:fs";\r?\n?/g, '');
    content = content.replace(/import\s+nodePath\s+from\s+"node:path";\r?\n?/g, '');
    fs.writeFileSync(full, content, 'utf8');
    console.log('[+] Cleaned duplicate imports from:', p);
  }
});

// 2. Update build_distributable_client.js
const buildScriptPath = path.join(__dirname, 'build_distributable_client.js');
let buildCode = fs.readFileSync(buildScriptPath, 'utf8');

// Ensure stripping before prepending in build_distributable_client.js
const oldPrepend = `code = esmImports + '\\n' + offlineSignerCode + '\\n' + code;`;
const newPrepend = `// Strip any existing imports to avoid duplicate declaration errors
code = code.replace(/import\\s+nodeCrypto\\s+from\\s+"node:crypto";\\r?\\n?/g, '');
code = code.replace(/import\\s+nodeFs\\s+from\\s+"node:fs";\\r?\\n?/g, '');
code = code.replace(/import\\s+nodePath\\s+from\\s+"node:path";\\r?\\n?/g, '');
code = esmImports + '\\n' + offlineSignerCode + '\\n' + code;`;

if (!buildCode.includes('// Strip any existing imports to avoid duplicate declaration errors')) {
  buildCode = buildCode.replace(oldPrepend, newPrepend);
}

// Add verification step right after writing mainJsPath and licenseCenterJsPath
const verificationSnippet = `
// 5.1 Comprehensive Syntax Verification of all packaged JS
console.log('[*] Đang tự động kiểm tra toàn diện cú pháp mã nguồn đóng gói...');
function verifyJsRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      verifyJsRecursive(full);
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      try {
        execSync(\`node --check "\${full}"\`, { stdio: 'pipe' });
      } catch (err) {
        console.error('❌ SYNTAX ERROR IN PACKAGED FILE:', full);
        console.error(err.stderr ? err.stderr.toString() : err.message);
        throw new Error('Đóng gói thất bại do tệp có lỗi cú pháp: ' + full);
      }
    }
  });
}
verifyJsRecursive(path.join(appResourcesDir, 'out'));
console.log('✅ Xác thực 100% tệp JavaScript đóng gói: 0 lỗi cú pháp!');
`;

if (!buildCode.includes('verifyJsRecursive')) {
  buildCode = buildCode.replace(
    `fs.writeFileSync(path.join(distDir, 'Huong_Dan_Su_Dung.txt'), readmeTxt, 'utf8');`,
    `fs.writeFileSync(path.join(distDir, 'Huong_Dan_Su_Dung.txt'), readmeTxt, 'utf8');\n` + verificationSnippet
  );
}

fs.writeFileSync(buildScriptPath, buildCode, 'utf8');
console.log('[+] Updated build_distributable_client.js with safe deduplication and automated syntax verification.');
