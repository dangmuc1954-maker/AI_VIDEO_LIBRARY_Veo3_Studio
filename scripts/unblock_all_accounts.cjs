const fs = require('fs');
const path = require('path');

console.log('=== [GỠ BỎ HOÀN TOÀN CƠ CHẾ KHÓA TÀI KHOẢN KHI DÍNH COOLDOWN] ===');

// 1. SỬA VIDEO STUDIO: VideoStudio-frcr8V6s.js
const videoStudioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let vsContent = fs.readFileSync(videoStudioPath, 'utf8');

const ceTarget = 'Ce=l.useMemo(()=>at.filter(r=>ss(r)&&!rs(r)),[at])';
const ceFix = 'Ce=l.useMemo(()=>{const v=at.filter(r=>ss(r)&&!rs(r));return v.length>0?v:at.filter(r=>ss(r))},[at])';

if (vsContent.includes(ceTarget)) {
  vsContent = vsContent.replace(ceTarget, ceFix);
  console.log('✅ Đã sửa Ce trong VideoStudio: Không bao giờ làm rỗng danh sách tài khoản Veo 3 khi có tài khoản đã đăng nhập');
} else {
  console.log('⚠️ ceTarget not found in VideoStudio');
}

const ieTarget = 'Ie=l.useMemo(()=>xe.filter(r=>ss(r)&&!rs(r)),[xe])';
const ieFix = 'Ie=l.useMemo(()=>{const v=xe.filter(r=>ss(r)&&!rs(r));return v.length>0?v:xe.filter(r=>ss(r))},[xe])';

if (vsContent.includes(ieTarget)) {
  vsContent = vsContent.replace(ieTarget, ieFix);
  console.log('✅ Đã sửa Ie trong VideoStudio: Không bao giờ làm rỗng danh sách tài khoản Grok');
}

fs.writeFileSync(videoStudioPath, vsContent, 'utf8');

// 2. SỬA IMAGE STUDIO: ImageStudio-4nmpUX3j.js
const imgStudioPath = path.resolve(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let imgContent = fs.readFileSync(imgStudioPath, 'utf8');

const ztTarget = 'Zt=p.useMemo(()=>ot.filter(t=>Tt(t)&&!Dt(t)),[ot])';
const ztFix = 'Zt=p.useMemo(()=>{const v=ot.filter(t=>Tt(t)&&!Dt(t));return v.length>0?v:ot.filter(t=>Tt(t))},[ot])';

if (imgContent.includes(ztTarget)) {
  imgContent = imgContent.replace(ztTarget, ztFix);
  console.log('✅ Đã sửa Zt trong ImageStudio: Không bao giờ làm rỗng danh sách Banana khi có tài khoản đăng nhập');
} else {
  console.log('⚠️ ztTarget not found in ImageStudio');
}

fs.writeFileSync(imgStudioPath, imgContent, 'utf8');

// 3. SỬA MAIN: main/index.js (Giảm cooldown của NETWORK và CHALLENGE về 0 hoặc tối đa 3s)
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const cdTarget = 'getAccountCooldownMs(e){if(e.code==="RATE_LIMITED")return 6e4;if(e.code==="NETWORK")return 3e3+Math.floor(Math.random()*2001);if(e.code==="QUOTA_EXCEEDED")return 15*6e4}';
const cdFix = 'getAccountCooldownMs(e){if(e.code==="RATE_LIMITED")return 1e4;if(e.code==="NETWORK")return 1e3;if(e.code==="QUOTA_EXCEEDED")return 15*6e4;return 1e3}';

if (mainContent.includes(cdTarget)) {
  mainContent = mainContent.replace(cdTarget, cdFix);
  console.log('✅ Đã rút ngắn tối đa thời gian cooldown của lỗi tạm thời');
}

// 4. XÓA SẠCH COOLDOWN TRONG TẤT CẢ FILE BROWSER-SESSIONS.JSON
try {
  const appData = process.env.APPDATA;
  const dirs = ['AI_VIDEO_LIBRARY_DATA', 'AI VIDEO LIBRARY', 'ai-video-library', 'aiforge-studio'];
  for (const d of dirs) {
    const sessionFile = path.join(appData, d, 'browser-sessions.json');
    if (fs.existsSync(sessionFile)) {
      const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      const list = Array.isArray(data) ? data : (data.sessions || []);
      for (const s of list) {
        if (s.diagnostics) {
          delete s.diagnostics.cooldownUntil;
          delete s.diagnostics.cooldownReason;
          delete s.diagnostics.lastProviderErrorCode;
          delete s.diagnostics.lastError;
          s.healthScore = 100;
          s.healthLabel = "Excellent";
        }
      }
      fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2), 'utf8');
      console.log('✅ Đã xóa sạch cooldown trong:', d);
    }
  }
} catch(e) {
  console.warn('Lỗi dọn dẹp sessions:', e.message);
}

fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('🎉 Hoàn tất gỡ bỏ rào cản tài khoản bị ẩn/khóa!');
