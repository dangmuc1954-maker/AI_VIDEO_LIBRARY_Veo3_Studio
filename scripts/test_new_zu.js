const vm = require('vm');

const qe = {
  version: 'bundled-rpc-v1',
  rpcIds: { imageGenerate: 'ogiZ0b' },
  recaptcha: { siteKey: '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV', imageAction: 'IMAGE_GENERATION' },
  clientContext: { clientVersionNumber: 22, batchExecutePath: '/_/AiSandboxAngularFrontend/data/batchexecute', origin: 'https://flow.google.com' },
  image: { defaultModel: 'NARWHAL', aspectRatioMapping: { '1:1': 1, '9:16': 2, '16:9': 3, '3:4': 4, '4:3': 5 } }
};
const Sn = '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV';

function zu(r) {
  const { params: e, timeoutMs: t = 18e4, rpcConfig: A = qe } = r,
        o = A.recaptcha?.siteKey || Sn,
        n = A.recaptcha?.imageAction || "IMAGE_GENERATION",
        a = A.rpcIds?.imageGenerate || "ogiZ0b",
        s = A.clientContext?.clientVersionNumber ?? 22,
        i = A.clientContext?.batchExecutePath || "/_/AiSandboxAngularFrontend/data/batchexecute",
        c = JSON.stringify(e),
        g = JSON.stringify(A.image?.aspectRatioMapping || qe.image.aspectRatioMapping),
        u = A.image?.defaultModel || qe.image.defaultModel || "NARWHAL";
  return `
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowImageRpc: Khởi chạy in-page execution');
        const siteKey = ${JSON.stringify(o)};
        const params = ${c};

        // 1. Lấy token reCAPTCHA enterprise
        let recaptchaToken = '';
        const runRecaptchaExecute = async () => {
          const execPromise = window.grecaptcha.enterprise.execute(siteKey, { action: ${JSON.stringify(n)} });
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
          let sEl = document.getElementById(scriptId);
          if (!sEl) {
            try {
              sEl = document.createElement('script');
              sEl.id = scriptId;
              const existingNonce = document.querySelector('script[nonce]')?.nonce || document.querySelector('script[nonce]')?.getAttribute('nonce');
              if (existingNonce) sEl.setAttribute('nonce', existingNonce);
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
              sEl.src = scriptUrl;
              sEl.async = true;
              document.head.appendChild(sEl);
            } catch (injectErr) {
              addLog('Không thể inject script reCAPTCHA: ' + injectErr.message);
            }
          }

          const startWait = Date.now();
          while (Date.now() - startWait < 15000) {
            if (typeof window.grecaptcha?.enterprise?.execute === 'function') break;
            await new Promise(r => setTimeout(r, 200));
          }

          if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
            try {
              recaptchaToken = await runRecaptchaExecute();
            } catch (waitErr) {
              addLog('Lỗi lấy reCAPTCHA sau khi load script: ' + waitErr.message);
            }
          }
        }

        if (!recaptchaToken) {
          addLog('CẢNH BÁO: Không lấy được reCAPTCHA token');
        } else {
          addLog('Đã lấy reCAPTCHA token thành công: ' + recaptchaToken.slice(0, 15) + '...');
        }

        // 2. Đọc WIZ_global_data
        const wiz = window.WIZ_global_data || {};
        let at = wiz.SNlM0e || '';
        let fSid = wiz.FdrFJe || '';
        let bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20261007.14_p0';

        if (!at || !fSid) {
          for (let k = 0; k < 25; k++) {
            at = window.WIZ_global_data?.SNlM0e || at;
            fSid = window.WIZ_global_data?.FdrFJe || fSid;
            bl = window.WIZ_global_data?.cfb2h || bl;
            if (at && fSid) break;
            await new Promise(r => setTimeout(r, 200));
          }
        }

        if (!at || !fSid) {
          return {
            success: false,
            error: 'Thiếu WIZ_global_data (SNlM0e / FdrFJe) trên Google Flow',
            log: logs
          };
        }

        // 3. Xác định effectiveProjectId
        let effectiveProjectId = params.projectId;
        try {
          const pathMatch = window.location.pathname.match(new RegExp('/project/([a-f0-9-]+)', 'i'));
          if (pathMatch && pathMatch[1]) {
            effectiveProjectId = pathMatch[1];
          }
        } catch (_) {}
        if (!effectiveProjectId) {
          effectiveProjectId = 'b4ab78d0-1d67-460c-b367-c3a9766169c5';
        }
        addLog('Effective Project ID: ' + effectiveProjectId);

        // 4. Model key
        const modelKey = params.modelName || ${JSON.stringify(u)} || 'NARWHAL';
        addLog('Model Key: ' + modelKey);

        // 5. Tỷ lệ khung hình
        const ratioMap = ${g};
        let aspectRatioNum = 3;
        if (typeof params.aspectRatio === 'string' && ratioMap && ratioMap[params.aspectRatio] !== undefined) {
          aspectRatioNum = ratioMap[params.aspectRatio];
        } else if (params.aspectRatio === '9:16' || params.aspectRatio === 'IMAGE_ASPECT_RATIO_PORTRAIT') {
          aspectRatioNum = 2;
        } else if (params.aspectRatio === '1:1' || params.aspectRatio === 'IMAGE_ASPECT_RATIO_SQUARE') {
          aspectRatioNum = 1;
        } else if (params.aspectRatio === '3:4' || params.aspectRatio === '4:5') {
          aspectRatioNum = 4;
        } else if (params.aspectRatio === '4:3') {
          aspectRatioNum = 5;
        }

        const clientMediaUuid = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID().toUpperCase() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase(); });
        const clientSessionUuid = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID().toUpperCase() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase(); });
        const clientBatchUuid = (typeof crypto?.randomUUID === 'function') ? crypto.randomUUID().toUpperCase() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16).toUpperCase(); });
        const seed = Math.floor(Math.random() * 2147483647);

        const clientContext = [
          null,
          ${s},
          null,
          null,
          null,
          effectiveProjectId,
          null,
          null,
          null,
          null,
          [recaptchaToken || '', 1]
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

        const rpcId = ${JSON.stringify(a)};
        const batchPath = ${JSON.stringify(i)};
        const reqId = Math.floor(Math.random() * 900000) + 1000000;
        const sourcePath = '/project/' + effectiveProjectId;
        const queryParams = new URLSearchParams({
          rpcids: rpcId,
          'source-path': sourcePath,
          bl: bl,
          'f.sid': fSid,
          hl: 'en-US',
          _reqid: String(reqId),
          rt: 'c'
        });

        const url = batchPath + '?' + queryParams.toString();
        const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
        const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

        addLog('Gửi batchexecute RPC ' + rpcId + ' (model: ' + modelKey + ')...');
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), ${t});

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
          projectId: effectiveProjectId,
          log: logs
        };
      } catch (err) {
        addLog('Lỗi thực thi script in-page: ' + err.message);
        return {
          success: false,
          error: err.name === 'AbortError' ? 'RPC request timeout vượt quá thời gian chờ' : err.message,
          log: logs
        };
      }
    })()
  `;
}

// Test cases
const testCases = [
  { prompt: 'A simple prompt', projectId: 'proj-1', modelName: 'GEM_PIX_2' },
  { prompt: 'Prompt with "quotes", \'single\', and \n newlines and \\ backslashes', projectId: 'proj-2', modelName: 'NARWHAL', aspectRatio: '9:16' },
  { prompt: 'Chainsaw Man anime, muted palette, 8k resolution', projectId: '', modelName: 'IMAGEN_3_5', referenceMediaIds: ['ref-1', 'ref-2'] }
];

testCases.forEach((tc, idx) => {
  const script = zu({ params: tc, rpcConfig: qe });
  try {
    new vm.Script(script);
    console.log(`✅ Test case ${idx + 1} PASSED! Valid script syntax.`);
  } catch (err) {
    console.error(`❌ Test case ${idx + 1} FAILED:`, err.message);
  }
});
