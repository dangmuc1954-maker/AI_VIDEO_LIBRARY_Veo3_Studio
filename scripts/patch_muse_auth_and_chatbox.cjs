const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (!fs.existsSync(mainPath)) continue;

  let mainCode = fs.readFileSync(mainPath, 'utf8');

  // 1. Add Cookie Check before opening /thread/new in MuseVideoRuntime
  const oldPreNav = `    const win = new electron.BrowserWindow({
      show: false,
      width: 1280,
      height: 800,
      webPreferences: {
        partition: session.partition,
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      const wc = win.webContents;
      
      // 3. NAVIGATE DIRECTLY TO /thread/new (Crucial: prevents picking up old chats/videos!)
      tracker.updateProgress(15, "Đang tạo luồng hội thoại mới (thread/new)...");
      await win.loadURL("https://muse.ai/thread/new");`;

  const newPreNav = `    // Kiểm tra Cookie tài khoản Muse AI trước khi chạy
    try {
      const ses = electron.session.fromPartition(session.partition);
      const cookies = await ses.cookies.get({ domain: 'muse.ai' }).catch(() => []);
      logDebug("Muse cookies count", { count: cookies.length });
      if (cookies.length === 0) {
        throw new Error("Tài khoản Muse AI chưa đăng nhập! Vui lòng vào mục 'Tài khoản' trên thanh menu bên trái để đăng nhập tài khoản Muse AI của bạn trước khi tạo video.");
      }
    } catch(err) {
      if (err.message.includes("chưa đăng nhập")) throw err;
    }

    const win = new electron.BrowserWindow({
      show: false,
      width: 1280,
      height: 800,
      webPreferences: {
        partition: session.partition,
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      const wc = win.webContents;
      
      // 3. NAVIGATE DIRECTLY TO /thread/new
      tracker.updateProgress(15, "Đang tạo luồng hội thoại mới (thread/new)...");
      await win.loadURL("https://muse.ai/thread/new");`;

  if (mainCode.includes(oldPreNav)) {
    mainCode = mainCode.replace(oldPreNav, newPreNav);
    console.log('Added Muse cookie pre-check in', mainPath);
  }

  // 2. Improve findChatInput and friendly error message if chatbox not found
  const oldErrorFind = `if (!el) {
              return { success: false, error: "Không tìm thấy khung chat của Muse AI tại /thread/new" };
            }`;

  const newErrorFind = `if (!el) {
              const bodyText = (document.body?.innerText || '').toLowerCase();
              if (bodyText.includes('sign in') || bodyText.includes('log in') || bodyText.includes('đăng nhập') || document.querySelector('input[type="password"]')) {
                return { success: false, error: "Tài khoản Muse AI chưa đăng nhập hoặc phiên đã hết hạn. Vui lòng vào mục 'Tài khoản' ở menu bên trái để đăng nhập lại Muse AI!" };
              }
              return { success: false, error: "Không tìm thấy khung chat Muse AI (Có thể tài khoản chưa đăng nhập hoặc trang Muse AI đang cập nhật giao diện). Vui lòng vào mục 'Tài khoản' kiểm tra lại." };
            }`;

  if (mainCode.includes(oldErrorFind)) {
    mainCode = mainCode.replace(oldErrorFind, newErrorFind);
    console.log('Updated friendly chatbox error in', mainPath);
  }

  // 3. Relax rect.left < 250 in findChatInput
  const oldLeftFilter = 'const rect = el.getBoundingClientRect();\n                if (rect.left < 250) return false;';
  const newLeftFilter = 'const rect = el.getBoundingClientRect();\n                if (rect.left < 200 && rect.width < 120) return false;';
  if (mainCode.includes(oldLeftFilter)) {
    mainCode = mainCode.replace(oldLeftFilter, newLeftFilter);
    console.log('Relaxed left filter in', mainPath);
  }

  fs.writeFileSync(mainPath, mainCode, 'utf8');
  try {
    execSync(`node --check "${mainPath}"`);
    console.log('✅ Main syntax valid in', mainPath);
  } catch (e) {
    console.error('❌ Main syntax error:', e.message);
  }
}
