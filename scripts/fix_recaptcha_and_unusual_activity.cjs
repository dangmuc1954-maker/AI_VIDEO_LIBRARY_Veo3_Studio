const fs = require('fs');
const path = require('path');

console.log('=== [FIX UNUSUAL ACTIVITY & RECAPTCHA TELEMETRY] ===');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. KHÔNG CHẶN ẢNH / MEDIA CHO GOOGLE FLOW (VEO 3 & BANANA) ĐỂ RECAPTCHA ENTERPRISE KHÔNG BỊ HẠ ĐIỂM BOT
const blockTarget = 'if(e.isHeadlessMode&&(o.resourceType==="image"||o.resourceType==="media"))return n({cancel:!0})';
const blockFix = 'if(e.providerId!=="banana"&&e.providerId!=="veo3"&&e.isHeadlessMode&&(o.resourceType==="image"||o.resourceType==="media"))return n({cancel:!0})';

if (content.includes(blockTarget)) {
  content = content.replace(blockTarget, blockFix);
  console.log('✅ Đã gỡ bỏ chặn ảnh/media cho tài khoản Google Flow để reCAPTCHA đạt điểm 0.9 người thật');
}

// 2. THÊM HEADER 'x-same-domain': '1' VÀO nl(r) ĐỂ GOOGLE FLOW KHÔNG COI LÀ CSRF / UNUSUAL ACTIVITY
const nlFetchTarget = `        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: bodyData,
          credentials: 'include',
          signal: controller.signal
        });`;

const nlFetchFix = `        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-same-domain': '1'
          },
          body: bodyData,
          credentials: 'include',
          signal: controller.signal
        });`;

if (content.includes(nlFetchTarget)) {
  content = content.replace(nlFetchTarget, nlFetchFix);
  console.log('✅ Đã bổ sung header x-same-domain: 1 vào fetch tạo video của nl(r)');
}

// 3. KHÔNG GỬI TOKEN TRỐNG NẾU RECAPTCHA CHƯA SẴN SÀNG (ĐỢI TỐI ĐA 25S)
const emptyTokenTarget = `        if (!recaptchaToken) {
          addLog('CẢNH BÁO: Không lấy được reCAPTCHA token');
        } else {
          addLog('Đã lấy reCAPTCHA token thành công: ' + recaptchaToken.slice(0, 15) + '...');
        }`;

const emptyTokenFix = `        if (!recaptchaToken) {
          // Thử lấy token lần cuối
          for (let retry = 0; retry < 30; retry++) {
            if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
              try {
                recaptchaToken = await runRecaptchaExecute();
                if (recaptchaToken) break;
              } catch (_) {}
            }
            await new Promise(r => setTimeout(r, 250));
          }
        }

        if (!recaptchaToken) {
          return {
            success: false,
            error: 'Google Flow reCAPTCHA chưa sẵn sàng trong phiên trình duyệt. Vui lòng mở tài khoản trong Browser Hub để kích hoạt.',
            log: logs
          };
        }
        addLog('Đã lấy reCAPTCHA token thành công: ' + recaptchaToken.slice(0, 15) + '...');`;

if (content.includes(emptyTokenTarget)) {
  content = content.replace(emptyTokenTarget, emptyTokenFix);
  console.log('✅ Đã bảo vệ nl(r): Không gửi token rỗng lên Google Flow');
}

// 4. XÓA SẠCH TOÀN BỘ COOLDOWN VÀ LỖI BẢO MẬT CŨ TRONG BROWSER-SESSIONS.JSON
try {
  const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : null);
  if (appData) {
    const sessionFile = path.join(appData, 'AI_VIDEO_LIBRARY_DATA', 'browser-sessions.json');
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
      console.log('✅ Đã làm sạch toàn bộ cooldown & cờ xác minh trong browser-sessions.json');
    }
  }
} catch(e) {
  console.warn('Lỗi dọn dẹp browser-sessions:', e.message);
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('🎉 Hoàn tất vá lỗi chống cờ UNUSUAL_ACTIVITY cho Google Flow!');
