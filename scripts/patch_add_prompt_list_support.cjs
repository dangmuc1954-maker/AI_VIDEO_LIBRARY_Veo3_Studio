const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../app/out/renderer/assets/index-BS7vgKVV.js');
let code = fs.readFileSync(indexPath, 'utf8');

// 1. Patch addPromptList in index-BS7vgKVV.js
const targetAddPrompt = 'addPromptList:r=>{const i=r.map(c=>c.trim()).filter(Boolean);if(i.length===0)return[];const s=i.map(()=>Mr());return n(c=>{const h=i.map((f,g)=>({...Ds(s[g],c.promptRows.length+g+1),prompt:f})),p=ta([...c.promptRows,...h]);return Gn(p),{promptRows:p,selectedRows:new Set(s),selectedPromptId:s[0],previewModalVideoId:void 0,searchQuery:"",isInspectorOpen:!1}}),s},';

if (!code.includes(targetAddPrompt)) {
  console.error('❌ Could not find targetAddPrompt in index-BS7vgKVV.js');
  process.exit(1);
}

const newAddPrompt = 'addPromptList:r=>{const i=r.map(c=>typeof c==="string"?c.trim():(c?.prompt||"").trim()).filter(Boolean);if(i.length===0)return[];const s=i.map(()=>Mr());return n(c=>{const h=i.map((f,g)=>{const orig=r[g],refs=(orig&&typeof orig==="object"&&Array.isArray(orig.referenceAssetIds))?orig.referenceAssetIds:[],sName=(orig&&typeof orig==="object"&&orig.sceneName)?orig.sceneName:`Cảnh ${c.promptRows.length+g+1}`;return{...Ds(s[g],c.promptRows.length+g+1),prompt:f,referenceAssetIds:refs,sceneName:sName}});const p=ta([...c.promptRows,...h]);return Gn(p),{promptRows:p,selectedRows:new Set(s),selectedPromptId:s[0],previewModalVideoId:void 0,searchQuery:"",isInspectorOpen:!1}}),s},';

code = code.replace(targetAddPrompt, newAddPrompt);
console.log('✓ Successfully patched addPromptList in index-BS7vgKVV.js');

// 2. Patch Ds to include sceneName
const targetDs = 'function Ds(n,a,r){return{id:n,index:a,prompt:"",';
if (code.includes(targetDs)) {
  code = code.replace(targetDs, 'function Ds(n,a,r){return{id:n,index:a,sceneName:r?.sceneName||`Cảnh ${a}`,prompt:"",');
  console.log('✓ Successfully patched Ds in index-BS7vgKVV.js with sceneName');
}

fs.writeFileSync(indexPath, code, 'utf8');
console.log('✓ Saved index-BS7vgKVV.js');
