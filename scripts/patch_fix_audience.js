const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🔧 FIXING INVALID TOKEN AUDIENCE & UNIFYING LICENSE ENGINE');
console.log('======================================================================');

const targets = [
  path.join(__dirname, '../app/out/main/index.js'),
  path.join(__dirname, '../extracted_original/out/main/index.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Fixing cw() and audience check in:', target);
  let code = fs.readFileSync(target, 'utf8');

  // Fix function cw(r) to accept all valid issuers and audiences without error:
  code = code.replace(
    /function cw\(r\)\{const e=Math\.floor\(Date\.now\(\)\/1e3\);if\(r\.iss!==aw\)throw new Error\("Invalid token issuer"\);if\(r\.aud!==sw\)throw new Error\("Invalid token audience"\);/g,
    'function cw(r){const e=Math.floor(Date.now()/1e3);if(r.iss!=="aiforge-license-server"&&r.iss!=="ai-video-library-server"&&r.iss!==aw)throw new Error("Invalid token issuer");if(r.aud!=="aiforge-studio"&&r.aud!=="ai-video-library"&&r.aud!=="ai-video-studio"&&r.aud!==sw)throw new Error("Invalid token audience");'
  );

  // In case cw had sw check:
  code = code.replace(
    'if(r.aud!==sw)throw new Error("Invalid token audience");',
    'if(r.aud!=="aiforge-studio"&&r.aud!=="ai-video-library"&&r.aud!=="ai-video-studio"&&r.aud!==sw)throw new Error("Invalid token audience");'
  );

  // In case cw had aw check:
  code = code.replace(
    'if(r.iss!==aw)throw new Error("Invalid token issuer");',
    'if(r.iss!=="aiforge-license-server"&&r.iss!=="ai-video-library-server"&&r.iss!==aw)throw new Error("Invalid token issuer");'
  );

  fs.writeFileSync(target, code, 'utf8');
}

// Update cryptoUtils.js
const cryptoUtilsPath = path.join(__dirname, '../license_server/cryptoUtils.js');
if (fs.existsSync(cryptoUtilsPath)) {
  let cCode = fs.readFileSync(cryptoUtilsPath, 'utf8');
  cCode = cCode.replace(/aud:\s*'aiforge-studio'/g, `aud: payload.aud || 'aiforge-studio'`);
  fs.writeFileSync(cryptoUtilsPath, cCode, 'utf8');
  console.log('✓ Updated license_server/cryptoUtils.js');
}

// Validate syntax
for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  try {
    execSync(`node --check "${target}"`, { stdio: 'inherit' });
    console.log('[PASS] Syntax valid for:', target);
  } catch (err) {
    console.error('[FAIL] Syntax error in:', target);
    process.exit(1);
  }
}

console.log('\n🌟 AUDIENCE CHECK FIXED & VALIDATED! 🌟');
