const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/out/renderer/assets/Assets-CjWyHlAk.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add auto-delete state & hooks to as()
const targetHooks = '[nt,Se]=a.useState(!1);';
if (!code.includes(targetHooks)) {
  console.error('targetHooks not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const replacementHooks = targetHooks + `
const [autoDelMins, setAutoDelMins] = a.useState(0);
const [nowTick, setNowTick] = a.useState(() => Date.now());
a.useEffect(() => {
  const t = setInterval(() => setNowTick(Date.now()), 10000);
  return () => clearInterval(t);
}, []);
a.useEffect(() => {
  const api = window.aiforge?.assets || window.aivideo?.assets;
  api?.getAutoDeleteConfig?.().then(cfg => {
    if (cfg?.enabled && cfg?.minutes > 0) setAutoDelMins(cfg.minutes);
    else setAutoDelMins(0);
  }).catch(() => {});
  const unsub = api?.onAutoDeleteChanged?.(cfg => {
    if (cfg?.enabled && cfg?.minutes > 0) setAutoDelMins(cfg.minutes);
    else setAutoDelMins(0);
  });
  return () => unsub?.();
}, []);
const handleAutoDelChange = async (mins) => {
  setAutoDelMins(mins);
  const api = window.aiforge?.assets || window.aivideo?.assets;
  try {
    await api?.setAutoDeleteConfig?.({ enabled: mins > 0, minutes: mins });
  } catch (err) {
    console.error("Lỗi cập nhật tự xóa:", err);
  }
};
`;

code = code.replace(targetHooks, replacementHooks);

// 2. Add Auto-Delete dropdown in toolbar before sort dropdown
const targetSort = 'e.jsx(ut,{value:T,onChange:t=>le(t),ariaLabel:"Sort assets",';
if (!code.includes(targetSort)) {
  console.error('targetSort not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const autoDelDropdown = `e.jsx(ut,{value:String(autoDelMins),onChange:t=>handleAutoDelChange(Number(t)),ariaLabel:"Tự động xóa tài nguyên",options:[{value:"0",label:"Tự xóa: Tắt (Giữ vĩnh viễn)"},{value:"10",label:"⏱️ Tự xóa: 10 phút"},{value:"20",label:"⏱️ Tự xóa: 20 phút"},{value:"30",label:"⏱️ Tự xóa: 30 phút"},{value:"40",label:"⏱️ Tự xóa: 40 phút"},{value:"50",label:"⏱️ Tự xóa: 50 phút"},{value:"60",label:"⏱️ Tự xóa: 60 phút"}],triggerClassName:autoDelMins>0?"h-8.5 w-44 rounded-xl border-amber-400/50 bg-amber-500/15 font-bold text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:border-amber-400":"h-8.5 w-38 rounded-xl border-white/8 bg-[#0c0a19]/80 font-semibold text-text-secondary hover:border-white/15 hover:text-white"}),` + targetSort;

code = code.replace(targetSort, autoDelDropdown);

// 3. Add Banner right inside the toolbar container
const targetContainer = 'className:"shrink-0 px-5 pt-3.5 pb-2 space-y-2.5",children:[';
if (!code.includes(targetContainer)) {
  console.error('targetContainer not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const autoDelBanner = targetContainer + `autoDelMins>0&&e.jsxs("div",{role:"status",className:"flex items-center justify-between gap-3 rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-[#1a1426] to-[#120f24] px-4 py-2 text-xs text-amber-200 shadow-md",children:[e.jsxs("div",{className:"flex min-w-0 items-center gap-2.5",children:[e.jsx("span",{className:"h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse shrink-0 shadow-[0_0_8px_#f59e0b]"}),e.jsxs("span",{className:"truncate leading-relaxed",children:[e.jsx("strong",{className:"text-amber-300 font-extrabold uppercase",children:\`⚡ TỰ ĐỘNG XÓA TÀI NGUYÊN: \${autoDelMins} PHÚT (ĐANG BẬT): \`}),\`Các tài nguyên tạo sau khi bật sẽ tự động xóa vĩnh viễn sau \${autoDelMins}p để tiết kiệm ổ đĩa. Quý khách vui lòng tải về máy video cần lưu trữ.\`]})]}),e.jsx("button",{type:"button",onClick:()=>handleAutoDelChange(0),className:"shrink-0 cursor-pointer rounded-lg border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition-colors hover:bg-amber-400/25 hover:text-white",children:"Tắt tự xóa"})]}),`;

code = code.replace(targetContainer, autoDelBanner);

// 4. Add countdown tag & cancel button on asset cards
const targetVideoPlayBadge = 't.type==="video"&&e.jsx("span",{className:"pointer-events-none absolute bottom-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-white shadow",children:e.jsx(Qe,{size:10,fill:"currentColor"})}),';
if (!code.includes(targetVideoPlayBadge)) {
  console.error('targetVideoPlayBadge not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const autoDelCardBadge = targetVideoPlayBadge + `t.autoDeleteAt&&e.jsxs("span",{className:"pointer-events-none absolute right-2 bottom-2 z-10 flex select-none items-center gap-1 rounded border border-amber-400/40 bg-black/85 px-1.5 py-0.5 text-[8.5px] font-bold text-amber-300 shadow backdrop-blur-sm",children:["⏱️ ",Math.max(1,Math.ceil((t.autoDeleteAt-nowTick)/60000)),"p"]}),`;

code = code.replace(targetVideoPlayBadge, autoDelCardBadge);

// 5. Add cancel auto-delete button to hover actions
const targetHoverDel = 'e.jsx("button",{type:"button",title:s("assets.deleteAsset"),';
if (!code.includes(targetHoverDel)) {
  console.error('targetHoverDel not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const cancelAutoDelBtn = `t.autoDeleteAt&&e.jsx("button",{type:"button",title:"Giữ lại vĩnh viễn (Hủy tự động xóa)",onClick:async r=>{r.stopPropagation();try{const api=window.aiforge?.assets||window.aivideo?.assets;await api?.cancelAssetAutoDelete?.(t.id);delete t.autoDeleteAt;delete t.autoDeleteMinutes;O("Đã hủy tự động xóa! Tài nguyên này sẽ được lưu vĩnh viễn.");}catch(_){}},"aria-label":\`Giữ vĩnh viễn \${t.name}\`,className:"flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/80 text-black font-bold shadow transition-transform hover:scale-105 hover:bg-amber-400 active:scale-95",children:"🛡️"}),` + targetHoverDel;

code = code.replace(targetHoverDel, cancelAutoDelBtn);

// 6. In Preview Modal St, add autoDelete info
const targetPinned = 'e.jsxs(I,{label:o("assets.pinnedStatus"),children:[e.jsx("span",{className:"font-bold text-[#d9f99d]",children:s.pinnedAsReference?o("assets.pinnedRef"):o("assets.notPinned")})," · ",e.jsx("span",{className:"text-text-secondary",children:o("assets.flowBindings",{count:(s.googleFlowBindings||[]).filter(l=>l.status==="active").length})})]})';
if (!code.includes(targetPinned)) {
  console.error('targetPinned not found in Assets-CjWyHlAk.js');
  process.exit(1);
}

const autoDelModalInfo = targetPinned + `,s.autoDeleteAt&&e.jsxs(I,{label:"Tự động xóa tài nguyên",children:[e.jsxs("div",{className:"flex flex-col gap-1 w-full py-0.5",children:[e.jsxs("div",{className:"flex items-center justify-between text-xs",children:[e.jsxs("span",{className:"font-bold text-amber-400",children:["⏱️ Tự xóa sau ",s.autoDeleteMinutes||10," phút"]}),e.jsx("span",{className:"text-[10px] font-mono text-amber-200/70",children:\`Hạn: \${new Date(s.autoDeleteAt).toLocaleTimeString()}\`})]}),e.jsx("button",{type:"button",onClick:async()=>{try{const api=window.aiforge?.assets||window.aivideo?.assets;await api?.cancelAssetAutoDelete?.(s.id);delete s.autoDeleteAt;delete s.autoDeleteMinutes;b?.("Đã hủy tự động xóa. Tài nguyên này sẽ được lưu giữ vĩnh viễn!");}catch(_){}},className:"mt-1 flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/15 py-1 text-[11px] font-bold text-amber-300 transition-colors hover:bg-amber-400/25",children:"🛡️ Hủy tự xóa (Giữ vĩnh viễn)"})]})]})`;

code = code.replace(targetPinned, autoDelModalInfo);

fs.writeFileSync(filePath + '.bak_before_autodelete', fs.readFileSync(filePath));
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched Assets-CjWyHlAk.js with Auto-Delete UI!');
