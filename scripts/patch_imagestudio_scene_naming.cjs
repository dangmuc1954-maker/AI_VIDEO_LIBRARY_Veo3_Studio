const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

// ========================================================
// 1. Patch StudioFailedBulkActions-Zv2NpUPy.js
// ========================================================
const sfbFile = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let sfbCode = fs.readFileSync(sfbFile, 'utf8');

const oldV = 'v={jobId:r.id,promptId:x,prompt:m,provider:me(r.provider),account:r.account||"Generated account",status:P,progress:r.progress,error:r.error,providerErrorCode:r.providerErrorCode,providerErrorDetails:r.providerErrorDetails,payload:r.payload,generationRunId:w,generationRunCreatedAt:j,promptOrder:N,batchIndex:y,createdAt:r.createdAt,startedAt:r.startedAt,completedAt:r.completedAt};';
const newV = 'v={jobId:r.id,promptId:x,title:D(r.payload,"title")||(N?("Cảnh "+N):""),prompt:m,provider:me(r.provider),account:r.account||"Generated account",status:P,progress:r.progress,error:r.error,providerErrorCode:r.providerErrorCode,providerErrorDetails:r.providerErrorDetails,payload:r.payload,generationRunId:w,generationRunCreatedAt:j,promptOrder:N,batchIndex:y,createdAt:r.createdAt,startedAt:r.startedAt,completedAt:r.completedAt};';

if (!sfbCode.includes(oldV)) {
  console.error('❌ Could not find oldV in StudioFailedBulkActions');
  process.exit(1);
}
sfbCode = sfbCode.replace(oldV, newV);
console.log('✓ Patched Le image preview mapping with title in StudioFailedBulkActions');

acorn.parse(sfbCode, { ecmaVersion: 'latest', sourceType: 'module' });
fs.writeFileSync(sfbFile, sfbCode, 'utf8');
console.log('✓ Successfully saved StudioFailedBulkActions-Zv2NpUPy.js');

// ========================================================
// 2. Patch ImageStudio-4nmpUX3j.js
// ========================================================
const isFile = path.join(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let isCode = fs.readFileSync(isFile, 'utf8');

// A. Patch Qt
const oldQt = 'function Qt(r=Te(),n=1){return{id:r,index:n,prompt:"",provider:"Banana",ratio:"9:16",count:1,account:"Auto",status:"Pending",upsampleResolution:"Full HD",referenceAssetIds:[],removeWatermark:!1}}';
const newQt = 'function Qt(r=Te(),n=1,sName){const sTitle=sName||("Cảnh "+n);return{id:r,index:n,sceneName:sTitle,title:sTitle,prompt:"",provider:"Banana",ratio:"9:16",count:1,account:"Auto",status:"Pending",upsampleResolution:"Full HD",referenceAssetIds:[],removeWatermark:!1}}';

if (!isCode.includes(oldQt)) {
  console.error('❌ Could not find oldQt in ImageStudio');
  process.exit(1);
}
isCode = isCode.replace(oldQt, newQt);
console.log('✓ Patched Qt in ImageStudio with sceneName/title');

// B. Patch addPromptList
const oldAddPromptList = 'addPromptList:s=>{const o=s.map(l=>l.trim()).filter(Boolean);if(o.length===0)return[];const i=o.map(()=>Te());return r(l=>{const u=o.map((x,B)=>({...Qt(i[B],l.promptRows.length+B+1),prompt:x})),g=je([...l.promptRows,...u]);return ce(g),{promptRows:g,selectedRows:new Set(i),selectedPromptId:i[0],previewModalImageId:null,searchQuery:"",isInspectorOpen:!1}}),i}';
const newAddPromptList = 'addPromptList:s=>{const o=s.map(l=>typeof l==="string"?l.trim():(l?.prompt||"").trim()).filter(Boolean);if(o.length===0)return[];const i=o.map(()=>Te());return r(l=>{const u=o.map((x,B)=>{const orig=s[B],sName=(orig&&typeof orig==="object"&&orig.sceneName)?orig.sceneName:("Cảnh "+(l.promptRows.length+B+1)),refs=(orig&&typeof orig==="object"&&Array.isArray(orig.referenceAssetIds))?orig.referenceAssetIds:[];return{...Qt(i[B],l.promptRows.length+B+1,sName),prompt:x,sceneName:sName,title:sName,referenceAssetIds:refs}});const g=je([...l.promptRows,...u]);return ce(g),{promptRows:g,selectedRows:new Set(i),selectedPromptId:i[0],previewModalImageId:null,searchQuery:"",isInspectorOpen:!1}}),i}';

if (!isCode.includes(oldAddPromptList)) {
  console.error('❌ Could not find oldAddPromptList in ImageStudio');
  process.exit(1);
}
isCode = isCode.replace(oldAddPromptList, newAddPromptList);
console.log('✓ Patched addPromptList in ImageStudio with sceneName/title');

// C. Patch job payload in ImageStudio
const oldJobPayload = 'generationRunId:lt,generationRunCreatedAt:Ne,promptOrder:y.index,';
const newJobPayload = 'generationRunId:lt,generationRunCreatedAt:Ne,promptOrder:y.index,title:y.sceneName||y.title||("Cảnh "+y.index),';

if (!isCode.includes(oldJobPayload)) {
  console.error('❌ Could not find oldJobPayload in ImageStudio');
  process.exit(1);
}
isCode = isCode.replace(oldJobPayload, newJobPayload);
console.log('✓ Patched job payload in ImageStudio with title');

// D. Patch vo (download image) in ImageStudio
const oldVo = 'vo=()=>{const t=re?.fullUrl||re?.thumbnail;if(!t){N.info(r("imageStudio.generatingDownloadWait"));return}const d=document.createElement("a");d.href=t,d.download=`${He?`prompt-${He.index}`:"generated-image"}.png`,d.rel="noreferrer",d.click()}';
const newVo = 'vo=()=>{const t=re?.fullUrl||re?.thumbnail;if(!t){N.info(r("imageStudio.generatingDownloadWait"));return}const d=document.createElement("a");d.href=t;const _sn=He?.index||re?.promptOrder||1,_rawTitle=(He?.sceneName||He?.title||re?.title||("Cảnh "+_sn)).trim().replace(/[\\\\/:*?"<>|]/g,"_").replace(/\\.png$/i,""),_vSuff=(re?.count>1||(He?.count&&He.count>1))?`_${(re?.batchIndex??mo)+1}`:"";d.download=`${_rawTitle}${_vSuff}.png`,d.rel="noreferrer",d.click()}';

if (!isCode.includes(oldVo)) {
  console.error('❌ Could not find oldVo in ImageStudio');
  process.exit(1);
}
isCode = isCode.replace(oldVo, newVo);
console.log('✓ Patched vo (download image) in ImageStudio with Cảnh X filename');

// E. Patch inspector drawer title in ImageStudio
const oldDrawer = 'title:o?`Prompt #${o.index}`:h("imageStudio.inspectorTitle")';
const newDrawer = 'title:o?(o.sceneName||`Cảnh ${o.index}`):h("imageStudio.inspectorTitle")';

if (isCode.includes(oldDrawer)) {
  isCode = isCode.replace(oldDrawer, newDrawer);
  console.log('✓ Patched inspector drawer title in ImageStudio');
}

// Verify syntax of ImageStudio
console.log('Testing Acorn parse of ImageStudio-4nmpUX3j.js...');
acorn.parse(isCode, { ecmaVersion: 'latest', sourceType: 'module' });
console.log('✓ ImageStudio-4nmpUX3j.js is 100% syntactically valid JS!');

fs.writeFileSync(isFile, isCode, 'utf8');
console.log('✓ Successfully saved ImageStudio-4nmpUX3j.js');
