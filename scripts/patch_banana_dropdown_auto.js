const fs = require('fs');
const path = require('path');

console.log('=== THÊM OPTION "TỰ ĐỘNG CHIA ĐỀU ACC" CHO DROPDOWN BANANA TRONG XƯỞNG ===');

const file = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Thêm option auto vào Dropdown 1
const oldDrop1 = `          accounts.filter(a => a.providerId === 'banana').length > 0 ? React.createElement("select", {
            value: selectedBananaAccountId,
            onChange: (e) => handleSelectBananaAccount(e.target.value),
            className: "bg-transparent text-[11px] font-bold text-amber-300 outline-none cursor-pointer max-w-[130px] truncate"
          },
            accounts.filter(a => a.providerId === 'banana').map(acc =>`;

const newDrop1 = `          accounts.filter(a => a.providerId === 'banana').length > 0 ? React.createElement("select", {
            value: selectedBananaAccountId,
            onChange: (e) => handleSelectBananaAccount(e.target.value),
            className: "bg-transparent text-[11px] font-bold text-amber-300 outline-none cursor-pointer max-w-[140px] truncate"
          },
            React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, "🔄 Tự động chia đều Acc"),
            accounts.filter(a => a.providerId === 'banana').map(acc =>`;

if (code.includes(oldDrop1)) {
  code = code.replace(oldDrop1, newDrop1);
  console.log('[1/3] Dropdown 1 (Top Bar): Đã thêm "🔄 Tự động chia đều Acc"!');
} else {
  console.log('[1/3] Dropdown 1: Không khớp pattern, kiểm tra lại.');
}

// 2. Thêm option auto vào Dropdown 2
const oldDrop2 = `          accounts.filter(a => a.providerId === 'banana').length > 0 ? React.createElement("select", {
            value: selectedBananaAccountId,
            onChange: (e) => handleSelectBananaAccount(e.target.value),
            className: "bg-transparent text-[11px] font-bold text-amber-300 outline-none cursor-pointer max-w-[140px] truncate"
          },
            accounts.filter(a => a.providerId === 'banana').map(acc =>`;

const newDrop2 = `          accounts.filter(a => a.providerId === 'banana').length > 0 ? React.createElement("select", {
            value: selectedBananaAccountId,
            onChange: (e) => handleSelectBananaAccount(e.target.value),
            className: "bg-transparent text-[11px] font-bold text-amber-300 outline-none cursor-pointer max-w-[140px] truncate"
          },
            React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, "🔄 Tự động chia đều Acc"),
            accounts.filter(a => a.providerId === 'banana').map(acc =>`;

if (code.includes(oldDrop2)) {
  code = code.replace(oldDrop2, newDrop2);
  console.log('[2/3] Dropdown 2 (Header View): Đã thêm "🔄 Tự động chia đều Acc"!');
} else {
  console.log('[2/3] Dropdown 2: Không khớp pattern, kiểm tra lại.');
}

// 3. Đặt default state thành 'auto'
const oldState = `  const [selectedBananaAccountId, setSelectedBananaAccountId] = React.useState(() => {
    try { return localStorage.getItem('aivideo_factory_banana_account') || ''; } catch(e) { return ''; }
  });`;

const newState = `  const [selectedBananaAccountId, setSelectedBananaAccountId] = React.useState(() => {
    try { return localStorage.getItem('aivideo_factory_banana_account') || 'auto'; } catch(e) { return 'auto'; }
  });`;

if (code.includes(oldState)) {
  code = code.replace(oldState, newState);
  console.log('[3/3] useState: Đã đặt mặc định selectedBananaAccountId là "auto"!');
}

fs.writeFileSync(file, code, 'utf8');
console.log('=== HOÀN TẤT CẬP NHẬT DROPDOWN BANANA TRONG XƯỞNG ===');
