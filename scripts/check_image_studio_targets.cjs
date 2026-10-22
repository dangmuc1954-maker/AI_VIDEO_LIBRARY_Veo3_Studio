const fs = require('fs');
const acorn = require('./obfuscator/node_modules/acorn');

// 1. Check StudioFailedBulkActions-Zv2NpUPy.js
const sfbPath = 'app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js';
let sfbCode = fs.readFileSync(sfbPath, 'utf8');

const targetV = 'v={jobId:r.id,promptId:x,prompt:m,provider:me(r.provider),account:r.account||"Generated account",status:P,progress:r.progress,error:r.error,providerErrorCode:r.providerErrorCode,providerErrorDetails:r.providerErrorDetails,payload:r.payload,generationRunId:w,generationRunCreatedAt:j,promptOrder:N,batchIndex:y,createdAt:r.createdAt,startedAt:r.startedAt,completedAt:r.completedAt};';
console.log('Target V in SFB:', sfbCode.includes(targetV));

// 2. Check ImageStudio-4nmpUX3j.js
const isPath = 'app/out/renderer/assets/ImageStudio-4nmpUX3j.js';
let isCode = fs.readFileSync(isPath, 'utf8');

const targetQt = 'function Qt(r=Te(),n=1){return{id:r,index:n,prompt:"",provider:"Banana",ratio:"9:16",count:1,account:"Auto",status:"Pending",upsampleResolution:"Full HD",referenceAssetIds:[],removeWatermark:!1}}';
console.log('Target Qt in IS:', isCode.includes(targetQt));

const targetAddPromptList = 'addPromptList:s=>{const o=s.map(l=>l.trim()).filter(Boolean);if(o.length===0)return[];const i=o.map(()=>Te());return r(l=>{const u=o.map((x,B)=>({...Qt(i[B],l.promptRows.length+B+1),prompt:x})),g=je([...l.promptRows,...u]);return ce(g),{promptRows:g,selectedRows:new Set(i),selectedPromptId:i[0],previewModalImageId:void 0,searchQuery:""}}),i}';
console.log('Target AddPromptList in IS:', isCode.includes(targetAddPromptList));

const targetJobPayload = 'generationRunId:lt,generationRunCreatedAt:Ne,promptOrder:y.index,';
console.log('Target JobPayload in IS:', isCode.includes(targetJobPayload));

const targetVo = 'vo=()=>{const t=re?.fullUrl||re?.thumbnail;if(!t){N.info(r("imageStudio.generatingDownloadWait"));return}const d=document.createElement("a");d.href=t,d.download=`${He?`prompt-${He.index}`:"generated-image"}.png`,d.rel="noreferrer",d.click()}';
console.log('Target Vo in IS:', isCode.includes(targetVo));

const targetDrawer = 'title:o?`Prompt #${o.index}`:h("imageStudio.inspectorTitle")';
console.log('Target Drawer in IS:', isCode.includes(targetDrawer));
