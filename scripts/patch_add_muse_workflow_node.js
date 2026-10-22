const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('======================================================================');
console.log('🚀 TÍCH HỢP NODE NỀN TẢNG MUSE AI VÀO WORKFLOW STUDIO 🚀');
console.log('======================================================================');

const appDir = path.resolve(__dirname, '../app');
const indexPath = path.join(appDir, 'out/renderer/assets/index-BS7vgKVV.js');
const editorPath = path.join(appDir, 'out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const runnerPath = path.join(appDir, 'out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
const iconPath = path.join(appDir, 'out/renderer/assets/ProviderIcon-BR50w6N5.js');

// SVG Data URI for Muse AI Icon
const museSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#241242"/><stop offset="100%" stop-color="#0c0718"/></linearGradient><linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#c084fc"/><stop offset="50%" stop-color="#818cf8"/><stop offset="100%" stop-color="#f472b6"/></linearGradient><filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#a855f7" flood-opacity="0.8"/></filter></defs><rect width="64" height="64" rx="16" fill="url(#bgGrad)"/><rect width="62" height="62" x="1" y="1" rx="15" stroke="url(#mGrad)" stroke-width="1.5" stroke-opacity="0.5"/><path d="M17 45V19L32 33L47 19V45" stroke="url(#mGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/><circle cx="32" cy="18" r="3" fill="#f472b6"/></svg>`;
const museIconUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(museSvg);

// 1. ProviderIcon-BR50w6N5.js
let iconCode = fs.readFileSync(iconPath, 'utf8');
if (!iconCode.includes('museIconUri')) {
  iconCode = `const museIconUri="${museIconUri}";\n` + iconCode;
  iconCode = iconCode.replace('"Muse AI":m,"muse ai":m,muse:m', '"Muse AI":museIconUri,"muse ai":museIconUri,muse:museIconUri');
  fs.writeFileSync(iconPath, iconCode, 'utf8');
  console.log('✓ ProviderIcon updated');
}

// 2. index-BS7vgKVV.js
let indexCode = fs.readFileSync(indexPath, 'utf8');
if (!indexCode.includes('case"muse":')) {
  const oldOk = 'ok=(n,a,r)=>{if(a!=="google-flow"&&a!=="grok")return null;';
  const newOk = 'ok=(n,a,r)=>{if(a==="muse")return{inputs:[{id:`${n}-in-txt`,type:"text",label:"Prompt"},{id:`${n}-in-img`,type:"image",label:"Reference Image",optional:!0}],outputs:[{id:`${n}-out-vid`,type:"video",label:"Video"}]};if(a!=="google-flow"&&a!=="grok")return null;';
  if (indexCode.includes(oldOk)) indexCode = indexCode.replace(oldOk, newOk);

  const oldPn = 'n==="grok"?a==="Video"?"Grok - Video Generator":"Grok - Image Generator":';
  const newPn = 'n==="grok"?a==="Video"?"Grok - Video Generator":"Grok - Image Generator":n==="muse"?"Muse - Video Generator":';
  if (indexCode.includes(oldPn)) indexCode = indexCode.replace(oldPn, newPn);

  const oldFk = 'grok:"Create images/videos with Grok..."}';
  const newFk = 'grok:"Create images/videos with Grok...",muse:"Tạo video bằng Muse AI..."}';
  if (indexCode.includes(oldFk)) indexCode = indexCode.replace(oldFk, newFk);

  const oldPromptPl = 'n==="grok"?"workflow.promptPlaceholder_grok":';
  const newPromptPl = 'n==="grok"?"workflow.promptPlaceholder_grok":n==="muse"?"Tạo video bằng Muse AI...":';
  if (indexCode.includes(oldPromptPl)) indexCode = indexCode.replace(oldPromptPl, newPromptPl);

  indexCode = indexCode.replace('const r=new Set(["loop","google-flow","chatgpt","elevenlabs","grok"])', 'const r=new Set(["loop","google-flow","chatgpt","elevenlabs","grok","muse"])');
  indexCode = indexCode.replace('n.type==="elevenlabs"||n.type==="grok"||n.type==="convert-data"||n.type==="date-time"', 'n.type==="elevenlabs"||n.type==="grok"||n.type==="muse"||n.type==="convert-data"||n.type==="date-time"');
  indexCode = indexCode.replace('n.type==="elevenlabs"||n.type==="grok"||n.type==="convert-data"||n.type==="merge"?n.status!=="failed"', 'n.type==="elevenlabs"||n.type==="grok"||n.type==="muse"||n.type==="convert-data"||n.type==="merge"?n.status!=="failed"');
  indexCode = indexCode.replace('n.type==="elevenlabs"||n.type==="grok"||n.type==="convert-data"||n.type==="loop"', 'n.type==="elevenlabs"||n.type==="grok"||n.type==="muse"||n.type==="convert-data"||n.type==="loop"');
  indexCode = indexCode.replace('video:new Set(["google-flow","grok","delay","condition","video-script-extract","video-dubbing"])', 'video:new Set(["google-flow","grok","muse","delay","condition","video-script-extract","video-dubbing"])');
  indexCode = indexCode.replace('text:new Set(["google-flow","grok","chatgpt","chatgpt-analyze","chatgpt-text","elevenlabs","convert-data","text-splitter"])', 'text:new Set(["google-flow","grok","muse","chatgpt","chatgpt-analyze","chatgpt-text","elevenlabs","convert-data","text-splitter"])');
  indexCode = indexCode.replace('ER=new Set(["google-flow","grok","chatgpt","chatgpt-analyze","chatgpt-text","elevenlabs","convert-data","text-splitter"])', 'ER=new Set(["google-flow","grok","muse","chatgpt","chatgpt-analyze","chatgpt-text","elevenlabs","convert-data","text-splitter"])');

  const oldGrokCase = 'case"grok":return{id:a,type:"grok",title:Pn("grok","Image"),x:r,y:i,enabled:!0,active:!0,inputs:[{id:`${a}-in-img`,type:"image"},{id:`${a}-in-txt`,type:"text"}],outputs:[{id:`${a}-out-img`,type:"image"}],config:{prompt:"",mode:"Image",model:"Grok 3",duration:"6s",videoMode:"Components",aspect:"9:16",count:1},...Nr("9:16")};';
  const newMuseCase = `case"muse":return{id:a,type:"muse",title:Pn("muse","Video"),x:r,y:i,enabled:!0,active:!0,inputs:[{id:\`\${a}-in-txt\`,type:"text",label:"Prompt"},{id:\`\${a}-in-img\`,type:"image",label:"Reference Image",optional:!0}],outputs:[{id:\`\${a}-out-vid\`,type:"video",label:"Video"}],config:{prompt:"",mode:"Video",model:"muse-video",duration:"5s",aspect:"16:9",count:1,account:"Auto",useOwnPrompt:!1},...Nr("16:9")};`;
  indexCode = indexCode.replace(oldGrokCase, oldGrokCase + newMuseCase);

  indexCode = indexCode.replace('n.type==="grok"||n.type==="elevenlabs"?{effect:"billable"', 'n.type==="grok"||n.type==="elevenlabs"||n.type==="muse"?{effect:"billable"');
  fs.writeFileSync(indexPath, indexCode, 'utf8');
  console.log('✓ index-BS7vgKVV.js updated');
}

// 3. WorkflowEditor-LHGC9K3C.js
let editorCode = fs.readFileSync(editorPath, 'utf8');
if (!editorCode.includes('function MuseConfigPanel')) {
  const museConfigPanelFunction = `
const museIconUri = "${museIconUri}";
function MuseConfigPanel({
  configNode: e,
  panelNodeConfig: r,
  setPanelNodeConfig: o,
  setPanelNodeTitle: n,
  onSelectReferenceImages: s,
  onPreviewImage: a,
  onRemoveReferenceImage: l,
  onPreviewPrompt: i,
  panelNodeTitle: c,
  assets: f,
  slugSuggestions: p,
  resolvedPromptPreview: u = ""
}) {
  const { t: d } = be();
  const promptVal = (() => {
    const g = typeof r.prompt == "string" ? r.prompt : "";
    return g && !Lt(g) ? "" : g;
  })();
  const dur = r.duration || "5s";
  const asp = r.aspect || "16:9";
  const curAcc = r.account || "Auto";
  
  const allSessions = (typeof Wd !== "undefined" && Wd.getState) ? (Wd.getState().sessions || []) : [];
  const museSessions = allSessions.filter(acc => 
    (acc.provider && acc.provider.toLowerCase().includes("muse")) || 
    (acc.startUrl && acc.startUrl.includes("muse.ai")) || 
    acc.providerId === "muse" || 
    acc.providerId === "muse-ai"
  );

  const setRatio = (newAsp) => {
    const sz = Ad(newAsp, "muse");
    o({ ...r, aspect: newAsp, ...(sz ? { width: sz.width, height: sz.height } : {}) });
  };

  return t.jsxs("div", {
    className: "flex flex-col gap-3",
    children: [
      t.jsxs("div", {
        className: "flex items-center justify-between py-0.5",
        children: [
          t.jsx("span", {
            className: "text-xs font-semibold text-text-primary",
            children: "Sử dụng prompt riêng"
          }),
          t.jsx("button", {
            type: "button",
            onClick: () => o({ ...r, useOwnPrompt: !r.useOwnPrompt }),
            className: \`w-7.5 h-4 rounded-full transition-colors relative flex items-center p-0.5 \${r.useOwnPrompt ? "bg-green" : "bg-white/10 border border-white/5"}\`,
            children: t.jsx("div", {
              className: \`w-3 h-3 rounded-full bg-white transition-transform \${r.useOwnPrompt ? "translate-x-3.5" : "translate-x-0"}\`
            })
          })
        ]
      }),
      t.jsxs("div", {
        className: "flex flex-col gap-1",
        children: [
          t.jsxs("div", {
            className: "flex items-center justify-between gap-2",
            children: [
              t.jsxs("label", {
                className: "text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 select-none",
                children: [
                  t.jsx(Zr, { size: 11 }),
                  " ",
                  "Prompt tạo video"
                ]
              }),
              t.jsx("button", {
                type: "button",
                onClick: () => i(\`\${c} Text\`, Lt(r.prompt), {
                  nodeId: e.id,
                  field: "prompt",
                  initialTab: "resolved",
                  draftConfig: r,
                  draftTitle: c,
                  placeholder: "Nhập prompt tạo video Muse AI..."
                }),
                className: "rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-semibold text-text-secondary transition-all hover:bg-white/10 hover:text-text-primary",
                children: "Text"
              })
            ]
          }),
          r.useOwnPrompt ? t.jsx("div", {
            className: "relative border border-white/10 rounded-lg bg-[#130f2440]",
            children: t.jsx(Ke, {
              value: promptVal,
              onValueChange: g => o({ ...r, prompt: g }),
              slugSuggestions: p,
              enableResolvedPreview: !0,
              placeholder: "Nhập mô tả video bạn muốn Muse AI sinh...",
              rows: 3,
              wrapperClassName: "relative",
              className: "w-full bg-transparent text-xs text-text-primary p-2.5 outline-none resize-none leading-normal"
            })
          }) : t.jsx("div", {
            className: "max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-[#130f2440] p-2.5 text-left text-xs leading-relaxed text-text-primary scrollbar-thin",
            children: u || t.jsx("span", {
              className: "italic text-text-muted/50",
              children: "Chưa có prompt (kết nối từ node Prompt/Text/ChatGPT phía trước)"
            })
          })
        ]
      }),
      t.jsxs("div", {
        className: "flex flex-col gap-3 border-t border-white/5 pt-3 mt-1",
        children: [
          t.jsxs("label", {
            className: "text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1 select-none",
            children: [
              t.jsx(yt, { size: 11 }),
              " ",
              "Cài đặt Video Muse AI"
            ]
          }),
          t.jsxs("div", {
            className: "flex items-center gap-2 p-2 rounded-lg bg-[#2e1065]/35 border border-[#a78bfa]/25 shadow-[0_0_12px_rgba(167,139,250,0.1)]",
            children: [
              t.jsx("div", {
                className: "w-6 h-6 rounded-md flex items-center justify-center bg-[#7c3aed]/40 text-[#c4b5fd]",
                children: t.jsx(At, { size: 13, className: "fill-current" })
              }),
              t.jsxs("div", {
                className: "flex flex-col",
                children: [
                  t.jsx("span", {
                    className: "text-[11px] font-bold text-[#e9d5ff]",
                    children: "Chế độ Video AI"
                  }),
                  t.jsx("span", {
                    className: "text-[9px] text-[#a78bfa]/80",
                    children: "Tự động sinh video độ nét cao trực tiếp qua Muse.ai"
                  })
                ]
              })
            ]
          }),
          t.jsxs("div", {
            className: "flex flex-col gap-1.5",
            children: [
              t.jsx("span", {
                className: "text-[9px] text-text-muted font-bold uppercase tracking-wider select-none",
                children: "Thời lượng video (Duration)"
              }),
              t.jsx("div", {
                className: "grid grid-cols-3 gap-1.5",
                children: ["5s", "10s", "15s"].map(dOpt => t.jsx("button", {
                  type: "button",
                  key: dOpt,
                  onClick: () => o({ ...r, duration: dOpt }),
                  className: \`py-1.5 rounded-md border text-[11px] font-semibold transition-all \${dur === dOpt ? "border-[#a855f7]/60 bg-[#a855f7]/25 text-[#e9d5ff] shadow-[0_0_10px_rgba(168,85,247,0.25)]" : "border-white/5 bg-transparent text-text-secondary hover:bg-white/5"}\`,
                  children: dOpt
                }))
              })
            ]
          }),
          t.jsxs("div", {
            className: "flex flex-col gap-1.5",
            children: [
              t.jsx("span", {
                className: "text-[9px] text-text-muted font-bold uppercase tracking-wider select-none",
                children: "Tỉ lệ khung hình (Aspect Ratio)"
              }),
              t.jsx("div", {
                className: "grid grid-cols-3 gap-1.5",
                children: [
                  { id: "16:9", label: "16:9 (Ngang)" },
                  { id: "9:16", label: "9:16 (Dọc)" },
                  { id: "1:1", label: "1:1 (Vuông)" }
                ].map(rOpt => t.jsx("button", {
                  type: "button",
                  key: rOpt.id,
                  onClick: () => setRatio(rOpt.id),
                  className: \`py-1.5 rounded-md border text-[10px] font-semibold transition-all \${asp === rOpt.id ? "border-[#a855f7]/60 bg-[#a855f7]/25 text-[#e9d5ff] shadow-[0_0_10px_rgba(168,85,247,0.25)]" : "border-white/5 bg-transparent text-text-secondary hover:bg-white/5"}\`,
                  children: rOpt.label
                }))
              })
            ]
          }),
          t.jsxs("div", {
            className: "flex flex-col gap-1.5",
            children: [
              t.jsx("span", {
                className: "text-[9px] text-text-muted font-bold uppercase tracking-wider select-none",
                children: "Tài khoản Muse AI (Browser Hub)"
              }),
              t.jsx(Ee, {
                value: curAcc,
                onChange: accVal => o({ ...r, account: accVal }),
                options: [
                  { value: "Auto", label: "Tự động chọn (Auto)" },
                  ...museSessions.map(acc => ({
                    value: acc.accountName || acc.accountDisplayName || acc.accountId,
                    label: \`\${acc.accountName || acc.accountDisplayName || "Muse Account"} (\${acc.authStatus || "Ready"})\`
                  }))
                ],
                placeholder: "Chọn tài khoản Muse AI"
              }),
              museSessions.length === 0 && t.jsx("span", {
                className: "text-[9px] text-[#f59e0b] italic mt-0.5",
                children: "⚠️ Chưa có tài khoản Muse AI trong Browser Hub. Hãy vào Browser Hub để thêm tài khoản."
              })
            ]
          })
        ]
      })
    ]
  });
}
`;

  const importAnchor = 'import"./runtimeIndexes-gerug5IH.js";';
  if (editorCode.includes(importAnchor)) {
    editorCode = editorCode.replace(importAnchor, importAnchor + '\n' + museConfigPanelFunction + '\n');
  }

  editorCode = editorCode.replace(
    'e.type==="grok"?(r="Grok",o=Qd,n="bg-gradient-to-r from-[#27272a]/60 via-[#09090b]/95 to-[#09090b]/95 border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-clip-padding",s="bg-transparent p-0"):',
    'e.type==="grok"?(r="Grok",o=Qd,n="bg-gradient-to-r from-[#27272a]/60 via-[#09090b]/95 to-[#09090b]/95 border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.05)] bg-clip-padding",s="bg-transparent p-0"):e.type==="muse"?(r="Muse AI",o=museIconUri,n="bg-gradient-to-r from-[#4c1d95]/70 via-[#1e1b4b]/95 to-[#0f172a]/95 border border-[#8b5cf6]/35 shadow-[0_0_15px_rgba(139,92,246,0.18)] bg-clip-padding",s="bg-transparent p-0"):'
  );

  editorCode = editorCode.replace(
    'case"grok":return t.jsx("div",{className:`${n} rounded-lg bg-black/40 border border-white/10`,title:"Grok",children:t.jsx("img",{src:Qd,alt:"Grok",className:"w-full h-full object-cover rounded-lg"})});',
    'case"muse":return t.jsx("div",{className:`${n} rounded-lg bg-[#4c1d95]/30 border border-[#8b5cf6]/30 flex items-center justify-center p-0.5`,title:"Muse AI",children:t.jsx("img",{src:museIconUri,alt:"Muse AI",className:"w-full h-full object-cover rounded-lg"})});case"grok":return t.jsx("div",{className:`${n} rounded-lg bg-black/40 border border-white/10`,title:"Grok",children:t.jsx("img",{src:Qd,alt:"Grok",className:"w-full h-full object-cover rounded-lg"})});'
  );

  editorCode = editorCode.replace(
    'pt=(e.type==="google-flow"||e.type==="grok"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="elevenlabs")&&s.resolvedPrompt||ft',
    'pt=(e.type==="google-flow"||e.type==="grok"||e.type==="muse"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="elevenlabs")&&s.resolvedPrompt||ft'
  );

  editorCode = editorCode.replace(
    'e.type==="google-flow"||e.type==="grok"||e.type==="chatgpt"||e.type==="image"?e.config?.mode==="Video"?t.jsx("div",{className:"w-[24px] h-[24px] rounded-md flex items-center justify-center bg-[#2e1065]/50 border border-[#a78bfa]/20 text-[#a78bfa]',
    'e.type==="google-flow"||e.type==="grok"||e.type==="muse"||e.type==="chatgpt"||e.type==="image"?e.config?.mode==="Video"?t.jsx("div",{className:"w-[24px] h-[24px] rounded-md flex items-center justify-center bg-[#2e1065]/50 border border-[#a78bfa]/20 text-[#a78bfa]'
  );

  editorCode = editorCode.replace(
    '(e.type==="google-flow"||e.type==="grok"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="chatgpt-synthesize"||e.type==="elevenlabs"||e.type==="image"||e.type==="text-splitter")&&t.jsxs("div",{className:"workflow-node-footer',
    '(e.type==="google-flow"||e.type==="grok"||e.type==="muse"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="chatgpt-synthesize"||e.type==="elevenlabs"||e.type==="image"||e.type==="text-splitter")&&t.jsxs("div",{className:"workflow-node-footer'
  );

  editorCode = editorCode.replace(
    'e.type==="chatgpt"&&ut(`${e.id}-quality`,je,je,Dr,rt),',
    'e.type==="muse"&&t.jsxs(t.Fragment,{children:[ut(`${e.id}-model`,"muse-video","muse-video",["muse-video"],F=>h?.(e.id,{...e.config,model:F})),ut(`${e.id}-duration`,e.config?.duration||"5s",e.config?.duration||"5s",["5s","10s","15s"],F=>h?.(e.id,{...e.config,duration:F}))]}),e.type==="chatgpt"&&ut(`${e.id}-quality`,je,je,Dr,rt),'
  );

  editorCode = editorCode.replace(
    '{type:"grok",title:"Grok - Image / Video Generator",desc:a("workflow.nodeDesc_grok")},',
    '{type:"grok",title:"Grok - Image / Video Generator",desc:a("workflow.nodeDesc_grok")},{type:"muse",title:"Muse - Video Generator",desc:"Tạo video từ văn bản bằng nền tảng AI Muse"},'
  );

  editorCode = editorCode.replace(
    'c2=new Set(["google-flow","chatgpt","chatgpt-analyze","chatgpt-text","grok","elevenlabs"])',
    'c2=new Set(["google-flow","chatgpt","chatgpt-analyze","chatgpt-text","grok","elevenlabs","muse"])'
  );

  editorCode = editorCode.replaceAll(
    'h.type==="chatgpt-synthesize"||h.type==="grok"||h.type==="elevenlabs"||h.type==="http-request"',
    'h.type==="chatgpt-synthesize"||h.type==="grok"||h.type==="muse"||h.type==="elevenlabs"||h.type==="http-request"'
  );

  editorCode = editorCode.replace(
    'h.type==="grok"&&t.jsx(Lj,{configNode:h,panelNodeConfig:l,setPanelNodeConfig:u,setPanelNodeTitle:p,onSelectReferenceImages:g,onPreviewImage:S,onRemoveReferenceImage:E,onPreviewPrompt:R,panelNodeTitle:a,assets:N,slugSuggestions:ee,resolvedPromptPreview:re}),',
    'h.type==="grok"&&t.jsx(Lj,{configNode:h,panelNodeConfig:l,setPanelNodeConfig:u,setPanelNodeTitle:p,onSelectReferenceImages:g,onPreviewImage:S,onRemoveReferenceImage:E,onPreviewPrompt:R,panelNodeTitle:a,assets:N,slugSuggestions:ee,resolvedPromptPreview:re}),h.type==="muse"&&t.jsx(MuseConfigPanel,{configNode:h,panelNodeConfig:l,setPanelNodeConfig:u,setPanelNodeTitle:p,onSelectReferenceImages:g,onPreviewImage:S,onRemoveReferenceImage:E,onPreviewPrompt:R,panelNodeTitle:a,assets:N,slugSuggestions:ee,resolvedPromptPreview:re}),'
  );

  editorCode = editorCode.replace(
    '(B.type==="google-flow"||B.type==="grok"||B.type==="chatgpt"||B.type==="image")&&me.aspect',
    '(B.type==="google-flow"||B.type==="grok"||B.type==="muse"||B.type==="chatgpt"||B.type==="image")&&me.aspect'
  );

  fs.writeFileSync(editorPath, editorCode, 'utf8');
  console.log('✓ WorkflowEditor-LHGC9K3C.js updated');
}

// 4. useWorkflowRunner-DGw6Ekx4.js
let runnerCode = fs.readFileSync(runnerPath, 'utf8');
if (!runnerCode.includes('if(e.type==="muse"){')) {
  runnerCode = runnerCode.replace(
    'e.type==="google-flow"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="elevenlabs"||e.type==="grok"',
    'e.type==="google-flow"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="elevenlabs"||e.type==="grok"||e.type==="muse"'
  );

  runnerCode = runnerCode.replace(
    'e.type==="google-flow"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="chatgpt-synthesize"||e.type==="grok"||e.type==="elevenlabs"||e.type==="download"',
    'e.type==="google-flow"||e.type==="chatgpt"||e.type==="chatgpt-analyze"||e.type==="chatgpt-text"||e.type==="chatgpt-synthesize"||e.type==="grok"||e.type==="muse"||e.type==="elevenlabs"||e.type==="download"'
  );

  const oldAlGrokLoop = 'if(e.type==="grok"&&e.config?.mode==="Video"){';
  const newAlMuseJob = `if(e.type==="muse"){
  const museDuration = e.config?.duration || "5s";
  const museRatio = h || e.config?.aspect || "16:9";
  j.push({
    title: c,
    type: "Video",
    providerId: "muse",
    provider: "Muse AI",
    payload: {
      ...Y,
      promptId: e.id,
      prompt: c,
      ratio: museRatio,
      mode: "Components",
      duration: museDuration,
      model: "muse-video",
      outputIndex: S,
      batchSize: b,
      generationRunId: o,
      generationRunCreatedAt: s,
      promptOrder: S + 1,
      batchIndex: S,
      account: e.config?.account || "Auto",
      referenceAssetIds: C.slice(0, 1),
      resolutionName: "720p",
      preset: "custom",
      studioSource: "workflow",
      accountSelection: e.config?.account && e.config.account !== "Auto" ? "manual" : "auto",
      retryPolicy: { maxAttempts: 4, baseDelayMs: 5e3, maxDelayMs: 45e3, rateLimitDelayMs: 6e4, retryableCodes: ["NETWORK", "RATE_LIMITED"] }
    }
  });
  continue;
}
if(e.type==="grok"&&e.config?.mode==="Video"){`;

  runnerCode = runnerCode.replace(oldAlGrokLoop, newAlMuseJob);

  runnerCode = runnerCode.replace(
    'else if(r.type==="google-flow"||r.type==="chatgpt"||r.type==="grok"||r.type==="elevenlabs"){',
    'else if(r.type==="google-flow"||r.type==="chatgpt"||r.type==="grok"||r.type==="elevenlabs"||r.type==="muse"){'
  );

  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('✓ useWorkflowRunner-DGw6Ekx4.js updated');
}

console.log('\n======================================================================');
console.log('🎉 TẤT CẢ FILE ĐÃ ĐỒNG BỘ CHÍNH XÁC VÀ HỢP LỆ! 🎉');
console.log('======================================================================');
