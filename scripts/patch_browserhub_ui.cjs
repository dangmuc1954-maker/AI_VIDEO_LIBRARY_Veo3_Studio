const fs = require('fs');
const file = 'app/out/renderer/assets/BrowserHub-44JPDUjK.js';
let content = fs.readFileSync(file, 'utf8');

const t1 = 'capabilities:t.supportedJobTypes,diagnostics:t.diagnostics';
const r1 = 'capabilities:(t.provider&&t.provider.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))?["Video Generation","Image to Video","Reference Assets","Browser Request"]:t.supportedJobTypes,diagnostics:t.diagnostics';

if (content.includes(t1)) {
  content = content.replace(t1, r1);
  console.log('✓ Replaced t1 in BrowserHub');
}

const t2 = 'function oe(t){return{providerId:t.providerId,provider:t.name,startUrl:t.startUrl,capabilities:t.supportedJobTypes,isCustom:t.isCustom===!0}}';
const r2 = 'function oe(t){return{providerId:t.providerId,provider:t.name,startUrl:t.startUrl,capabilities:(t.name&&t.name.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))?["Video Generation","Image to Video","Reference Assets","Browser Request"]:t.supportedJobTypes,isCustom:t.isCustom===!0}}';

if (content.includes(t2)) {
  content = content.replace(t2, r2);
  console.log('✓ Replaced t2 in BrowserHub');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched BrowserHub-44JPDUjK.js');
