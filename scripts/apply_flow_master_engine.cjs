const fs = require('fs');
const path = require('path');

console.log('=== [MASTER ENGINE PATCH] ÁP DỤNG CHUẨN IN-PAGE REAL PROJECT CHO GOOGLE FLOW (VEO 3 & BANANA) & MUSE AI ROBUST SEND ===');

const mainFile = path.resolve(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainFile, 'utf8');

// 1. CLEAR COOLDOWNS TRONG AI_VIDEO_LIBRARY_DATA/browser-sessions.json
try {
  const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : null);
  if (appData) {
    const sessionFile = path.join(appData, 'AI_VIDEO_LIBRARY_DATA', 'browser-sessions.json');
    if (fs.existsSync(sessionFile)) {
      const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      let modified = false;
      const list = Array.isArray(data) ? data : (data.sessions || []);
      for (const s of list) {
        if (s.diagnostics && s.diagnostics.cooldownUntil) {
          console.log(`Clearing cooldown for account: ${s.accountName || s.accountId}`);
          delete s.diagnostics.cooldownUntil;
          delete s.diagnostics.cooldownReason;
          delete s.diagnostics.lastProviderErrorCode;
          s.healthScore = 100;
          s.healthLabel = "Excellent";
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2), 'utf8');
        console.log('✅ Đã xóa toàn bộ cooldown cũ trong browser-sessions.json của máy!');
      }
    }
  }
} catch(e) {
  console.warn('Non-fatal error clearing cooldowns:', e.message);
}

// 2. PATCH zu(r) (BANANA / IMAGEN 3 IN-PAGE RPC)
const zuStart = content.indexOf('function zu(r){');
const zuEndMarker = 'function Ku(r){';
const zuEnd = content.indexOf(zuEndMarker, zuStart);

if (zuStart === -1 || zuEnd === -1) {
  console.error('❌ Không tìm thấy hàm zu(r) trong main/index.js!');
  process.exit(1);
}

const newZuCode = `function zu(r){const{params:e,timeoutMs:t=18e4,rpcConfig:A=qe}=r,o=A.recaptcha?.siteKey||Sn,n=A.recaptcha?.imageAction||"IMAGE_GENERATION",a=A.rpcIds?.imageGenerate||"ogiZ0b",s=A.clientContext?.clientVersionNumber??22,i=A.clientContext?.batchExecutePath||"/_/AiSandboxAngularFrontend/data/batchexecute",c=JSON.stringify(e),g=JSON.stringify(A.image?.aspectRatioMapping||qe.image.aspectRatioMapping),u=A.image?.defaultModel||qe.image.defaultModel||"NARWHAL";return\`
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowImageRpc: Khởi chạy in-page execution');
        const siteKey = \${JSON.stringify(o)};
        const params = \${c};

        // 1. Lấy token reCAPTCHA enterprise
        let recaptchaToken = '';
        const runRecaptchaExecute = async () => {
          const execPromise = window.grecaptcha.enterprise.execute(siteKey, { action: \${JSON.stringify(n)} });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('reCAPTCHA enterprise execute timeout (20s)')), 20000)
          );
          return await Promise.race([execPromise, timeoutPromise]);
        };

        if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
          addLog('grecaptcha.enterprise sẵn sàng');
          try {
            recaptchaToken = await runRecaptchaExecute();
          } catch (eErr) {
            addLog('Lỗi lấy reCAPTCHA trực tiếp: ' + eErr.message);
          }
        }

        if (!recaptchaToken) {
          addLog('Nạp script reCAPTCHA enterprise');
          const scriptId = 'aiforge-flow-recaptcha';
          let scEl = document.getElementById(scriptId);
          if (!scEl) {
            try {
              scEl = document.createElement('script');
              scEl.id = scriptId;
              const existingNonce = document.querySelector('script[nonce]')?.nonce || document.querySelector('script[nonce]')?.getAttribute('nonce');
              if (existingNonce) scEl.setAttribute('nonce', existingNonce);
              let scriptUrl = 'https://www.google.com/recaptcha/enterprise.js?render=' + siteKey;
              if (typeof window.trustedTypes !== 'undefined' && window.trustedTypes.createPolicy) {
                try {
                  const p = window.trustedTypes.defaultPolicy || window.trustedTypes.createPolicy('recaptcha-loader', { createScriptURL: u => u });
                  if (p) scriptUrl = p.createScriptURL(scriptUrl);
                } catch {
                  try {
                    const existing = window.trustedTypes.getPolicy('recaptcha-loader');
                    if (existing) scriptUrl = existing.createScriptURL(scriptUrl);
                  } catch {}
                }
              }
              scEl.src = scriptUrl;
              scEl.async = true;
              document.head.appendChild(scEl);
            } catch (injectErr) {
              addLog('Inject script warning: ' + injectErr.message);
            }
          }
          for (let i = 0; i < 40; i++) {
            if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
              try {
                recaptchaToken = await runRecaptchaExecute();
                if (recaptchaToken) break;
              } catch (retryErr) {
                addLog('Lỗi thử lại reCAPTCHA: ' + retryErr.message);
              }
            }
            await new Promise(r => setTimeout(r, 250));
          }
        }

        if (!recaptchaToken) {
          return {
            success: false,
            error: 'Không thể lấy token reCAPTCHA Enterprise trên trang Google Flow',
            log: logs
          };
        }
        addLog('Đã lấy reCAPTCHA token (độ dài: ' + recaptchaToken.length + ')');

        // 2. Đọc WIZ_global_data
        let at = window.WIZ_global_data?.SNlM0e;
        let fSid = window.WIZ_global_data?.FdrFJe;
        let bl = window.WIZ_global_data?.cfb2h || 'boq_labs-ai-sandbox-frontend_20260909.10_p0';

        if (!at || !fSid) {
          for (let i = 0; i < 20; i++) {
            at = window.WIZ_global_data?.SNlM0e;
            fSid = window.WIZ_global_data?.FdrFJe;
            bl = window.WIZ_global_data?.cfb2h || bl;
            if (at && fSid) break;
            await new Promise(r => setTimeout(r, 200));
          }
        }

        if (!at || !fSid) {
          return {
            success: false,
            error: 'Thiếu WIZ_global_data (SNlM0e / FdrFJe). Vui lòng đăng nhập lại Google Flow.',
            log: logs
          };
        }
        addLog('WIZ_global_data sẵn sàng: fSid=' + fSid);

        function generateUuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16).toLowerCase();
          });
        }

        const batchPath = \${JSON.stringify(i)};

        // 2.5. TỰ ĐỘNG PHÁT HIỆN HOẶC TRUY VẤN PROJECT THẬT TRÊN GOOGLE FLOW
        let validProjectId = params.projectId;
        const curPathMatch = window.location.pathname.match(/\\/project\\/([a-zA-Z0-9_-]+)/);
        if (curPathMatch && curPathMatch[1] && curPathMatch[1].length > 8) {
          validProjectId = curPathMatch[1];
          addLog('Đã lấy Project ID từ URL trang: ' + validProjectId);
        }

        const isFakeId = (id) => !id || id === '1c944d54-d46c-4428-954f-ae139923e2cc' || id.startsWith('temp-') || id.startsWith('fallback-');

        if (isFakeId(validProjectId)) {
          const projectLink = document.querySelector('a[href*="/project/"]');
          if (projectLink) {
            const linkMatch = projectLink.getAttribute('href').match(/\\/project\\/([a-zA-Z0-9_-]+)/);
            if (linkMatch && linkMatch[1]) {
              validProjectId = linkMatch[1];
              addLog('Đã tìm thấy Project ID từ liên kết dự án trên giao diện: ' + validProjectId);
            }
          }
        }

        if (isFakeId(validProjectId)) {
          try {
            addLog('Đang truy vấn danh sách Project thật qua UpteDb RPC...');
            const listPayload = JSON.stringify([[['UpteDb', JSON.stringify(['projects/*', 21, null, null, null, null, [1]]), null, 'generic']]]);
            const listUrl = batchPath + '?rpcids=UpteDb&source-path=%2F&bl=' + encodeURIComponent(bl) + '&f.sid=' + encodeURIComponent(fSid) + '&hl=en-US&rt=c';
            const listResp = await fetch(listUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'x-same-domain': '1' },
              body: 'f.req=' + encodeURIComponent(listPayload) + '&at=' + encodeURIComponent(at) + '&',
              credentials: 'include'
            });
            if (listResp.ok) {
              const listText = await listResp.text();
              const pMatches = [...listText.matchAll(/"([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})"/gi)].map(m => m[1]);
              if (pMatches.length > 0) {
                validProjectId = pMatches[0];
                addLog('Đã lấy Project thật từ Google Flow: ' + validProjectId);
              }
            }
          } catch (projErr) {
            addLog('Lỗi truy vấn project list: ' + projErr.message);
          }
        }

        if (isFakeId(validProjectId)) {
          try {
            addLog('Tài khoản chưa có dự án, đang tạo Project thật mới qua jHPbke RPC...');
            const newProjUuid = generateUuid();
            const createPayload = JSON.stringify([[['jHPbke', JSON.stringify([newProjUuid, 'Project AIForge', null, null, null, null, 1]), null, 'generic']]]);
            const createUrl = batchPath + '?rpcids=jHPbke&source-path=%2F&bl=' + encodeURIComponent(bl) + '&f.sid=' + encodeURIComponent(fSid) + '&hl=en-US&rt=c';
            const createResp = await fetch(createUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'x-same-domain': '1' },
              body: 'f.req=' + encodeURIComponent(createPayload) + '&at=' + encodeURIComponent(at) + '&',
              credentials: 'include'
            });
            if (createResp.ok) {
              validProjectId = newProjUuid;
              addLog('Đã tạo thành công Project thật mới: ' + validProjectId);
            }
          } catch (createErr) {
            addLog('Lỗi tạo project mới: ' + createErr.message);
          }
        }

        if (validProjectId) {
          params.projectId = validProjectId;
        }

        // 3. Đóng gói innerPayload và f.req
        const modelKey = params.modelName || \${JSON.stringify(u)};
        const ratioMap = \${g};
        let aspectRatioNum = 3;
        if (typeof params.aspectRatio === 'string' && ratioMap && ratioMap[params.aspectRatio] !== undefined) {
          aspectRatioNum = ratioMap[params.aspectRatio];
        } else if (typeof params.aspectRatio === 'number' && params.aspectRatio >= 1 && params.aspectRatio <= 5) {
          aspectRatioNum = params.aspectRatio;
        } else {
          switch (params.aspectRatio) {
            case '1:1':
            case 'IMAGE_ASPECT_RATIO_SQUARE':
              aspectRatioNum = 1;
              break;
            case '9:16':
            case 'IMAGE_ASPECT_RATIO_PORTRAIT':
              aspectRatioNum = 2;
              break;
            case '16:9':
            case 'IMAGE_ASPECT_RATIO_LANDSCAPE':
              aspectRatioNum = 3;
              break;
            case '3:4':
            case '4:5':
            case 'IMAGE_ASPECT_RATIO_PORTRAIT_THREE_FOUR':
              aspectRatioNum = 4;
              break;
            case '4:3':
            case 'IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE':
              aspectRatioNum = 5;
              break;
            default:
              aspectRatioNum = 3;
              break;
          }
        }

        const clientMediaUuid = generateUuid();
        const clientSessionUuid = generateUuid();
        const clientBatchUuid = generateUuid();
        const seed = Math.floor(Math.random() * 2147483647);

        const clientContext = [
          null,
          \${s},
          null,
          null,
          null,
          params.projectId,
          null,
          null,
          null,
          null,
          null,
          [recaptchaToken, 1]
        ];

        const referenceInputs = Array.isArray(params.referenceMediaIds) && params.referenceMediaIds.length > 0
          ? params.referenceMediaIds.map(id => [id, null, null, null, 1])
          : null;

        const innerPayload = [
          null,
          [
            [
              null,
              null,
              referenceInputs,
              seed,
              aspectRatioNum,
              modelKey,
              null,
              clientContext,
              [[[ params.prompt ]]],
              null,
              null,
              null,
              clientMediaUuid,
              clientSessionUuid
            ]
          ],
          1,
          clientContext,
          [ clientBatchUuid ]
        ];

        const rpcId = \${JSON.stringify(a)};
        const reqId = Math.floor(Math.random() * 900000) + 100000;
        const url = batchPath + '?rpcids=' + encodeURIComponent(rpcId)
          + '&source-path=' + encodeURIComponent('/project/' + params.projectId)
          + '&bl=' + encodeURIComponent(bl)
          + '&f.sid=' + encodeURIComponent(fSid)
          + '&hl=en-US'
          + '&_reqid=' + reqId
          + '&rt=c';

        const bodyData = 'f.req=' + encodeURIComponent(JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, "generic"]]]))
          + '&at=' + encodeURIComponent(at)
          + '&';

        addLog('Gửi batchexecute RPC ' + rpcId + ' với Project ID ' + params.projectId + '...');
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), \${t});

        const fetchStartTime = Date.now();
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'x-same-domain': '1'
          },
          body: bodyData,
          credentials: 'include',
          signal: abortController.signal
        });
        clearTimeout(timeoutId);

        const durationMs = Date.now() - fetchStartTime;
        addLog('RPC response status: ' + response.status + ' (' + durationMs + 'ms)');

        const responseText = await response.text();
        return {
          success: response.status === 200,
          status: response.status,
          responseText: responseText,
          projectId: params.projectId,
          log: logs
        };
      } catch (err) {
        return {
          success: false,
          error: err.name === 'AbortError' ? 'RPC request timeout vượt quá thời gian chờ' : err.message,
          log: logs
        };
      }
    })()
  \`}`;

content = content.substring(0, zuStart) + newZuCode + content.substring(zuEnd);
console.log('✅ Đã cập nhật hàm zu(r) với bộ giải mã Project ID thật cho Banana!');

// 3. PATCH nl(r) (VEO 3 IN-PAGE RPC)
const nlStart = content.indexOf('function nl(r){');
const nlEndMarker = 'function al(r){';
const nlEnd = content.indexOf(nlEndMarker, nlStart);

if (nlStart === -1 || nlEnd === -1) {
  console.error('❌ Không tìm thấy hàm nl(r) trong main/index.js!');
  process.exit(1);
}

const newNlCode = `function nl(r){const{params:e,timeoutMs:t=18e4,rpcConfig:A=qe}=r,o=A.recaptcha?.siteKey||Ec,n=A.recaptcha?.videoAction||"VIDEO_GENERATION",a=A.clientContext?.clientVersionNumber??22,s=A.clientContext?.batchExecutePath||"/_/AiSandboxAngularFrontend/data/batchexecute",i=A.rpcIds?.videoT2v||"YhhmEf",c=A.rpcIds?.videoI2v||"eb1hJf",g=A.rpcIds?.videoFrames||"nprQif",u=A.rpcIds?.videoR2v||"MZZa6b",d=JSON.stringify(e);return\`
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowVideoRpc: Khởi chạy in-page submit');
        const siteKey = \${JSON.stringify(o)};
        const params = \${d};

        // 1. Lấy token reCAPTCHA enterprise với action video
        let recaptchaToken = '';
        const runRecaptchaExecute = async () => {
          const execPromise = window.grecaptcha.enterprise.execute(siteKey, { action: \${JSON.stringify(n)} });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('reCAPTCHA enterprise execute timeout (20s)')), 20000)
          );
          return await Promise.race([execPromise, timeoutPromise]);
        };

        if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
          try {
            recaptchaToken = await runRecaptchaExecute();
          } catch (eErr) {
            addLog('Lỗi lấy reCAPTCHA trực tiếp: ' + eErr.message);
          }
        }

        if (!recaptchaToken) {
          const scriptId = 'aiforge-flow-recaptcha';
          let scEl = document.getElementById(scriptId);
          if (!scEl) {
            try {
              scEl = document.createElement('script');
              scEl.id = scriptId;
              const existingNonce = document.querySelector('script[nonce]')?.nonce || document.querySelector('script[nonce]')?.getAttribute('nonce');
              if (existingNonce) scEl.setAttribute('nonce', existingNonce);
              let scriptUrl = 'https://www.google.com/recaptcha/enterprise.js?render=' + siteKey;
              scEl.src = scriptUrl;
              scEl.async = true;
              document.head.appendChild(scEl);
            } catch (injectErr) {}
          }
          for (let i = 0; i < 40; i++) {
            if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
              try {
                recaptchaToken = await runRecaptchaExecute();
                if (recaptchaToken) break;
              } catch (retryErr) {}
            }
            await new Promise(r => setTimeout(r, 250));
          }
        }

        if (!recaptchaToken) {
          return {
            success: false,
            error: 'Không thể lấy token reCAPTCHA Enterprise cho video trên trang Google Flow',
            log: logs
          };
        }

        // 2. Đọc WIZ_global_data
        let at = window.WIZ_global_data?.SNlM0e;
        let fSid = window.WIZ_global_data?.FdrFJe;
        let bl = window.WIZ_global_data?.cfb2h || 'boq_labs-ai-sandbox-frontend_20260909.10_p0';

        if (!at || !fSid) {
          for (let i = 0; i < 20; i++) {
            at = window.WIZ_global_data?.SNlM0e;
            fSid = window.WIZ_global_data?.FdrFJe;
            bl = window.WIZ_global_data?.cfb2h || bl;
            if (at && fSid) break;
            await new Promise(r => setTimeout(r, 200));
          }
        }

        if (!at || !fSid) {
          return {
            success: false,
            error: 'Thiếu WIZ_global_data. Vui lòng đăng nhập lại Google Flow.',
            log: logs
          };
        }

        function generateUuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16).toLowerCase();
          });
        }

        const batchPath = \${JSON.stringify(s)};

        // 2.5. TỰ ĐỘNG PHÁT HIỆN HOẶC TRUY VẤN PROJECT THẬT CHO VEO 3
        let validProjectId = params.projectId;
        const curPathMatch = window.location.pathname.match(/\\/project\\/([a-zA-Z0-9_-]+)/);
        if (curPathMatch && curPathMatch[1] && curPathMatch[1].length > 8) {
          validProjectId = curPathMatch[1];
          addLog('Đã lấy Project ID từ URL: ' + validProjectId);
        }

        const isFakeId = (id) => !id || id === '1c944d54-d46c-4428-954f-ae139923e2cc' || id.startsWith('temp-') || id.startsWith('fallback-');

        if (isFakeId(validProjectId)) {
          const projectLink = document.querySelector('a[href*="/project/"]');
          if (projectLink) {
            const linkMatch = projectLink.getAttribute('href').match(/\\/project\\/([a-zA-Z0-9_-]+)/);
            if (linkMatch && linkMatch[1]) {
              validProjectId = linkMatch[1];
              addLog('Đã lấy Project ID từ giao diện: ' + validProjectId);
            }
          }
        }

        if (isFakeId(validProjectId)) {
          try {
            addLog('Đang truy vấn danh sách Project thật qua UpteDb RPC...');
            const listPayload = JSON.stringify([[['UpteDb', JSON.stringify(['projects/*', 21, null, null, null, null, [1]]), null, 'generic']]]);
            const listUrl = batchPath + '?rpcids=UpteDb&source-path=%2F&bl=' + encodeURIComponent(bl) + '&f.sid=' + encodeURIComponent(fSid) + '&hl=en-US&rt=c';
            const listResp = await fetch(listUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'x-same-domain': '1' },
              body: 'f.req=' + encodeURIComponent(listPayload) + '&at=' + encodeURIComponent(at) + '&',
              credentials: 'include'
            });
            if (listResp.ok) {
              const listText = await listResp.text();
              const pMatches = [...listText.matchAll(/"([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})"/gi)].map(m => m[1]);
              if (pMatches.length > 0) {
                validProjectId = pMatches[0];
                addLog('Đã lấy Project thật từ Google Flow: ' + validProjectId);
              }
            }
          } catch (projErr) {}
        }

        if (isFakeId(validProjectId)) {
          try {
            addLog('Tạo Project thật mới cho Veo 3 qua jHPbke RPC...');
            const newProjUuid = generateUuid();
            const createPayload = JSON.stringify([[['jHPbke', JSON.stringify([newProjUuid, 'Project AIForge', null, null, null, null, 1]), null, 'generic']]]);
            const createUrl = batchPath + '?rpcids=jHPbke&source-path=%2F&bl=' + encodeURIComponent(bl) + '&f.sid=' + encodeURIComponent(fSid) + '&hl=en-US&rt=c';
            const createResp = await fetch(createUrl, {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8', 'x-same-domain': '1' },
              body: 'f.req=' + encodeURIComponent(createPayload) + '&at=' + encodeURIComponent(at) + '&',
              credentials: 'include'
            });
            if (createResp.ok) {
              validProjectId = newProjUuid;
              addLog('Đã tạo thành công Project thật: ' + validProjectId);
            }
          } catch (createErr) {}
        }

        if (validProjectId) {
          params.projectId = validProjectId;
        }

        const clientContext = [
          null,
          \${a},
          null,
          null,
          null,
          params.projectId,
          null,
          null,
          null,
          null,
          null,
          [recaptchaToken, 1]
        ];

        const modelKey = params.modelKey || 'veo_3_1_fast';
        const ratioEnum = params.ratioEnum || 3;
        const resolutionCode = params.resolutionCode || 2;
        const clientUuid1 = generateUuid();
        const clientUuid2 = generateUuid();
        const promptStructure = [[[params.prompt]]];

        let rpcId = '';
        let modePayload = null;

        if (params.mode === 'i2v' && params.inputMediaId) {
          rpcId = \${JSON.stringify(c)};
          modePayload = [
            promptStructure,
            params.inputMediaId,
            modelKey,
            ratioEnum,
            null,
            [null, null, null, null, clientUuid1, clientUuid2],
            null,
            null,
            null,
            null,
            null,
            null,
            [resolutionCode]
          ];
        } else if (params.mode === 'frames' && Array.isArray(params.referenceMediaIds) && params.referenceMediaIds.length > 0) {
          rpcId = \${JSON.stringify(g)};
          const refArray = params.referenceMediaIds.map(id => [null, id]);
          modePayload = [
            promptStructure,
            refArray,
            modelKey,
            ratioEnum,
            null,
            [null, null, null, null, clientUuid1, clientUuid2],
            null,
            null,
            null,
            null,
            null,
            [resolutionCode]
          ];
        } else {
          rpcId = \${JSON.stringify(i)};
          modePayload = [
            promptStructure,
            modelKey,
            ratioEnum,
            null,
            [null, null, null, null, clientUuid1, clientUuid2],
            null,
            null,
            [resolutionCode]
          ];
        }

        const innerPayload = [
          [modePayload],
          clientContext
        ];

        const queryParams = new URLSearchParams({
          rpcids: rpcId,
          'source-path': '/project/' + params.projectId,
          bl: bl,
          'f.sid': fSid,
          hl: 'en-US',
          _reqid: String(Math.floor(Math.random() * 900000) + 100000),
          rt: 'c'
        });

        const url = batchPath + '?' + queryParams.toString();
        const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
        const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

        addLog('Gửi batchexecute Video RPC ' + rpcId + ' với Project ID ' + params.projectId);
        const controller = new AbortController();
        const timeoutTimer = setTimeout(() => controller.abort(), \${t});

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
          },
          body: bodyData,
          credentials: 'include',
          signal: controller.signal
        });

        clearTimeout(timeoutTimer);
        const text = await res.text();

        return {
          success: res.ok,
          status: res.status,
          responseText: text,
          projectId: params.projectId,
          log: logs
        };
      } catch (err) {
        addLog('Lỗi thực thi script in-page: ' + err.message);
        return {
          success: false,
          error: err.message,
          log: logs
        };
      }
    })()
  \`}`;

content = content.substring(0, nlStart) + newNlCode + content.substring(nlEnd);
console.log('✅ Đã cập nhật hàm nl(r) với bộ giải mã Project ID thật cho Veo 3!');

// 4. CẬP NHẬT GỬI LỆNH MUSE AI VỚI ELECTRON HARDWARE KEYBOARD EVENT & QUICK CREDITS CHECK
const museStartMarker = 'class MuseVideoRuntime {';
const museStartIdx = content.indexOf(museStartMarker);
if (museStartIdx !== -1) {
  // Tìm khối gửi prompt trong MuseVideoRuntime
  const sendTarget = `el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            return { success: true };`;
  
  const sendReplacement = `try {
              // Bấm nút gửi nếu có
              const arrowBtn = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
                if (b.offsetWidth <= 0 || b.disabled) return false;
                const html = b.innerHTML.toLowerCase();
                const l = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
                return l.includes('send') || l.includes('gửi') || l.includes('submit') || html.includes('<svg');
              });
              if (arrowBtn) arrowBtn.click();
            } catch(e) {}
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            return { success: true };`;

  if (content.includes(sendTarget)) {
    content = content.replace(sendTarget, sendReplacement);
    console.log('✅ Đã tối ưu nút gửi Muse AI với bộ quét icon SVG/Submit!');
  }
}

fs.writeFileSync(mainFile, content, 'utf8');
console.log('🎉 Áp dụng thành công toàn bộ Master Engine cho Google Flow và Muse AI!');
