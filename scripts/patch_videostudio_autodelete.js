const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(vsPath, 'utf8');

// 1. Add hook & state in VideoStudio
const targetHook = '[autoMergeTransition,setAutoMergeTransition]=l.useState(()=>{try{return window.localStorage.getItem("aiforge_auto_merge_queue_transition")||"none"}catch{return"none"}});';
if (!code.includes(targetHook)) {
  console.error('targetHook not found in VideoStudio-frcr8V6s.js');
  process.exit(1);
}

const replacementHook = targetHook + `
const [autoDelMins, setAutoDelMins] = l.useState(() => {
  try {
    const s = window.localStorage.getItem("aiforge_asset_auto_delete_minutes");
    return s ? Number(s) : 0;
  } catch { return 0; }
});
l.useEffect(() => {
  const api = window.aiforge?.assets || window.aivideo?.assets;
  api?.getAutoDeleteConfig?.().then(cfg => {
    if (cfg?.enabled && cfg?.minutes > 0) {
      setAutoDelMins(cfg.minutes);
      try { window.localStorage.setItem("aiforge_asset_auto_delete_minutes", String(cfg.minutes)); } catch (_) {}
    } else {
      setAutoDelMins(0);
      try { window.localStorage.setItem("aiforge_asset_auto_delete_minutes", "0"); } catch (_) {}
    }
  }).catch(() => {});
  const unsub = api?.onAutoDeleteChanged?.(cfg => {
    if (cfg?.enabled && cfg?.minutes > 0) {
      setAutoDelMins(cfg.minutes);
      try { window.localStorage.setItem("aiforge_asset_auto_delete_minutes", String(cfg.minutes)); } catch (_) {}
    } else {
      setAutoDelMins(0);
      try { window.localStorage.setItem("aiforge_asset_auto_delete_minutes", "0"); } catch (_) {}
    }
  });
  return () => unsub?.();
}, []);
const onChangeAutoDelMins = async (v) => {
  const mins = Number(v) || 0;
  setAutoDelMins(mins);
  try { window.localStorage.setItem("aiforge_asset_auto_delete_minutes", String(mins)); } catch (_) {}
  const api = window.aiforge?.assets || window.aivideo?.assets;
  try {
    await api?.setAutoDeleteConfig?.({ enabled: mins > 0, minutes: mins });
  } catch (_) {}
};
`;

code = code.replace(targetHook, replacementHook);

// 2. Add selector in toolbar right before openMergeModalButton
const targetToolbarBtn = 'e.jsxs("button",{type:"button","aria-label":P("videoStudio.openMergeModalButton"),';
if (!code.includes(targetToolbarBtn)) {
  console.error('targetToolbarBtn not found in VideoStudio-frcr8V6s.js');
  process.exit(1);
}

const autoDelToolbar = `e.jsxs("div",{className:\`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2 text-[11px] font-bold transition-all \${autoDelMins>0?"border-amber-400/50 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]":"border-white/10 bg-white/5 text-slate-400"}\`,children:[e.jsx("span",{className:\`h-2 w-2 rounded-full \${autoDelMins>0?"bg-amber-400 animate-pulse":"bg-slate-500"}\`}),e.jsx("span",{children:"⏱️ Tự xóa:"}),e.jsxs("select",{value:autoDelMins,onChange:p=>onChangeAutoDelMins(p.target.value),title:"Chế độ tự động xóa tài nguyên sau khi tạo để tiết kiệm ổ đĩa",className:"cursor-pointer bg-transparent text-[11px] font-bold text-inherit outline-none border-none pr-1",children:[e.jsx("option",{value:0,className:"bg-[#18152e] text-slate-300",children:"Tắt (Giữ vĩnh viễn)"}),e.jsx("option",{value:10,className:"bg-[#18152e] text-amber-300",children:"10 phút"}),e.jsx("option",{value:20,className:"bg-[#18152e] text-amber-300",children:"20 phút"}),e.jsx("option",{value:30,className:"bg-[#18152e] text-amber-300",children:"30 phút"}),e.jsx("option",{value:40,className:"bg-[#18152e] text-amber-300",children:"40 phút"}),e.jsx("option",{value:50,className:"bg-[#18152e] text-amber-300",children:"50 phút"}),e.jsx("option",{value:60,className:"bg-[#18152e] text-amber-300",children:"60 phút"})]})]}),` + targetToolbarBtn;

code = code.replace(targetToolbarBtn, autoDelToolbar);

fs.writeFileSync(vsPath + '.bak_before_autodelete', fs.readFileSync(vsPath));
fs.writeFileSync(vsPath, code, 'utf8');
console.log('Successfully patched VideoStudio-frcr8V6s.js with Auto-Delete controls!');
