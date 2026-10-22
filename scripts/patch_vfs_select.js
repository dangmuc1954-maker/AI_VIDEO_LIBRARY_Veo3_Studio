const fs = require('fs');
const targetFile = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(targetFile, 'utf8');

const target = 'return vAccs.length > 0 ? React.createElement("select", {\n              value: selectedVideoAccountId,\n              onChange: (e) => handleSelectVideoAccount(e.target.value),\n              className: `bg-transparent text-[11px] font-bold outline-none cursor-pointer max-w-[140px] truncate ${isMuse ? \'text-purple-300\' : \'text-cyan-300\'}`\n            },\n              vAccs.map(acc =>';

const replacement = 'return vAccs.length > 0 ? React.createElement("select", {\n              value: selectedVideoAccountId,\n              onChange: (e) => handleSelectVideoAccount(e.target.value),\n              className: `bg-transparent text-[11px] font-bold outline-none cursor-pointer max-w-[140px] truncate ${isMuse ? \'text-purple-300\' : \'text-cyan-300\'}`\n            },\n              React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, isMuse ? "⚡ Tự động đổi Acc" : "🔄 Tự động chia đều Acc"),\n              vAccs.map(acc =>';

if (!content.includes(target)) {
  console.error('Target not found!');
  process.exit(1);
}
content = content.replace(target, replacement);
fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully added auto option to Main Factory select!');
