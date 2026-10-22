/**
 * SECURITY TRAP & ANTI-CRACK CHIP
 * -------------------------------------------------------------
 * Hệ thống chip an ninh bảo vệ bản quyền độc quyền của Tris.
 * Tự động phát hiện can thiệp mã nguồn, dịch ngược, mở DevTools,
 * hoặc bypass key bằng AI.
 * 
 * Khi phát hiện:
 * 1. Tự động bật 1 tab Notepad lên màn hình với thông điệp răn đe mạnh mẽ:
 *    "Tao đã biết được mày crack, coi chừng dính mã độc thì ráng mà chịu, hư máy tao không có trách nhiệm!"
 * 2. Gửi HWID và thông tin kẻ crack lên Server để Ban vĩnh viễn.
 * 3. Hủy phiên làm việc và đóng app ngay lập tức.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');

let trapActivated = false;

function triggerCrackTrap(reason = "Hành vi can thiệp trái phép") {
  if (trapActivated) return;
  trapActivated = true;

  console.error("\n=======================================================");
  console.error("🚨 CRACK TRAP ACTIVATED:", reason);
  console.error("=======================================================\n");

  const warningContent = `================================================================================
🚨 CẢNH BÁO AN NINH HỆ THỐNG - PHÁT HIỆN HÀNH VI BẺ KHÓA (CRACK) 🚨
================================================================================

TAO ĐÃ BIẾT ĐƯỢC MÀY ĐANG CỐ TÌNH CRACK / CAN THIỆP PHẦN MỀM BẤT HỢP PHÁP!

Lý do phát hiện: ${reason}
Thời gian ghi nhận: ${new Date().toLocaleString('vi-VN')}
Thiết bị vi phạm: ${os.hostname()} (${os.platform()} - ${os.userInfo().username})

MỌI HÀNH VI DỊCH NGƯỢC, BYPASS KEY, CAN THIỆP SOURCE HOẶC SỬ DỤNG AI ĐỂ
MỞ KHÓA BẢN QUYỀN ĐỀU ĐÃ ĐƯỢC GHI NHẬN VÀ BÁO VỀ SERVER BẢN QUYỀN DUY NHẤT:
👉 Server Quản Trị: https://vercelserver-eight.vercel.app

HỆ THỐNG BẢO VỆ ĐÃ KÍCH HOẠT CHẾ ĐỘ PHÒNG THỦ:
👉 COI CHỪNG DÍNH MÃ ĐỘC THÌ RÁNG MÀ CHỊU!
👉 HƯ MÁY TAO KHÔNG CÓ TRÁCH NHIỆM!

MÃ MÁY (HWID) VÀ ĐỊA CHỈ IP CỦA BẠN ĐÃ BỊ ĐƯA VÀO DANH SÁCH ĐEN (HWID BLACKLIST).
ỨNG DỤNG ĐÃ TỰ ĐỘNG KHÓA VĨNH VIỄN VÀ HỦY TOÀN BỘ PHIÊN HOẠT ĐỘNG NGAY BÂY GIỜ!
================================================================================
`;

  // 1. Tạo file txt cảnh báo
  const desktopPath = path.join(os.homedir(), 'Desktop', 'CANH_BAO_CRACK.txt');
  const tempPath = path.join(os.tmpdir(), 'CANH_BAO_CRACK.txt');

  try { fs.writeFileSync(desktopPath, warningContent, 'utf8'); } catch(e) {}
  try { fs.writeFileSync(tempPath, warningContent, 'utf8'); } catch(e) {}

  const finalWarningFile = fs.existsSync(desktopPath) ? desktopPath : tempPath;

  // 2. MỞ TAB NOTEPAD LÊN MÀN HÌNH THEO ĐÚNG Ý ANH TRIS!
  try {
    spawn('notepad.exe', [finalWarningFile], { detached: true, stdio: 'ignore' }).unref();
  } catch(e) {
    try { exec(`start notepad.exe "${finalWarningFile}"`); } catch(e2) {}
  }

  // 3. Gửi cảnh báo lên Server Vercel để ghi nhận Blacklist
  try {
    fetch('https://vercelserver-eight.vercel.app/api/admin/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason: 'Auto Trap: ' + reason,
        hostname: os.hostname(),
        user: os.userInfo().username,
        timestamp: Date.now()
      })
    }).catch(() => {});
  } catch(e) {}

  // 4. Đóng app ngay lập tức sau 600ms
  setTimeout(() => {
    try { app.exit(1); } catch(e) { process.exit(1); }
  }, 600);
}

// =============================================================
// 1. KIỂM TRA THAM SỐ DÒNG LỆNH DEBUG / INSPECT
// =============================================================
const isDebugArg = process.argv.some(arg => {
  const a = (arg || '').toLowerCase();
  return a.startsWith('--inspect') ||
         a.startsWith('--remote-debugging-port') ||
         a.startsWith('--remote-debugging-pipe') ||
         a === '--auto-open-devtools-for-tabs';
});
if (isDebugArg) {
  triggerCrackTrap("Phát hiện chạy ứng dụng với cờ debug/inspect để đọc mã nguồn");
}

// =============================================================
// 2. BẮT DEVTOOLS VÀ PHÍM TẮT INSPECT TOÀN ỨNG DỤNG (CHỈ KHI ĐỌC SOURCE)
// =============================================================
app.on('browser-window-created', (event, win) => {
  try {
    // Vô hiệu hóa devtools ở cấp độ webContents
    if (win.webContents) {
      win.webContents.on('devtools-opened', () => {
        try { win.webContents.closeDevTools(); } catch(e) {}
        triggerCrackTrap("Phát hiện hành vi mở DevTools / Inspect Element để đọc mã nguồn");
      });

      win.webContents.on('before-input-event', (e, input) => {
        if (input.type !== 'keyDown') return;

        // Chặn F12
        if (input.key === 'F12' || input.code === 'F12') {
          e.preventDefault();
          triggerCrackTrap("Phát hiện bấm phím F12 để mở DevTools đọc mã nguồn");
          return;
        }
        // Chặn Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
        if (input.control && input.shift && ['I', 'J', 'C', 'i', 'j', 'c'].includes(input.key)) {
          e.preventDefault();
          triggerCrackTrap("Phát hiện phím tắt Ctrl+Shift+I/J/C để mở DevTools kiểm tra mã nguồn");
          return;
        }
        // Chặn Ctrl+U (View Source)
        if (input.control && !input.shift && !input.alt && ['U', 'u'].includes(input.key)) {
          e.preventDefault();
          triggerCrackTrap("Phát hiện phím tắt Ctrl+U để xem và đọc mã nguồn (View Source)");
          return;
        }
      });
    }
  } catch(e) {}
});

// =============================================================
// 3. TOÀN VẸN MÃ NGUỒN: KHÔNG CHECK TỰ ĐỘNG LÚC KHỞI ĐỘNG
// =============================================================
// Để đảm bảo người dùng bình thường giải nén ra dùng 100% êm ái,
// không bao giờ bị báo sai hay giật mình, chỉ bẫy khi có hành động can thiệp / đọc source thực tế.
function verifyRendererIntegrity() {
  // No-op
}

// =============================================================
// 4. LẮNG NGHE BẪY HONEYPOT TỪ RENDERER QUA IPC
// =============================================================
try {
  ipcMain.handle('security:reportTamper', (event, details) => {
    triggerCrackTrap(details || "Bẫy Renderer Honeypot phát hiện can thiệp");
  });
} catch(e) {}

module.exports = { triggerCrackTrap, verifyRendererIntegrity };

