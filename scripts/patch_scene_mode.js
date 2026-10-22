const fs = require('fs');
const path = require('path');

const targets = [
  path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js')
];

for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.log('[SKIP] Target does not exist:', target);
    continue;
  }
  
  console.log('[*] Patching Scene Mode in:', target);
  let code = fs.readFileSync(target, 'utf8');

  // 1. Update kt (prompt default creation)
  code = code.replace(
    'function kt(t,o,s){return{id:t,index:o,prompt:"",provider:s?.provider||"Veo3",mode:s?.mode||"Components"',
    'function kt(t,o,s){return{id:t,index:o,prompt:"",sceneName:s?.sceneName||`Phân cảnh ${o}`,provider:s?.provider||"Veo3",mode:s?.mode||"Components"'
  );

  // 2. Update Ce (re-indexing)
  code = code.replace(
    'function Ce(t){return t.map((o,s)=>({...o,index:s+1}))}',
    'function Ce(t){return t.map((o,s)=>({...o,index:s+1,sceneName:o.sceneName||`Phân cảnh ${s+1}`}))}'
  );

  // 3. Update So (load from localStorage)
  code = code.replace(
    'prompt:typeof a.prompt=="string"?a.prompt:"",provider:Oe.includes(a.provider)?a.provider:"Veo3"',
    'prompt:typeof a.prompt=="string"?a.prompt:"",sceneName:typeof a.sceneName=="string"&&a.sceneName?a.sceneName:`Phân cảnh ${n+1}`,provider:Oe.includes(a.provider)?a.provider:"Veo3"'
  );

  // 4. Update ye (save to localStorage)
  code = code.replace(
    'id:o.id,prompt:o.prompt,provider:o.provider',
    'id:o.id,prompt:o.prompt,sceneName:o.sceneName||`Phân cảnh ${o.index||1}`,provider:o.provider'
  );

  // 5. Update Bo (extract sceneIndex and sceneName from payload)
  code = code.replace(
    'E=_e(i.payload,"promptOrder"),C=_e(i.payload,"batchIndex")??$,z=Mr(i.payload),A=Go(i.payload),R={jobId:i.id,promptId:a,prompt:n',
    'E=_e(i.payload,"promptOrder"),C=_e(i.payload,"batchIndex")??$,z=Mr(i.payload),A=Go(i.payload),SI=_e(i.payload,"sceneIndex")??E??1,SN=re(i.payload,"sceneName")||`Phân cảnh ${SI}`,R={jobId:i.id,promptId:a,prompt:n,sceneIndex:SI,sceneName:SN'
  );

  // 6. Update Lo (STRICT Chronological Scene Ordering #1, #2, #3...)
  // Before: const a=or(n)-or(i);if(a!==0)return a;const c=i.promptOrder...
  // After: Always sort by sceneIndex / promptOrder (1, 2, 3...) FIRST so bulk generation always preserves exact scene sequence!
  const oldLo = 'function Lo(t,o){const s=new Map(o.map((i,n)=>[i.id,i.index||n+1]));return[...t].sort((i,n)=>{const a=or(n)-or(i);if(a!==0)return a;const c=i.promptOrder??s.get(i.promptId)??Number.MAX_SAFE_INTEGER,d=n.promptOrder??s.get(n.promptId)??Number.MAX_SAFE_INTEGER;if(c!==d)return c-d;const g=i.batchIndex??i.outputIndex??0,k=n.batchIndex??n.outputIndex??0;if(g!==k)return g-k;const $=rt(i.createdAt)-rt(n.createdAt);return $!==0?$:i.id.localeCompare(n.id)})}';
  const newLo = 'function Lo(t,o){const s=new Map(o.map((i,n)=>[i.id,i.index||n+1]));return[...t].sort((i,n)=>{const c=i.sceneIndex??i.promptOrder??s.get(i.promptId)??Number.MAX_SAFE_INTEGER,d=n.sceneIndex??n.promptOrder??s.get(n.promptId)??Number.MAX_SAFE_INTEGER;if(c!==d)return c-d;const g=i.batchIndex??i.outputIndex??0,k=n.batchIndex??n.outputIndex??0;if(g!==k)return g-k;const a=or(n)-or(i);if(a!==0)return a;const $=rt(i.createdAt)-rt(n.createdAt);return $!==0?$:i.id.localeCompare(n.id)})}';
  
  if (code.includes(oldLo)) {
    code = code.replace(oldLo, newLo);
  } else {
    console.log('[WARN] oldLo not matched directly, using regex replacement');
    code = code.replace(
      /function Lo\(t,o\)\{const s=new Map\(o\.map\(\(i,n\)=>\[i\.id,i\.index\|\|n\+1\]\)\);return\[\.\.\.t\]\.sort\(\(i,n\)=>\{const a=or\(n\)-or\(i\);if\(a!==0\)return a;const c=i\.promptOrder\?\?s\.get\(i\.promptId\)\?\?Number\.MAX_SAFE_INTEGER,d=n\.promptOrder\?\?s\.get\(n\.promptId\)\?\?Number\.MAX_SAFE_INTEGER;if\(c!==d\)return c-d;/g,
      'function Lo(t,o){const s=new Map(o.map((i,n)=>[i.id,i.index||n+1]));return[...t].sort((i,n)=>{const c=i.sceneIndex??i.promptOrder??s.get(i.promptId)??Number.MAX_SAFE_INTEGER,d=n.sceneIndex??n.promptOrder??s.get(n.promptId)??Number.MAX_SAFE_INTEGER;if(c!==d)return c-d;const g=i.batchIndex??i.outputIndex??0,k=n.batchIndex??n.outputIndex??0;if(g!==k)return g-k;const a=or(n)-or(i);if(a!==0)return a;'
    );
  }

  // 7. Update Xe (Queue Submission with sceneIndex and sceneName)
  // For Grok:
  code = code.replace(
    'promptOrder:f.index,batchIndex:$e,account:f.account',
    'promptOrder:f.index,sceneIndex:f.index,sceneName:f.sceneName||`Phân cảnh ${f.index}`,batchIndex:$e,account:f.account'
  );
  // For Veo3:
  code = code.replace(
    'promptOrder:f.index,batchIndex:Z,account:f.account',
    'promptOrder:f.index,sceneIndex:f.index,sceneName:f.sceneName||`Phân cảnh ${f.index}`,batchIndex:Z,account:f.account'
  );

  // 8. Update Video Download filename with Scene Number and Scene Name
  code = code.replace(
    'r.download=`video-${W.promptOrder||W.promptId}.mp4`',
    'const sn=W.sceneIndex||W.promptOrder||1,st=(W.sceneName||`Phan_Canh_${sn}`).replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g,"_").replace(/_+/g,"_").slice(0,40);r.download=`Phan_Canh_${sn}_${st}.mp4`'
  );

  // 9. Update Table Header and Cells in ln (Prompt Queue Table)
  // Add scene badge to table row
  code = code.replace(
    'e.jsx("td",{className:"px-1 py-1 text-xs tabular-nums text-text-muted",children:m.index})',
    'e.jsxs("td",{className:"px-1 py-1 text-xs tabular-nums text-violet-300 font-bold",children:[e.jsx("span",{className:"rounded px-1.5 py-0.5 bg-violet-500/15 border border-violet-500/30",children:`#${m.index}`})]})'
  );

  code = code.replace(
    'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-text-primary",children:P?m.prompt:e.jsx("span",{className:"italic text-text-muted",children:"Blank video prompt"})})',
    'e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-1.5 mb-0.5",children:[e.jsx("span",{className:"text-[10px] font-bold text-violet-300 uppercase tracking-wider",children:m.sceneName||`Phân cảnh ${m.index}`})]}),e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-text-primary",children:P?m.prompt:e.jsx("span",{className:"italic text-text-muted",children:"Blank video prompt"})})]})'
  );

  // 10. Update Right Inspector (cn) to include Scene Naming section
  const oldInspectorPromptSection = 'e.jsxs("section",{className:"flex flex-col gap-1.5 rounded-lg border border-border-primary bg-bg-primary/25 p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-bold text-text-muted uppercase tracking-wider select-none",children:"Prompt"}),e.jsxs("span",{className:"text-[9px] font-semibold text-text-muted/60",children:[n.prompt.length," / ",Ht]})]}),e.jsx("textarea",{ref:T,value:n.prompt,onChange:p=>R(n.id,{prompt:p.target.value})';

  const newInspectorPromptSection = 'e.jsxs("section",{className:"flex flex-col gap-2 rounded-lg border border-violet-500/25 bg-violet-950/20 p-3 shadow-[0_0_15px_rgba(124,58,237,0.06)]",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("label",{className:"text-[10px] font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5",children:["🎬 Phân cảnh #",n.index]}),e.jsx("span",{className:"text-[9px] font-medium text-text-muted",children:"Chia phân cảnh tự động"})]}),e.jsx("input",{type:"text",value:n.sceneName||`Phân cảnh ${n.index}`,onChange:p=>R(n.id,{sceneName:p.target.value}),placeholder:`Tên phân cảnh ${n.index}...`,className:"w-full h-8 rounded-lg border border-white/10 bg-[#130f2480] px-2.5 text-xs font-semibold text-text-primary outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/40"})]}),e.jsxs("section",{className:"flex flex-col gap-1.5 rounded-lg border border-border-primary bg-bg-primary/25 p-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("label",{className:"text-[9px] font-bold text-text-muted uppercase tracking-wider select-none",children:"Prompt"}),e.jsxs("span",{className:"text-[9px] font-semibold text-text-muted/60",children:[n.prompt.length," / ",Ht]})]}),e.jsx("textarea",{ref:T,value:n.prompt,onChange:p=>R(n.id,{prompt:p.target.value})';

  if (code.includes(oldInspectorPromptSection)) {
    code = code.replace(oldInspectorPromptSection, newInspectorPromptSection);
  }

  // 11. Update Grid Card in dn (Preview Results) to show Scene Badge and editable Scene Name under video
  const oldGridCardInner = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",children:(l.prompt||"").trim()||"Blank video prompt"})';
  const newGridCardInner = 'e.jsxs("div",{className:"min-w-0 mb-1",children:[e.jsxs("div",{className:"flex items-center justify-between gap-1 mb-0.5",children:[e.jsxs("span",{className:"inline-flex items-center gap-1 rounded bg-violet-500/30 px-1.5 py-0.5 text-[9px] font-bold text-violet-200 border border-violet-400/40 shadow-sm",children:["🎬 Cảnh ",l.sceneIndex||l.promptOrder||1]}),e.jsx("button",{title:"Đổi tên phân cảnh",onClick:b=>{b.stopPropagation();const nn=window.prompt("Nhập tên phân cảnh mới:",l.sceneName||`Phân cảnh ${l.sceneIndex||l.promptOrder||1}`);if(nn!=null&&nn.trim()){try{const mp=JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}");mp[l.jobId]=nn.trim();mp[l.promptId]=nn.trim();window.localStorage.setItem("vs_scene_names",JSON.stringify(mp));l.sceneName=nn.trim();window.dispatchEvent(new Event("storage"));}catch{}}},className:"cursor-pointer rounded px-1 py-0.5 text-[9px] text-violet-300 hover:bg-white/10 transition-colors",children:"✏️ Sửa tên"})]}),e.jsx("div",{className:"truncate text-[10px] font-bold text-violet-200 drop-shadow",title:l.sceneName||`Phân cảnh ${l.sceneIndex||l.promptOrder||1}`,children:((typeof window!=="undefined"&&window.localStorage&&(JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}")[l.jobId]||JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}")[l.promptId]))||l.sceneName||`Phân cảnh ${l.sceneIndex||l.promptOrder||1}`)}),e.jsx("div",{className:"truncate text-[11px] font-normal leading-4 text-white/90 drop-shadow mt-0.5",children:(l.prompt||"").trim()||"Blank video prompt"})]})';

  if (code.includes(oldGridCardInner)) {
    code = code.replace(oldGridCardInner, newGridCardInner);
  }

  // 12. Update List Card in dn
  const oldListPromptTitle = 'e.jsx("div",{className:"truncate text-base font-semibold text-text-primary",children:(P.prompt||"").trim()||"Blank video prompt"})';
  const newListPromptTitle = 'e.jsxs("div",{className:"min-w-0 mb-1",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsxs("span",{className:"inline-flex items-center gap-1 rounded-md bg-violet-500/25 px-2 py-0.5 text-xs font-bold text-violet-300 border border-violet-400/40",children:["🎬 Phân cảnh ",P.sceneIndex||P.promptOrder||1]}),e.jsx("span",{className:"text-xs font-bold text-violet-200",children:((typeof window!=="undefined"&&window.localStorage&&(JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}")[P.jobId]||JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}")[P.promptId]))||P.sceneName||`Phân cảnh ${P.sceneIndex||P.promptOrder||1}`)}),e.jsx("button",{title:"Đổi tên phân cảnh",onClick:b=>{b.stopPropagation();const nn=window.prompt("Nhập tên phân cảnh mới:",P.sceneName||`Phân cảnh ${P.sceneIndex||P.promptOrder||1}`);if(nn!=null&&nn.trim()){try{const mp=JSON.parse(window.localStorage.getItem("vs_scene_names")||"{}");mp[P.jobId]=nn.trim();mp[P.promptId]=nn.trim();window.localStorage.setItem("vs_scene_names",JSON.stringify(mp));P.sceneName=nn.trim();window.dispatchEvent(new Event("storage"));}catch{}}},className:"cursor-pointer rounded px-1.5 py-0.5 text-[10px] text-violet-300 hover:bg-white/10 transition-colors",children:"✏️ Đổi tên"})]}),e.jsx("div",{className:"truncate text-sm font-semibold text-text-primary",children:(P.prompt||"").trim()||"Blank video prompt"})]})';

  if (code.includes(oldListPromptTitle)) {
    code = code.replace(oldListPromptTitle, newListPromptTitle);
  }

  fs.writeFileSync(target, code, 'utf8');
  console.log('[OK] Successfully updated Scene Mode in:', target);
}
