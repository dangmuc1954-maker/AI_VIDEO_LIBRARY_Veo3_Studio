const fs = require('fs');

const adminHtml = 'vercel_server/public/admin/index.html';
let content = fs.readFileSync(adminHtml, 'utf8');

// Backup
fs.writeFileSync(adminHtml + '.bak_before_custom_keys', content, 'utf8');
console.log('Backed up vercel_server/public/admin/index.html');

// 1. Thêm option Custom Days vào select modalPlanCode
const oldOptions = `<select id="modalPlanCode" onchange="onModalPlanChange()" class="glass-input text-xs w-full px-3 py-2 rounded-xl mt-1 text-white outline-none">
            <option value="trial" data-days="1" selected>🎁 Gói Trial Dùng Thử (1 Ngày - Cấp Khách Test)</option>
            <option value="basic" data-days="30">Gói Basic (30 Ngày - 1 Tháng)</option>
            <option value="silver" data-days="90">Gói Silver (90 Ngày - 3 Tháng)</option>
            <option value="gold" data-days="365">Gói Gold VIP (365 Ngày - 1 Năm)</option>
          </select>`;

const newOptions = `<select id="modalPlanCode" onchange="onModalPlanChange()" class="glass-input text-xs w-full px-3 py-2 rounded-xl mt-1 text-white outline-none">
            <option value="custom" data-days="1" selected>⚡ Gói Tùy Chọn Số Ngày (Cấp Thử Nghiệm / Tự Do Ngày)</option>
            <option value="trial" data-days="1">🎁 Gói Trial Dùng Thử Mặc Định (1 Ngày)</option>
            <option value="basic" data-days="30">Gói Basic (30 Ngày - 1 Tháng)</option>
            <option value="silver" data-days="90">Gói Silver (90 Ngày - 3 Tháng)</option>
            <option value="gold" data-days="365">Gói Gold VIP (365 Ngày - 1 Năm)</option>
          </select>`;

if (content.includes(oldOptions)) {
  content = content.replace(oldOptions, newOptions);
  console.log('1. Added custom plan option to modalPlanCode');
} else {
  throw new Error('Could not find oldOptions');
}

// 2. Thêm nút chọn nhanh số ngày dưới ô modalDurationDays
const oldDaysInput = `<input type="number" id="modalDurationDays" value="1" min="1" max="365" class="glass-input text-xs w-full px-3 py-2 rounded-xl mt-1 text-white outline-none" placeholder="Nhập số ngày (vd: 1, 30, 90, 365...)">`;

const newDaysInput = `<input type="number" id="modalDurationDays" value="1" min="1" max="3650" class="glass-input text-xs w-full px-3 py-2 rounded-xl mt-1 text-white outline-none font-semibold text-emerald-300" placeholder="Nhập số ngày tùy ý (vd: 1, 2, 3, 5, 7, 30, 90...)">
          <div class="flex items-center gap-1.5 mt-2 flex-wrap">
            <span class="text-[10px] text-slate-400">Chọn nhanh:</span>
            <button type="button" onclick="setQuickDays(1)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">1 Ngày</button>
            <button type="button" onclick="setQuickDays(2)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">2 Ngày</button>
            <button type="button" onclick="setQuickDays(3)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">3 Ngày</button>
            <button type="button" onclick="setQuickDays(7)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">7 Ngày</button>
            <button type="button" onclick="setQuickDays(30)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">30 Ngày</button>
            <button type="button" onclick="setQuickDays(90)" class="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition">90 Ngày</button>
          </div>`;

if (content.includes(oldDaysInput)) {
  content = content.replace(oldDaysInput, newDaysInput);
  console.log('2. Added quick day selector buttons');
} else {
  throw new Error('Could not find oldDaysInput');
}

// 3. Thêm hàm setQuickDays và cập nhật onModalPlanChange
const oldFuncs = `function onModalPlanChange() {
      const selectEl = document.getElementById('modalPlanCode');
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      const days = selectedOption?.dataset?.days || 30;
      document.getElementById('modalDurationDays').value = days;
    }`;

const newFuncs = `function setQuickDays(days) {
      document.getElementById('modalDurationDays').value = days;
      const selectEl = document.getElementById('modalPlanCode');
      if (days !== 30 && days !== 90 && days !== 365) {
        selectEl.value = 'custom';
      }
    }

    function onModalPlanChange() {
      const selectEl = document.getElementById('modalPlanCode');
      const selectedOption = selectEl.options[selectEl.selectedIndex];
      const days = selectedOption?.dataset?.days || 1;
      document.getElementById('modalDurationDays').value = days;
      if (selectEl.value === 'custom') {
        document.getElementById('modalDurationDays').focus();
      }
    }`;

if (content.includes(oldFuncs)) {
  content = content.replace(oldFuncs, newFuncs);
  console.log('3. Updated onModalPlanChange & added setQuickDays');
} else {
  throw new Error('Could not find oldFuncs');
}

// 4. Cập nhật getPlanBadge hỗ trợ custom
const oldGetPlanBadge = `      if (code === 'trial') {
        return \`<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold text-[10px] border border-sky-500/30">🎁 \${name}</span>\`;
      }`;

const newGetPlanBadge = `      if (code === 'trial') {
        return \`<span class="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold text-[10px] border border-sky-500/30">🎁 \${name}</span>\`;
      }
      if (code === 'custom') {
        return \`<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">⚡ \${name}</span>\`;
      }`;

if (content.includes(oldGetPlanBadge)) {
  content = content.replace(oldGetPlanBadge, newGetPlanBadge);
  console.log('4. Updated getPlanBadge with custom badge');
} else {
  throw new Error('Could not find oldGetPlanBadge');
}

fs.writeFileSync(adminHtml, content, 'utf8');
console.log('✅ Successfully updated vercel_server/public/admin/index.html!');
