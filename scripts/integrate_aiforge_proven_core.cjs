const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== [TÍCH HỢP BẢN GỐC CHUẨN TỪ AIFORGE STUDIO] ===');

let aiforgeZu = fs.readFileSync('scripts/aiforge_zu.js', 'utf8');
let aiforgeNl = fs.readFileSync('scripts/aiforge_nl.js', 'utf8');

// 1. Tinh chỉnh aiforgeZu: Thêm dynamic project resolution nếu params.projectId rỗng
const zuProjTarget = 'const clientContext = [';
const zuProjEnhance = `let effectiveProjectId = params.projectId;
        try {
          const pm = window.location.pathname.match(new RegExp('/project/([a-f0-9-]+)', 'i'));
          if (pm && pm[1]) effectiveProjectId = pm[1];
        } catch (_) {}
        if (!effectiveProjectId || effectiveProjectId.startsWith('temp-') || effectiveProjectId.startsWith('fallback-')) {
          try {
            const projectLink = document.querySelector('a[href*="/project/"]');
            if (projectLink) {
              const lm = projectLink.getAttribute('href').match(new RegExp('/project/([a-f0-9-]+)', 'i'));
              if (lm && lm[1]) effectiveProjectId = lm[1];
            }
          } catch (_) {}
        }
        if (!effectiveProjectId) effectiveProjectId = params.projectId || 'b4ab78d0-1d67-460c-b367-c3a9766169c5';

        const clientContext = [`;

aiforgeZu = aiforgeZu.replace(zuProjTarget, zuProjEnhance);
aiforgeZu = aiforgeZu.split('params.projectId').join('effectiveProjectId');

// 2. Tinh chỉnh aiforgeNl: Thêm x-same-domain header + dynamic project resolution + chờ token
const nlHeaderTarget = `'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'`;
const nlHeaderFix = `'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-same-domain': '1'`;
aiforgeNl = aiforgeNl.replace(nlHeaderTarget, nlHeaderFix);

const nlProjTarget = 'const innerPayload = [';
const nlProjEnhance = `let effectiveProjectId = params.projectId;
        try {
          const pm = window.location.pathname.match(new RegExp('/project/([a-f0-9-]+)', 'i'));
          if (pm && pm[1]) effectiveProjectId = pm[1];
        } catch (_) {}
        if (!effectiveProjectId || effectiveProjectId.startsWith('temp-') || effectiveProjectId.startsWith('fallback-')) {
          try {
            const projectLink = document.querySelector('a[href*="/project/"]');
            if (projectLink) {
              const lm = projectLink.getAttribute('href').match(new RegExp('/project/([a-f0-9-]+)', 'i'));
              if (lm && lm[1]) effectiveProjectId = lm[1];
            }
          } catch (_) {}
        }
        if (!effectiveProjectId) effectiveProjectId = params.projectId || 'b4ab78d0-1d67-460c-b367-c3a9766169c5';

        const innerPayload = [`;

aiforgeNl = aiforgeNl.replace(nlProjTarget, nlProjEnhance);
aiforgeNl = aiforgeNl.split('params.projectId').join('effectiveProjectId');

// Đảm bảo nl cũng có vòng lặp chờ reCAPTCHA token như zu
const nlTokenWaitTarget = `        if (!recaptchaToken) {
          addLog('CẢNH BÁO: Không lấy được reCAPTCHA token');
        } else {
          addLog('Đã lấy reCAPTCHA token thành công: ' + recaptchaToken.slice(0, 15) + '...');
        }`;

const nlTokenWaitFix = `        if (!recaptchaToken) {
          for (let i = 0; i < 40; i++) {
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
            error: 'Google Flow reCAPTCHA chưa sẵn sàng. Vui lòng mở tài khoản trong Browser Hub để kích hoạt.',
            log: logs
          };
        }
        addLog('Đã lấy reCAPTCHA token thành công: ' + recaptchaToken.slice(0, 15) + '...');`;

aiforgeNl = aiforgeNl.replace(nlTokenWaitTarget, nlTokenWaitFix);

// Test qua VM
const Sn = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const Ec = Sn;
const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };

const fnZu = new Function('Sn', 'qe', aiforgeZu + '; return zu;')(Sn, qe);
const zuScript = fnZu({ params: { prompt: "test prompt", projectId: "real-proj" } });
new vm.Script(zuScript);
console.log('✅ aiforgeZu VM verify: PASSED');

const fnNl = new Function('Ec', 'qe', aiforgeNl + '; return nl;')(Ec, qe);
const nlScript = fnNl({ params: { prompt: "test prompt", projectId: "real-proj", mode: "R2V", referenceMediaIds: ["ref1"] } });
new vm.Script(nlScript);
console.log('✅ aiforgeNl VM verify: PASSED');

// Ghép vào app/out/main/index.js
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const curZuStart = mainContent.indexOf('function zu(r){');
const curZuEnd = mainContent.indexOf('function Ku(r){', curZuStart);
mainContent = mainContent.slice(0, curZuStart) + aiforgeZu + mainContent.slice(curZuEnd);

const curNlStart = mainContent.indexOf('function nl(r){');
const curNlEnd = mainContent.indexOf('function al(r){', curNlStart);
mainContent = mainContent.slice(0, curNlStart) + aiforgeNl + mainContent.slice(curNlEnd);

// Clear cooldowns
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
      console.log('✅ Đã làm sạch toàn bộ cooldown trong browser-sessions.json');
    }
  }
} catch(e) {}

fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log('🎉 Hoàn tất tích hợp lõi gốc chuẩn từ AIForge Studio!');
