const fs = require('fs');
const path = require('path');

const uiFilePath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(uiFilePath, 'utf8');

// Backup
const bakPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js.before_veo_ui_patch.bak');
if (!fs.existsSync(bakPath)) {
  fs.writeFileSync(bakPath, code, 'utf8');
  console.log('Created UI backup:', bakPath);
}

// 1. PATCH applySelectedPromptSettings in store
const targetStore = `c={provider:n.provider,mode:n.mode,ratio:n.ratio,count:n.count,duration:n.duration,model:n.model,motion:n.motion,account:n.account,negativePrompt:n.negativePrompt,referenceAssetIds:n.referenceAssetIds||[]}`;
const replacementStore = `c={provider:n.provider,mode:n.mode,ratio:n.ratio,count:n.count,duration:n.duration,model:n.model,resolution:n.resolution||"720p",autoUpscale:n.autoUpscale===!0,autoRemoveWatermark:n.autoRemoveWatermark===!0,motion:n.motion,account:n.account,negativePrompt:n.negativePrompt,referenceAssetIds:n.referenceAssetIds||[]}`;

if (!code.includes(targetStore)) {
  console.error('ERROR: Could not find targetStore in VideoStudio-BZY_1pM8.js');
  process.exit(1);
}
code = code.replace(targetStore, replacementStore);
console.log('Successfully patched applySelectedPromptSettings in store!');

// 2. PATCH Prompt Inspector cn to add resolution, autoUpscale, autoRemoveWatermark & apply buttons
const targetInspectorButtons = `e.jsxs("div",{className:"flex items-center gap-2 mt-2.5",children:[e.jsx("button",{onClick:()=>g("checked"),className:"flex-1 h-8 rounded-lg border border-white/10 bg-[#130f2440] hover:bg-white/5 text-xs font-semibold text-text-secondary hover:text-white transition-all focus:outline-none cursor-pointer",children:"Apply checked"}),e.jsx("button",{onClick:()=>g("all"),className:"flex-1 h-8 rounded-lg border border-white/10 bg-[#130f2440] hover:bg-white/5 text-xs font-semibold text-text-secondary hover:text-white transition-all focus:outline-none cursor-pointer",children:"Apply to all"})]})`;

const replacementInspectorButtons = `n.provider==="Veo3"&&e.jsx(Ne,{value:n.resolution||"720p",options:["720p"],onChange:p=>R(n.id,{resolution:p}),className:"w-full h-8 justify-between bg-[#130f2480] border-white/10 text-xs text-text-primary rounded-lg mt-1"}),
n.provider==="Veo3"&&e.jsxs("div",{
  onClick:()=>R(n.id,{autoUpscale:n.autoUpscale!==!0}),
  className:\`flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left transition-all cursor-pointer select-none \${n.autoUpscale?"border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.12)]":"border-white/10 bg-[#130f2460] hover:border-white/20 hover:bg-[#130f2490]"}\`,
  children:[
    e.jsxs("div",{
      className:"min-w-0 flex-1",
      children:[
        e.jsxs("div",{
          className:"flex items-center gap-1.5",
          children:[
            e.jsx("span",{className:\`text-xs font-semibold \${n.autoUpscale?"text-emerald-200":"text-slate-200"}\`,children:"Upscale tự động"}),
            e.jsx("span",{className:"px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30",children:"⚡ Pro 1080p"})
          ]
        }),
        e.jsx("span",{className:"mt-0.5 block text-[10px] leading-4 text-slate-400",children:"Video 720p sẽ nâng kết quả lên 1080p."})
      ]
    }),
    e.jsx("div",{
      className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out \${n.autoUpscale?"bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]":"bg-white/20"}\`,
      children:e.jsx("span",{
        className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out \${n.autoUpscale?"translate-x-4":"translate-x-0"}\`
      })
    })
  ]
}),
n.provider==="Veo3"&&e.jsxs("div",{
  onClick:()=>R(n.id,{autoRemoveWatermark:n.autoRemoveWatermark!==!0}),
  className:\`flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left transition-all cursor-pointer select-none \${n.autoRemoveWatermark?"border-indigo-500/40 bg-indigo-500/10 shadow-[0_0_12px_rgba(99,102,241,0.12)]":"border-white/10 bg-[#130f2460] hover:border-white/20 hover:bg-[#130f2490]"}\`,
  children:[
    e.jsxs("div",{
      className:"min-w-0 flex-1",
      children:[
        e.jsxs("div",{
          className:"flex items-center gap-1.5",
          children:[
            e.jsx("span",{className:\`text-xs font-semibold \${n.autoRemoveWatermark?"text-indigo-200":"text-slate-200"}\`,children:"Xóa watermark (beta)"}),
            e.jsx("span",{className:"px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30",children:"⚡ Pro | AI Del"})
          ]
        }),
        e.jsx("span",{className:"mt-0.5 block text-[10px] leading-4 text-slate-400",children:"Video được xóa watermark có thể giảm chi tiết, giữ lại âm thanh gốc."})
      ]
    }),
    e.jsx("div",{
      className:\`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out \${n.autoRemoveWatermark?"bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]":"bg-white/20"}\`,
      children:e.jsx("span",{
        className:\`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out \${n.autoRemoveWatermark?"translate-x-4":"translate-x-0"}\`
      })
    })
  ]
}),
e.jsxs("div",{
  className:"grid grid-cols-2 gap-2 mt-2.5 pt-2.5 border-t border-white/10",
  children:[
    e.jsxs("button",{
      type:"button",
      onClick:()=>g("checked"),
      className:"h-8 rounded-lg border border-white/10 bg-[#130f2480] hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 shadow-sm",
      children:[
        e.jsx("span",{className:"text-[#86efac] font-bold",children:"✓"}),
        e.jsx("span",{children:"Áp dụng cho mục chọn"})
      ]
    }),
    e.jsxs("button",{
      type:"button",
      onClick:()=>g("all"),
      className:"h-8 rounded-lg border border-white/10 bg-[#130f2480] hover:bg-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 shadow-sm",
      children:[
        e.jsx("span",{className:"text-[#86efac] font-bold",children:"✓"}),
        e.jsx("span",{children:"Áp dụng cho tất cả"})
      ]
    })
  ]
})`;

if (!code.includes(targetInspectorButtons)) {
  console.error('ERROR: Could not find targetInspectorButtons in VideoStudio-BZY_1pM8.js');
  process.exit(1);
}
code = code.replace(targetInspectorButtons, replacementInspectorButtons);
console.log('Successfully patched Prompt Inspector cn with controls & apply buttons!');

// 3. PATCH Job payload builder
const targetPayload = `payload:{promptId:f.id,prompt:f.prompt,ratio:f.ratio,mode:f.mode,flowVideoMode:De,duration:f.duration,model:f.model,creditCost:Re(f.model,f.duration)`;
const replacementPayload = `payload:{promptId:f.id,prompt:f.prompt,ratio:f.ratio,mode:f.mode,flowVideoMode:De,duration:f.duration,model:f.model,resolution:f.resolution||"720p",autoUpscale:f.autoUpscale===!0,autoRemoveWatermark:f.autoRemoveWatermark===!0,removeWatermark:f.autoRemoveWatermark===!0,creditCost:Re(f.model,f.duration)`;

if (!code.includes(targetPayload)) {
  console.error('ERROR: Could not find targetPayload in VideoStudio-BZY_1pM8.js');
  process.exit(1);
}
code = code.replace(targetPayload, replacementPayload);
console.log('Successfully patched job payload builder with resolution, autoUpscale & autoRemoveWatermark!');

fs.writeFileSync(uiFilePath, code, 'utf8');
console.log('All UI patches applied cleanly to VideoStudio-BZY_1pM8.js!');
