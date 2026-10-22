const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add state & hooks in VideoFactoryStudio
const targetHook = 'function VideoFactoryStudio() {';
if (!code.includes(targetHook)) {
  console.error('targetHook not found in VideoFactoryStudio.js');
  process.exit(1);
}

const replacementHook = targetHook + `
  const [autoDelMins, setAutoDelMins] = React.useState(0);
  React.useEffect(() => {
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
  const onChangeAutoDel = async (v) => {
    const mins = Number(v) || 0;
    setAutoDelMins(mins);
    const api = window.aiforge?.assets || window.aivideo?.assets;
    try {
      await api?.setAutoDeleteConfig?.({ enabled: mins > 0, minutes: mins });
    } catch (_) {}
  };
`;

code = code.replace(targetHook, replacementHook);

// 2. Add Top Bar control
const targetTopControls = '// Right Top Controls: Niche Selector & Account Selector\n      React.createElement("div", { className: "flex items-center gap-2" },';
if (!code.includes(targetTopControls)) {
  console.error('targetTopControls not found in VideoFactoryStudio.js');
  process.exit(1);
}

const autoDelControl = `// Right Top Controls: Niche Selector & Account Selector
      React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement("div", {
          className: \`inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-[10px] font-bold transition-all \${autoDelMins > 0 ? 'border-amber-400/50 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'border-white/10 bg-white/5 text-gray-400'}\`
        },
          React.createElement("span", { className: \`w-1.5 h-1.5 rounded-full \${autoDelMins > 0 ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}\` }),
          React.createElement("span", null, "⏱️ Tự xóa:"),
          React.createElement("select", {
            value: autoDelMins,
            onChange: e => onChangeAutoDel(e.target.value),
            title: "Chế độ tự động xóa tài nguyên sau khi tạo để tiết kiệm ổ đĩa",
            className: "cursor-pointer bg-transparent text-[10px] font-bold text-inherit outline-none border-none pr-1"
          },
            React.createElement("option", { value: 0, className: "bg-[#18152e] text-gray-300" }, "Tắt (Giữ vĩnh viễn)"),
            React.createElement("option", { value: 10, className: "bg-[#18152e] text-amber-300" }, "10 phút"),
            React.createElement("option", { value: 20, className: "bg-[#18152e] text-amber-300" }, "20 phút"),
            React.createElement("option", { value: 30, className: "bg-[#18152e] text-amber-300" }, "30 phút"),
            React.createElement("option", { value: 40, className: "bg-[#18152e] text-amber-300" }, "40 phút"),
            React.createElement("option", { value: 50, className: "bg-[#18152e] text-amber-300" }, "50 phút"),
            React.createElement("option", { value: 60, className: "bg-[#18152e] text-amber-300" }, "60 phút")
          )
        ),`;

code = code.replace(targetTopControls, autoDelControl);

fs.writeFileSync(filePath + '.bak_before_autodelete', fs.readFileSync(filePath));
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully patched VideoFactoryStudio.js with Auto-Delete controls!');
