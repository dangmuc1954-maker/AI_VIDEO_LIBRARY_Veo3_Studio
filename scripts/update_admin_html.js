const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../vercel_server/public/admin/index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Status badge in renderMachinesTable
const oldBadgeTarget = `        if (m.status === 'banned') {
          statusBadge = '<span class="bg-rose-900/30 text-rose-300 border border-rose-700/30 text-xs px-2.5 py-1 rounded-full font-semibold">⛔ Đã Khóa (Banned)</span>';
        } else if (m.status === 'expired' || m.isExpired) {`;

const newBadgeTarget = `        if (m.status === 'banned') {
          statusBadge = '<span class="bg-rose-900/30 text-rose-300 border border-rose-700/30 text-xs px-2.5 py-1 rounded-full font-semibold">⛔ Đã Khóa (Banned)</span>';
        } else if (m.status === 'unlinked') {
          statusBadge = '<span class="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-semibold">🔄 Đã Đổi Máy (Unlinked)</span>';
        } else if (m.status === 'expired' || m.isExpired) {`;

if (content.includes(oldBadgeTarget)) {
  content = content.replace(oldBadgeTarget, newBadgeTarget);
  console.log('[1] Updated status badge for unlinked');
}

// 2. Add unlinked to filter select
const oldSelect = `<option value="banned">⛔ Đã khóa (Banned)</option>`;
const newSelect = `<option value="banned">⛔ Đã khóa (Banned)</option>\n            <option value="unlinked">🔄 Đã đổi máy (Unlinked)</option>`;

if (content.includes(oldSelect)) {
  content = content.replace(oldSelect, newSelect);
  console.log('[2] Updated filter select dropdown');
}

// 3. Confirm prompt for resetMachineHwid
const oldResetConfirm = `if (!confirm(\`Xác nhận gỡ liên kết máy tính HWID:\\n\${machineCode}\\nkhỏi bản quyền \${licenseKey || ''}?\\n👉 Khách hàng sẽ dùng key này kích hoạt trên máy mới được ngay!\`)) return;`;
const newResetConfirm = `if (!confirm(\`Xác nhận ĐỔI MÁY cho thiết bị HWID:\\n\${machineCode}\\n\\n👉 Gói cước trên máy này sẽ bị NGỪNG NGAY LẬP TỨC và XÓA KEY khỏi máy!\\n👉 Key \${licenseKey || ''} sẽ được giải phóng để khách kích hoạt trên máy mới ngay lập tức!\`)) return;`;

if (content.includes(oldResetConfirm)) {
  content = content.replace(oldResetConfirm, newResetConfirm);
  console.log('[3] Updated reset confirmation text');
}

// 4. Prompt for banMachine
const oldBanPrompt = `const reason = prompt(\`Nhập lý do khóa máy tính HWID (\${machineCode}):\`, 'Vi phạm chính sách / Khóa máy chống gian lận');`;
const newBanPrompt = `const reason = prompt(\`Nhập lý do KHÓA VĨNH VIỄN máy tính HWID (\${machineCode}):\\n👉 Thiết bị này sẽ bị CẤM 100%, không thể kích hoạt bất kỳ key nào hoặc sử dụng ứng dụng nữa!\`, 'Vi phạm chính sách / Khóa máy gian lận');`;

if (content.includes(oldBanPrompt)) {
  content = content.replace(oldBanPrompt, newBanPrompt);
  console.log('[4] Updated ban prompt text');
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Admin HTML updated successfully!');
