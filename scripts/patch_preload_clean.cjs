const fs = require('fs');
const path = require('path');

const preloadPath = path.join(__dirname, '../app/out/preload/index.cjs');
let code = fs.readFileSync(preloadPath, 'utf8');

const target = 'mergeVideos:(e,n,s)=>r.ipcRenderer.invoke("assets:mergeVideos",e,n,s),';
const replacement = 'mergeVideos:(e,n,s)=>r.ipcRenderer.invoke("assets:mergeVideos",e,n,s),editAndMergeVideos:(e,n,s)=>r.ipcRenderer.invoke("assets:editAndMergeVideos",e,n,s),';

if (!code.includes(target)) {
  console.log('Target already patched or not found.');
} else {
  code = code.replace(target, replacement);
  fs.writeFileSync(preloadPath, code, 'utf8');
  console.log('Preload patched successfully!');
}
