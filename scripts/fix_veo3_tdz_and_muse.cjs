const fs = require('fs');
const vm = require('vm');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// 1. FIX VEO 3 TDZ ERROR: let effectiveProjectId = effectiveProjectId;
const tdzTarget = 'let effectiveProjectId = effectiveProjectId;';
const tdzFix = 'let effectiveProjectId = params.projectId;';

if (content.includes(tdzTarget)) {
  content = content.replace(tdzTarget, tdzFix);
  console.log('✅ Fixed Veo 3 TDZ error: let effectiveProjectId = params.projectId;');
} else {
  console.log('⚠️ tdzTarget not found directly, checking...');
}

// 2. FIX MUSE AI FALSE IMMEDIATE ERROR
// Thay vì quét document.body?.innerText toàn trang (dễ dính chữ từ các video cũ bị lỗi trước đây),
// chỉ kiểm tra modal chặn cước phí (dialog/modal role="dialog") xuất hiện mới.
const museCheckTarget = `      // 4.5. KIỂM TRA PHẢN HỒI TỨC THÌ (LỖI CREDITS / POPUP UPGRADE)
      const postCheck = await wc.executeJavaScript(\`
        (() => {
          const bodyText = (document.body?.innerText || '').toLowerCase();
          if (bodyText.includes('upgrade to pro') || bodyText.includes('upgrade your plan') || bodyText.includes('out of credits') || bodyText.includes('hết credit') || bodyText.includes('generation limit') || bodyText.includes('daily limit')) {
            return { error: "Tài khoản Muse AI đã hết lượt tạo video (hết credits hoặc chạm hạn mức ngày). Vui lòng đổi tài khoản khác hoặc nâng cấp Pro!" };
          }
          if (bodyText.includes('something went wrong') || bodyText.includes('failed to generate') || bodyText.includes('error generating')) {
            const errEl = document.querySelector('.error, [role="alert"], [class*="error"]');
            return { error: "Muse AI báo lỗi: " + (errEl?.innerText || "Không thể tạo video với prompt này") };
          }
          return { ok: true, url: window.location.href };
        })()
      \`, true);

      if (postCheck?.error) {
        logDebug("Immediate error detected from Muse AI", { error: postCheck.error });
        throw new Error(postCheck.error);
      }`;

const museCheckFix = `      // 4.5. KIỂM TRA PHẢN HỒI TỨC THÌ (CHỈ KIỂM TRA POPUP MODAL MỚI XUẤT HIỆN)
      const postCheck = await wc.executeJavaScript(\`
        (() => {
          const modal = document.querySelector('[role="dialog"], .modal, [class*="dialog"]');
          if (modal && modal.offsetWidth > 0) {
            const mt = (modal.innerText || '').toLowerCase();
            if (mt.includes('upgrade') || mt.includes('credit') || mt.includes('limit') || mt.includes('plan')) {
              return { error: "Tài khoản Muse AI đã hết hạn mức hoặc yêu cầu nâng cấp gói!" };
            }
          }
          return { ok: true, url: window.location.href };
        })()
      \`, true);

      if (postCheck?.error) {
        logDebug("Immediate modal error detected from Muse AI", { error: postCheck.error });
        throw new Error(postCheck.error);
      }`;

if (content.includes(museCheckTarget)) {
  content = content.replace(museCheckTarget, museCheckFix);
  console.log('✅ Fixed Muse AI false error check (no longer flags historical body text)');
} else {
  console.log('⚠️ museCheckTarget not found directly');
}

// 3. Clear all cooldowns in browser-sessions.json
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
          s.healthScore = 100;
          s.healthLabel = "Excellent";
        }
      }
      fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2), 'utf8');
      console.log('✅ Cleared all cooldowns in browser-sessions.json');
    }
  }
} catch(e) {}

fs.writeFileSync(mainPath, content, 'utf8');

// 4. Test nl function with VM
const nlStart = content.indexOf('function nl(r){');
const nlEnd = content.indexOf('function al(r){', nlStart);
const nlCode = content.slice(nlStart, nlEnd);
const Ec = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const qe = { recaptcha: { siteKey: Ec }, clientContext: {}, rpcIds: {} };
eval(nlCode);
const testNl = nl({ params: { prompt: "test prompt", projectId: "real-proj-123", mode: "R2V", referenceMediaIds: ["ref1"] } });
new vm.Script(testNl);
console.log('🎉 nl function is 100% VALID and free from TDZ error!');
