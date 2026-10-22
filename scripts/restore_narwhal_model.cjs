const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(targetPath, 'utf8');
console.log('[*] Original app/out/main/index.js length:', code.length);

// 1. Restore defaultModel in config
code = code.replace('defaultModel:"GEM_PIX_2"', 'defaultModel:"NARWHAL"');

// 2. Restore in zu fallback
code = code.replace('qe.image.defaultModel||"GEM_PIX_2"', 'qe.image.defaultModel||"NARWHAL"');
code = code.replace("|| 'GEM_PIX_2';", "|| 'NARWHAL';");

// 3. Restore in Hm function: only gemini-3.0-pro uses GEM_PIX_2, default is NARWHAL
const oldHm = 'e.includes("gemini-3.0-pro")?{id:e,modelName:"GEM_PIX_2",aspectRatio:t,upsampleResolution:A}:{id:e,modelName:"GEM_PIX_2",aspectRatio:t,upsampleResolution:A}';
const newHm = 'e.includes("gemini-3.0-pro")?{id:e,modelName:"GEM_PIX_2",aspectRatio:t,upsampleResolution:A}:{id:e,modelName:"NARWHAL",aspectRatio:t,upsampleResolution:A}';

if (code.includes(oldHm)) {
  code = code.replace(oldHm, newHm);
  console.log('  ✓ Đã khôi phục model mặc định của Hm về NARWHAL!');
}

fs.writeFileSync(targetPath, code, 'utf8');
console.log('[+] Đã lưu app/out/main/index.js thành công!');
