const fs = require('fs');
const path = require('path');

const preloadPath = path.join(__dirname, '../app/out/preload/index.cjs');
let code = fs.readFileSync(preloadPath, 'utf8');

const target = 'onChanged:e=>{const i=(n,o)=>e(o);return r.ipcRenderer.on("assets:changed",i),()=>{r.ipcRenderer.removeListener("assets:changed",i)}}';
if (!code.includes(target)) {
  console.error('Target in preload not found!');
  process.exit(1);
}

const replacement = target + ',getAutoDeleteConfig:()=>r.ipcRenderer.invoke("assets:getAutoDeleteConfig"),setAutoDeleteConfig:e=>r.ipcRenderer.invoke("assets:setAutoDeleteConfig",e),cancelAssetAutoDelete:e=>r.ipcRenderer.invoke("assets:cancelAssetAutoDelete",e),onAutoDeleteChanged:e=>{const i=(n,o)=>e(o);return r.ipcRenderer.on("assets:autoDeleteChanged",i),()=>{r.ipcRenderer.removeListener("assets:autoDeleteChanged",i)}}';

fs.writeFileSync(preloadPath + '.bak_before_autodelete', fs.readFileSync(preloadPath));
code = code.replace(target, replacement);
fs.writeFileSync(preloadPath, code, 'utf8');

console.log('Successfully patched app/out/preload/index.cjs!');
