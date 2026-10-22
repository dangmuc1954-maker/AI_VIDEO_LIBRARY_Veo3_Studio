const fs = require('fs');
const vm = require('vm');
const path = require('path');

console.log('=== STARTING PATCH: SCENE TITLE LOCK AND VIDEO EDITOR SYNC ===');

// -------------------------------------------------------------
// 1. PATCH VideoStudio-frcr8V6s.js
// -------------------------------------------------------------
const vsPath = 'app/out/renderer/assets/VideoStudio-frcr8V6s.js';
if (!fs.existsSync(vsPath + '.bak_before_scene_lock')) {
  fs.copyFileSync(vsPath, vsPath + '.bak_before_scene_lock');
  console.log('[BACKUP] Created backup:', vsPath + '.bak_before_scene_lock');
}

let vsCode = fs.readFileSync(vsPath, 'utf8');

// 1.1 Helper function getSceneTitleForAsset injected right before Yi_title
const getSceneTitleHelper = `function getSceneTitleForAsset(asset,idx){if(!asset)return\`Cảnh \${idx!=null?idx+1:1}\`;const aid=asset.id||asset.assetId||"",jid=asset.jobId||"";let map={};try{if(typeof window!=="undefined"){map=window.__aiforge_scene_names||{};if((!aid||!map[aid])&&(!jid||!map[jid])&&window.localStorage){const loc=JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}");Object.assign(map,loc)}}}catch(_){}const resolved=(aid&&map[aid])||(jid&&map[jid])||asset.sceneName||asset.title||"";if(resolved&&resolved.trim())return resolved.trim();if(asset.name&&!asset.name.startsWith("generated-video-")&&!asset.name.startsWith("video-")){return asset.name.replace(/\\.[a-zA-Z0-9]+$/,"")}return\`Cảnh \${idx!=null?idx+1:1}\`};`;

if (!vsCode.includes('function getSceneTitleForAsset(')) {
  const yiIdx = vsCode.indexOf('function Yi_title(');
  if (yiIdx === -1) throw new Error('function Yi_title not found in VideoStudio');
  vsCode = vsCode.slice(0, yiIdx) + getSceneTitleHelper + vsCode.slice(yiIdx);
  console.log('[VS 1/8] Injected getSceneTitleForAsset helper');
} else {
  console.log('[VS 1/8] getSceneTitleForAsset already injected, skipping');
}

// 1.2 Update Gi(t, s) to lock titles and never overwrite existing video titles
const oldGi = 'function Gi(t,s){const n=new Map(s.map((o,w)=>[o.id,o.index||w+1])),prMap=new Map(s.map(o=>[o.id,o]));return[...t].map(v=>{const pr=prMap.get(v.promptId),st=(pr&&pr.title&&pr.title.trim())||v.title||"";return st?{...v,title:st}:v}).sort((o,w)=>{';
const newGi = 'function Gi(t,s){const n=new Map(s.map((o,w)=>[o.id,o.index||w+1])),prMap=new Map(s.map(o=>[o.id,o]));let lockedMap={};try{if(typeof window!=="undefined"&&window.localStorage){lockedMap=JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}")}}catch(_){}return[...t].map(v=>{const pr=prMap.get(v.promptId);const aid=v.asset?.assetId||v.asset?.id||"",jid=v.jobId||"";const lockedTitle=lockedMap[jid]||lockedMap[v.id]||(aid&&lockedMap[aid])||"";const savedTitle=(v.title&&v.title.trim())||"";const prTitle=(pr&&pr.title&&pr.title.trim())||"";const st=lockedTitle||savedTitle||prTitle||"";if(st){if(typeof window!=="undefined"){window.__aiforge_scene_names=window.__aiforge_scene_names||{};if(aid)window.__aiforge_scene_names[aid]=st;if(jid)window.__aiforge_scene_names[jid]=st;if(v.id)window.__aiforge_scene_names[v.id]=st;if(v.assets&&Array.isArray(v.assets)){v.assets.forEach(a=>{if(a&&(a.id||a.assetId))window.__aiforge_scene_names[a.id||a.assetId]=st})}}if(!lockedTitle&&typeof window!=="undefined"&&window.localStorage){try{if(jid)lockedMap[jid]=st;if(v.id)lockedMap[v.id]=st;if(aid)lockedMap[aid]=st;if(v.assets&&Array.isArray(v.assets)){v.assets.forEach(a=>{if(a&&(a.id||a.assetId))lockedMap[a.id||a.assetId]=st})}window.localStorage.setItem("vs_scene_names",JSON.stringify(lockedMap))}catch(_){}}}return st?{...v,title:st}:v}).sort((o,w)=>{';

if (vsCode.includes(oldGi)) {
  vsCode = vsCode.replace(oldGi, newGi);
  console.log('[VS 2/8] Updated Gi() with permanent scene title locking and asset mapping');
} else {
  console.log('[VS 2/8] oldGi not found (already patched?)');
}

// 1.3 Update Prompt Queue Table Cell: Primary title is scene name, prompt is description
const oldTablePrompt = 'children:F?(p.title&&p.title.trim()?e.jsxs("span",{children:[e.jsx("span",{className:"mr-1.5 inline-flex items-center rounded bg-purple-500/25 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40",children:p.title.trim()}),p.prompt]}):p.prompt):e.jsx("span",{className:"italic text-text-muted",children:P("videoStudio.blankPrompt")})';
const newTablePrompt = 'children:(p.title&&p.title.trim())?(F?e.jsxs("div",{className:"flex items-center gap-2 min-w-0",title:p.prompt,children:[e.jsx("span",{className:"font-bold text-violet-300 text-xs shrink-0 max-w-[220px] truncate",children:p.title.trim()}),e.jsx("span",{className:"text-[11px] text-text-muted font-normal truncate flex-1",children:`— ${p.prompt}`})]}):e.jsx("span",{className:"font-bold text-violet-300 text-xs truncate",children:p.title.trim()})):(F?p.prompt:e.jsx("span",{className:"italic text-text-muted",children:P("videoStudio.blankPrompt")}))';

if (vsCode.includes(oldTablePrompt)) {
  vsCode = vsCode.replace(oldTablePrompt, newTablePrompt);
  console.log('[VS 3/8] Updated Prompt Queue Table cell display');
} else {
  console.log('[VS 3/8] oldTablePrompt not found');
}

// 1.4 Modal fn: initial segment naming & auto-load fallback
const oldFnInitial = 'at.current||(at.current=!0,n&&n.length>0&&(async()=>{const a=[];for(const d of n){const h=w.find(c=>c.id===d&&c.type==="video");if(h){const c=h.url||h.localPath||"",b=js(h.ratio),M=await Bt(c),oe=M.duration??h.duration??10,v=M.aspectRatio??b??16/9;a.push({id:`seg-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,assetId:h.id,name:h.name||u("videoStudio.videoClipFallback"),prompt:h.prompt||"",url:c,thumbnailUrl:h.thumbnailUrl,originalDuration:oe,sourceAspectRatio:v,sourceWidth:M.width??void 0,sourceHeight:M.height??void 0,startTime:0,endTime:oe})}}m.current=a,S(a)';
const newFnInitial = 'at.current||(at.current=!0,(async()=>{const targetIds=(n&&n.length>0)?n:(w&&w.length>0?w.filter(c=>c.type==="video").slice(0,30).map(c=>c.id):[]);if(!targetIds||targetIds.length===0)return;const a=[];for(const d of targetIds){const h=w.find(c=>c.id===d&&c.type==="video");if(h){const c=h.url||h.localPath||"",b=js(h.ratio),M=await Bt(c),oe=M.duration??h.duration??10,v=M.aspectRatio??b??16/9;a.push({id:`seg-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,assetId:h.id,name:getSceneTitleForAsset(h,a.length),prompt:h.prompt||"",url:c,thumbnailUrl:h.thumbnailUrl,originalDuration:oe,sourceAspectRatio:v,sourceWidth:M.width??void 0,sourceHeight:M.height??void 0,startTime:0,endTime:oe})}}m.current=a,S(a)';

if (vsCode.includes(oldFnInitial)) {
  vsCode = vsCode.replace(oldFnInitial, newFnInitial);
  console.log('[VS 4/8] Updated fn initial segments naming & auto-load');
} else {
  console.log('[VS 4/8] oldFnInitial not found');
}

// 1.5 Modal fn: clip addition from asset drawer
const oldFnAdd = 'assetId:i.id,name:i.name||u("videoStudio.videoClipFallback"),prompt:i.prompt||"",url:a,thumbnailUrl:i.thumbnailUrl';
const newFnAdd = 'assetId:i.id,name:getSceneTitleForAsset(i,a.length),prompt:i.prompt||"",url:a,thumbnailUrl:i.thumbnailUrl';

if (vsCode.includes(oldFnAdd)) {
  vsCode = vsCode.replace(oldFnAdd, newFnAdd);
  console.log('[VS 5/8] Updated fn clip addition naming');
} else {
  console.log('[VS 5/8] oldFnAdd not found');
}

// 1.6 Modal fn: left asset drawer label
const oldFnDrawer = 'children:i.name||u("videoStudio.videoClipFallback")}),e.jsx("div",{className:"text-[11px] text-slate-400 truncate",children:i.prompt||u("videoStudio.noPromptFallback")})';
const newFnDrawer = 'children:getSceneTitleForAsset(i)}),e.jsx("div",{className:"text-[11px] text-slate-400 truncate",children:i.prompt||u("videoStudio.noPromptFallback")})';

if (vsCode.includes(oldFnDrawer)) {
  vsCode = vsCode.replace(oldFnDrawer, newFnDrawer);
  console.log('[VS 6/8] Updated fn left asset drawer label');
} else {
  console.log('[VS 6/8] oldFnDrawer not found');
}

// 1.7 Modal fn: right inspector details & timeline segment block
const oldFnInspector = 'children:u("videoStudio.videoName")}),e.jsx("div",{className:"break-words text-sm font-semibold leading-snug text-white",children:Ge.name})';
const newFnInspector = 'children:u("videoStudio.videoName")}),e.jsx("div",{className:"break-words text-sm font-semibold leading-snug text-white",children:getSceneTitleForAsset(Ge)})';

if (vsCode.includes(oldFnInspector)) {
  vsCode = vsCode.replace(oldFnInspector, newFnInspector);
  console.log('[VS 7/8] Updated fn right inspector title');
} else {
  console.log('[VS 7/8] oldFnInspector not found');
}

const oldFnTimelineLabel = '["#",a+1]}),e.jsx("span",{className:"text-xs font-semibold text-slate-100 truncate",children:i.name})';
const newFnTimelineLabel = '["#",a+1]}),e.jsx("span",{className:"text-xs font-semibold text-slate-100 truncate",children:getSceneTitleForAsset(i,a)})';

if (vsCode.includes(oldFnTimelineLabel)) {
  vsCode = vsCode.replace(oldFnTimelineLabel, newFnTimelineLabel);
  console.log('[VS 8/8] Updated fn timeline segment label to show scene name');
} else {
  console.log('[VS 8/8] oldFnTimelineLabel not found');
}

// 1.8 Toolbar "Biên tập video" button: pass selected/completed video assets
const oldToolbarBtn = 'type:"button","aria-label":t("videoStudio.openMergeModalButton"),onClick:()=>se(!0)';
const newToolbarBtn = 'type:"button","aria-label":t("videoStudio.openMergeModalButton"),onClick:()=>{let targetIds=[];if(W&&W.size>0){targetIds=ue.filter(v=>W.has(v.id)).map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean)}if(!targetIds||targetIds.length===0){targetIds=ue.filter(v=>v.status==="Completed").map(v=>v.asset?.assetId||v.asset?.id).filter(Boolean)}if(targetIds&&targetIds.length>0&&typeof J.getState==="function"&&J.getState().openMergeModalWithAssets){J.getState().openMergeModalWithAssets(targetIds)}else{se(!0)}}';

if (vsCode.includes(oldToolbarBtn)) {
  vsCode = vsCode.replace(oldToolbarBtn, newToolbarBtn);
  console.log('[VS 9/8] Enhanced toolbar Biên tập video button click');
}

// Write patched VideoStudio
fs.writeFileSync(vsPath, vsCode, 'utf8');
console.log('[OK] VideoStudio-frcr8V6s.js patched and written successfully!');

// -------------------------------------------------------------
// 2. PATCH aiforge_video_editor_automerge.js
// -------------------------------------------------------------
const amPath = 'app/out/renderer/assets/aiforge_video_editor_automerge.js';
if (!fs.existsSync(amPath + '.bak_before_scene_lock')) {
  fs.copyFileSync(amPath, amPath + '.bak_before_scene_lock');
  console.log('[BACKUP] Created backup:', amPath + '.bak_before_scene_lock');
}

let amCode = fs.readFileSync(amPath, 'utf8');

// 2.1 Helper function getSceneTitleForAsset injected at top of IIFE
const amHelper = `
  function getSceneTitleForAsset(asset, idx) {
    if (!asset) return 'Cảnh ' + (idx != null ? (idx + 1) : 1);
    const aid = asset.id || asset.assetId || '';
    const jid = asset.jobId || '';
    let map = {};
    try {
      if (typeof window !== 'undefined') {
        map = window.__aiforge_scene_names || {};
        if ((!aid || !map[aid]) && (!jid || !map[jid]) && window.localStorage) {
          const loc = JSON.parse(window.localStorage.getItem('vs_scene_names') || '{}');
          Object.assign(map, loc);
        }
      }
    } catch (_) {}
    const resolved = (aid && map[aid]) || (jid && map[jid]) || asset.sceneName || asset.title || '';
    if (resolved && resolved.trim()) return resolved.trim();
    if (asset.name && !asset.name.startsWith('generated-video-') && !asset.name.startsWith('video-')) {
      return asset.name.replace(/\\.[a-zA-Z0-9]+$/, '');
    }
    return 'Cảnh ' + (idx != null ? (idx + 1) : 1);
  }
`;

if (!amCode.includes('function getSceneTitleForAsset(')) {
  const insertMarker = 'window.__AIFORGE_VIDEO_EDITOR_AUTOMERGE_INITIALIZED__ = true;';
  const insIdx = amCode.indexOf(insertMarker);
  if (insIdx !== -1) {
    amCode = amCode.slice(0, insIdx + insertMarker.length) + amHelper + amCode.slice(insIdx + insertMarker.length);
    console.log('[AM 1/5] Injected getSceneTitleForAsset in automerge script');
  }
}

// 2.2 In openVideoEditorStudio: use getSceneTitleForAsset
amCode = amCode.replace(
  "name: a?.name || `Phân đoạn ${i + 1}`,",
  "name: getSceneTitleForAsset(a, i),"
);
amCode = amCode.replace(
  "name: a.name || `Phân đoạn ${i + 1}`,",
  "name: getSceneTitleForAsset(a, i),"
);
console.log('[AM 2/5] Updated timeline clip initialization in openVideoEditorStudio');

// 2.3 In renderModalDOM: timeline clip badge & name
amCode = amCode.replace(
  '<span class="text-xs font-semibold text-slate-200 truncate w-28">${clip.name}</span>',
  '<span class="text-xs font-semibold text-slate-200 truncate w-28">${getSceneTitleForAsset(clip, idx)}</span>'
);
console.log('[AM 3/5] Updated timeline clip name display in renderModalDOM');

// 2.4 In renderModalDOM: asset drawer name
amCode = amCode.replace(
  '<div class="text-xs font-semibold text-slate-200 truncate">${asset.name || \'Video Clip\'}</div>',
  '<div class="text-xs font-semibold text-slate-200 truncate">${getSceneTitleForAsset(asset)}</div>'
);
console.log('[AM 4/5] Updated asset library drawer name display');

// 2.5 In attachModalEvents: add single clip & add all clips
amCode = amCode.replace(
  "name: asset.name || `Phân đoạn ${timelineClips.length + 1}`,",
  "name: getSceneTitleForAsset(asset, timelineClips.length),"
);
amCode = amCode.replace(
  "name: asset.name || `Phân đoạn ${timelineClips.length + 1}`,",
  "name: getSceneTitleForAsset(asset, timelineClips.length),"
);
console.log('[AM 5/5] Updated add-clip events in attachModalEvents');

// Verify syntax of automerge script
new vm.Script(amCode);
fs.writeFileSync(amPath, amCode, 'utf8');
console.log('[OK] aiforge_video_editor_automerge.js patched and verified successfully!');

console.log('=== ALL PATCHES COMPLETED SUCCESSFULLY ===');
