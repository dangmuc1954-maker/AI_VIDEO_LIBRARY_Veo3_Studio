const fs = require('fs');

console.log('--- Patching WorkflowEditor-BFJj-KsD.js ---');
const wfPath = 'app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js';
let wfContent = fs.readFileSync(wfPath, 'utf8');

// 1. Patch ov factory
const targetOv = 'case"select-item":return{id:r,type:"select-item",title:Pt("select-item"),x:s,y:n,width:260,height:96,enabled:!0,active:!0,inputs:[{id:`${r}-in-list`,type:"any",label:"List"}],outputs:[{id:`${r}-out-item`,type:"any",label:"Item"}],config:{index:0}}}';
const replOv = 'case"select-item":return{id:r,type:"select-item",title:Pt("select-item"),x:s,y:n,width:260,height:96,enabled:!0,active:!0,inputs:[{id:`${r}-in-list`,type:"any",label:"List"}],outputs:[{id:`${r}-out-item`,type:"any",label:"Item"}],config:{index:0}};case"video-script-extract":return{id:r,type:"video-script-extract",title:"AI Bóc Kịch Bản Video",x:s,y:n,width:380,height:220,enabled:!0,active:!0,inputs:[{id:`${r}-in-vid`,type:"video",label:"Video"}],outputs:[{id:`${r}-out-txt`,type:"text",label:"Kịch bản thoại"},{id:`${r}-out-vid`,type:"video",label:"Video gốc"}],config:{language:"vi",prompt:"Bóc kịch bản lời thoại nhân vật"}}}';

if (wfContent.includes(targetOv)) {
  wfContent = wfContent.replace(targetOv, replOv);
  console.log('Successfully patched ov node factory!');
} else {
  console.error('ERROR: Could not find targetOv in WorkflowEditor!');
}

// 2. Patch Bi icon
const targetBi = 'case"merge":return t.jsx("div",{className:`${n} rounded-lg bg-[#fbbf24]/15 text-[#fbbf24]`,title:"Merge",children:t.jsx(Id,{size:14})});';
const replBi = 'case"merge":return t.jsx("div",{className:`${n} rounded-lg bg-[#fbbf24]/15 text-[#fbbf24]`,title:"Merge",children:t.jsx(Id,{size:14})});case"video-script-extract":return t.jsx("div",{className:`${n} rounded-lg bg-[#10b981]/15 text-[#34d399]`,title:"AI Bóc Kịch Bản Video",children:t.jsx(oo,{size:14})});';

if (wfContent.includes(targetBi)) {
  wfContent = wfContent.replace(targetBi, replBi);
  console.log('Successfully patched Bi icon!');
} else {
  console.error('ERROR: Could not find targetBi in WorkflowEditor!');
}

// 3. Patch Yp border glow
const targetGlow = 'case"elevenlabs":return"border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.35)]";';
const replGlow = 'case"elevenlabs":return"border-[#fbbf24] shadow-[0_0_20px_rgba(251,191,36,0.35)]";case"video-script-extract":return"border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.35)]";';

if (wfContent.includes(targetGlow)) {
  wfContent = wfContent.replace(targetGlow, replGlow);
  console.log('Successfully patched Yp border glow!');
} else {
  console.error('ERROR: Could not find targetGlow in WorkflowEditor!');
}

// 4. Patch Yp card body
const targetBody = 'type==="elevenlabs"&&t.jsx(xj,{node:e,audioAsset:bt,onUpdateConfig:f}),';
const replBody = 'type==="elevenlabs"&&t.jsx(xj,{node:e,audioAsset:bt,onUpdateConfig:f}),e.type==="video-script-extract"&&t.jsxs("div",{className:"flex-1 flex flex-col gap-1.5 p-2 bg-[#130f2440] border border-white/5 rounded-lg min-h-0 overflow-y-auto scrollbar-thin text-left",children:[t.jsxs("div",{className:"text-[11px] text-text-muted flex justify-between select-none",children:[t.jsx("span",{children:"Tác vụ:"}),t.jsx("span",{className:"font-semibold text-text-primary",children:"Bóc kịch bản lời thoại"})]}),e.config?.outputText?t.jsxs("div",{className:"mt-1 border-t border-white/5 pt-1",children:[t.jsx("span",{className:"text-[10px] text-emerald-400 font-bold uppercase",children:"Kịch bản đã bóc:"}),t.jsx("div",{className:"text-[11px] text-text-secondary bg-white/5 p-1.5 rounded mt-1 max-h-24 overflow-y-auto whitespace-pre-wrap select-text",children:e.config.outputText})]}):t.jsx("div",{className:"text-[10px] text-text-muted italic mt-1",children:"Nối Video Veo 3 vào node này để bóc kịch bản tự động"})]}),';

if (wfContent.includes(targetBody)) {
  wfContent = wfContent.replace(targetBody, replBody);
  console.log('Successfully patched Yp card body!');
} else {
  console.error('ERROR: Could not find targetBody in WorkflowEditor!');
}

// 5. Patch port sets J1 and ev
const targetJ1Video = 'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item"])';
const replJ1Video = 'video:new Set(["http-request","browser-request","download","delay","loop","condition","merge","select-item","video-script-extract"])';

if (wfContent.includes(targetJ1Video)) {
  wfContent = wfContent.replace(targetJ1Video, replJ1Video);
  console.log('Successfully patched J1 video set!');
} else {
  console.error('ERROR: Could not find targetJ1Video in WorkflowEditor!');
}

const targetEvText = 'text:new Set(["prompt","text","chatgpt-text","convert-data","date-time","delay","condition"])';
const replEvText = 'text:new Set(["prompt","text","chatgpt-text","convert-data","date-time","delay","condition","video-script-extract"])';

if (wfContent.includes(targetEvText)) {
  wfContent = wfContent.replace(targetEvText, replEvText);
  console.log('Successfully patched ev text set!');
} else {
  console.error('ERROR: Could not find targetEvText in WorkflowEditor!');
}

const targetEvVideo = 'video:new Set(["google-flow","grok","delay","condition"])';
const replEvVideo = 'video:new Set(["google-flow","grok","delay","condition","video-script-extract"])';

if (wfContent.includes(targetEvVideo)) {
  wfContent = wfContent.replace(targetEvVideo, replEvVideo);
  console.log('Successfully patched ev video set!');
} else {
  console.error('ERROR: Could not find targetEvVideo in WorkflowEditor!');
}

fs.writeFileSync(wfPath, wfContent, 'utf8');

console.log('--- Patching index-8u8DZic4.js ---');
const idxPath = 'app/out/renderer/assets/index-8u8DZic4.js';
let idxContent = fs.readFileSync(idxPath, 'utf8');

// Patch e2 (wt)
const targetE2 = 'condition:{width:440,height:220}}';
const replE2 = 'condition:{width:440,height:220},"video-script-extract":{width:380,height:220}}';

if (idxContent.includes(targetE2)) {
  idxContent = idxContent.replace(targetE2, replE2);
  console.log('Successfully patched e2/wt dimensions in index!');
} else {
  console.log('targetE2 not found or already patched.');
}

// Patch v0
const targetV0 = 'a.type==="elevenlabs"||a.type==="grok"||';
const replV0 = 'a.type==="elevenlabs"||a.type==="video-script-extract"||a.type==="grok"||';

if (idxContent.includes(targetV0)) {
  idxContent = idxContent.replace(targetV0, replV0);
  console.log('Successfully patched v0 in index!');
} else {
  console.log('targetV0 not found or already patched.');
}

fs.writeFileSync(idxPath, idxContent, 'utf8');
console.log('Done patching!');
