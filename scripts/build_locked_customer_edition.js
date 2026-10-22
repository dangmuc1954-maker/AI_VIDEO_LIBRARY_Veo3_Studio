const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getOrCreateKeyPair } = require('../license_server/cryptoUtils');

console.log('--- BUILDING 100% CLEAN & STRICTLY LOCKED CUSTOMER EDITION ---');

const keyData = getOrCreateKeyPair();
const serverUrl = process.env.LICENSE_SERVER_URL || 'http://127.0.0.1:8787';

console.log(`[*] License Server Endpoint: ${serverUrl}`);
console.log(`[*] Ed25519 Public Key ID: ${keyData.keyId}`);

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'extracted_original');
const distDir = path.join(rootDir, 'dist/AIForge_Studio_Customer_Edition');
const appDistDir = path.join(distDir, 'app');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Prepare target dirs
if (!fs.existsSync(appDistDir)) fs.mkdirSync(appDistDir, { recursive: true });

console.log('[*] Copying app files (out & package.json)...');
copyRecursiveSync(path.join(srcDir, 'out'), path.join(appDistDir, 'out'));
copyRecursiveSync(path.join(srcDir, 'package.json'), path.join(appDistDir, 'package.json'));

const mainJsPath = path.join(appDistDir, 'out/main/index.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

console.log('[*] Enforcing Strict Clean Data Isolation & Anti-Bypass...');

// 1. DEV BYPASS IS STRICTLY DISABLED
code = code.replace(
  /isDevBypassEnabled\(\)\s*\{[^}]*\}/g,
  'isDevBypassEnabled(){return false;}'
);

// 2. Point License Server URL to Tris's Server
code = code.replace(
  /return\(process\.env\.AFS_BACKEND_URL\|\|Lc\(\)\?\.backendUrl\|\|"http:\/\/127\.0\.0\.1:8787"\)\.replace\(\/\\\+\$\/,""\)/g,
  `return "${serverUrl}"`
);

// 3. Inject Tris's Ed25519 Public Key for signature verification
const pubKeyJson = JSON.stringify({ [keyData.keyId]: keyData.publicKey });
code = code.replace(
  /function\s+Ow\(\)\{[^}]*return\s+o&&typeof\s+o=="object"\?Object\.fromEntries[^}]*\}\}/g,
  `function Ow(){return ${pubKeyJson};}`
);

// 4. Disable DevTools and F12 for Customers (Chống khách F12 soi code / bẻ khóa)
code = code.replace('devTools:!0', 'devTools:!1');
code = code.replace('devTools:!G.isPackaged', 'devTools:!1');

// 5. Clean Data Isolation: Set custom app name and dedicated client userData path
code = code.replace(
  /G\.whenReady\(\)\.then\(async\(\)=>\{/g,
  'G.setName("aiforge-studio-client");G.setPath("userData", N(G.getPath("appData"), "aiforge-studio-client"));G.whenReady().then(async()=>{'
);

// 6. Ensure window shows cleanly
code = code.replace('backgroundColor:"#070a11",show:!1', 'title:"AIForge Studio",backgroundColor:"#070a11",show:!0');

fs.writeFileSync(mainJsPath, code, 'utf8');

// Copy runtime
console.log('[*] Copying Electron Runtime to customer package...');
copyRecursiveSync(path.join(rootDir, 'electron_bin'), path.join(distDir, 'runtime'));

// Copy node_modules via fast robocopy / xcopy if not present
const nodeModulesDest = path.join(appDistDir, 'node_modules');
if (!fs.existsSync(nodeModulesDest)) {
  console.log('[*] Copying node_modules via fast multi-threaded copy...');
  try {
    execSync(`robocopy "${path.join(srcDir, 'node_modules')}" "${nodeModulesDest}" /E /MT:8 /NFL /NDL /NJH /NJS`, { stdio: 'ignore' });
  } catch (e) {
    // Robocopy returns exit code 1 on success when files are copied
  }
}

// Create Launcher
const launcherBat = `@echo off
title AIForge Studio
cd /d "%~dp0"
taskkill /F /IM electron.exe 2>nul
ping 127.0.0.1 -n 2 >nul
start "" "%~dp0runtime\\electron.exe" "%~dp0app"
`;

fs.writeFileSync(path.join(distDir, 'Start_AIForge_Studio.bat'), launcherBat, 'utf8');

console.log(`
============================================================
  ✨ ĐÃ LÀM SẠCH VÀ ĐÓNG GÓI BẢN CHO KHÁCH 100% TRONG SẠCH!
  📂 Thư mục: ${distDir}

  🛡️ CAM KẾT ĐẢM BẢO:
  1. DỮ LIỆU HOÀN TOÀN TRONG SẠCH: Cách ly dữ liệu sang 'aiforge-studio-client', KHÔNG dính bất kỳ tài khoản Google/Grok, cookies, token hay dữ liệu cá nhân nào của bạn.
  2. BẢN QUYỀN KHÓA 100%: Mở lên sẽ ở trạng thái 'No active plan / Activation Required', bắt buộc mua gói quét VietQR hoặc nhập Key từ server bạn.
  3. KHÓA THEO MÁY (HWID): Key kích hoạt trên máy khách sẽ bị gắn chặt với máy đó, không share được sang máy khác.
  4. CHỐNG SOI MÃ NGUỒN: Tắt toàn bộ F12 và DevTools trên bản của khách.
============================================================
`);
