const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. Inject the window.__openMuseCookieModal function at the end
const modalHelper = `
if (typeof window !== 'undefined' && !window.__openMuseCookieModal) {
  window.__openMuseCookieModal = function() {
    const existing = document.getElementById('muse-cookie-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'muse-cookie-modal';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;font-family:sans-serif;';

    const card = document.createElement('div');
    card.style.cssText = 'background:#131525;border:1px solid rgba(245,158,11,0.3);box-shadow:0 20px 50px rgba(0,0,0,0.7);border-radius:16px;width:540px;max-width:100%;padding:24px;display:flex;flex-direction:column;gap:16px;color:#fff;';

    card.innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:24px;">🍪</span>
          <div>
            <h3 style="margin:0;font-size:16px;font-weight:700;color:#fde68a;">Nhập Cookie JSON Muse AI</h3>
            <p style="margin:2px 0 0;font-size:12px;color:#94a3b8;">Hỗ trợ định dạng Cookie-Editor để chạy đa luồng siêu tốc</p>
          </div>
        </div>
        <button id="muse-cookie-close" style="background:none;border:none;color:#94a3b8;font-size:20px;cursor:pointer;padding:4px 8px;">✕</button>
      </div>

      <div style="font-size:12px;color:#cbd5e1;line-height:1.5;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);padding:10px 14px;border-radius:10px;">
        💡 <strong>Cách lấy Cookie:</strong> Cài tiện ích <em>Cookie-Editor</em> trên Chrome, vào trang <code>muse.ai</code>, bấm <strong>Export &rarr; JSON</strong> rồi dán vào ô bên dưới.
      </div>

      <textarea id="muse-cookie-input" placeholder='[ { "name": "...", "value": "...", "domain": ".muse.ai" } ]' style="width:100%;height:140px;background:#0b0c16;border:1px solid #2e3450;border-radius:10px;padding:12px;color:#34d399;font-family:monospace;font-size:11px;outline:none;resize:vertical;box-sizing:border-box;"></textarea>

      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button id="muse-cookie-cancel" style="background:#1e2337;border:1px solid #333c5e;color:#cbd5e1;padding:8px 16px;border-radius:8px;font-size:13px;cursor:pointer;">Hủy</button>
        <button id="muse-cookie-save" style="background:linear-gradient(135deg,#f59e0b,#d97706);border:none;color:#fff;font-weight:700;padding:8px 18px;border-radius:8px;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;">💾 Lưu & Kích Hoạt Cookie</button>
      </div>
    \`;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    card.querySelector('#muse-cookie-close').onclick = close;
    card.querySelector('#muse-cookie-cancel').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    card.querySelector('#muse-cookie-save').onclick = async () => {
      const val = card.querySelector('#muse-cookie-input').value.trim();
      if (!val) {
        alert('Vui lòng dán mã JSON Cookie trước khi lưu!');
        return;
      }
      try {
        const btn = card.querySelector('#muse-cookie-save');
        btn.innerText = 'Đang nạp cookie...';
        btn.disabled = true;
        const res = await window.aiforge.browser.importCookies({ cookiesJson: val });
        if (res && res.success) {
          alert('🎉 ' + (res.message || 'Đã nạp Cookie thành công! Tài khoản Muse AI đã sẵn sàng.'));
          close();
        } else {
          alert('❌ Lỗi: ' + (res?.error || 'Không thể nạp cookie'));
          btn.innerText = '💾 Lưu & Kích Hoạt Cookie';
          btn.disabled = false;
        }
      } catch (err) {
        alert('❌ Lỗi: ' + err.message);
      }
    };
  };
}
`;

if (!code.includes('__openMuseCookieModal')) {
  code += '\n' + modalHelper;
  console.log('✅ Đã đính kèm modal helper __openMuseCookieModal!');
}

// 2. Add Cookie JSON button next to the account dropdown
const anchor = 'e.jsx(Qe,{value:o.account,options:y,onChange:g=>S(o.id,{account:g}),className:"min-w-[120px] h-8 justify-between"})';
const replacement = 'e.jsx(Qe,{value:o.account,options:y,onChange:g=>S(o.id,{account:g}),className:"min-w-[120px] h-8 justify-between"}),(o.provider==="Muse AI"||o.provider==="muse ai")&&e.jsx("button",{type:"button",onClick:()=>window.__openMuseCookieModal&&window.__openMuseCookieModal(),className:"ml-2 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm",children:[e.jsx("span",{children:"🍪"}),e.jsx("span",{children:"Cookie JSON"})]})';

if (code.includes(anchor) && !code.includes('window.__openMuseCookieModal&&window.__openMuseCookieModal()')) {
  code = code.replace(anchor, replacement);
  console.log('✅ Đã thêm nút [🍪 Cookie JSON] bên cạnh chọn tài khoản Muse AI!');
}

fs.writeFileSync(targetPath, code, 'utf8');
console.log('✅ Hoàn tất cập nhật VideoStudio-frcr8V6s.js!');
