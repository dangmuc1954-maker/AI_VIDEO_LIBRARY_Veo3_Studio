
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowImageRpc: Khởi chạy in-page execution');
        const siteKey = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
        const params = {"prompt":"test","projectId":"123"};

        // 1. Lấy token reCAPTCHA enterprise
        let recaptchaToken = '';
        const runRecaptchaExecute = async () => {
          const execPromise = window.grecaptcha.enterprise.execute(siteKey, { action: "IMAGE_GENERATION" });
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

        const batchPath = "/_/AiSandboxAngularFrontend/data/batchexecute";

        // 2.5. TỰ ĐỘNG PHÁT HIỆN HOẶC TRUY VẤN PROJECT THẬT TRÊN GOOGLE FLOW
        let validProjectId = params.projectId;
        const curPathMatch = window.location.pathname.match(//project/([a-zA-Z0-9_-]+)/);
        if (curPathMatch && curPathMatch[1] && curPathMatch[1].length > 8) {
          validProjectId = curPathMatch[1];
          addLog('Đã lấy Project ID từ URL trang: ' + validProjectId);
        }

        const isFakeId = (id) => !id || id === '1c944d54-d46c-4428-954f-ae139923e2cc' || id.startsWith('temp-') || id.startsWith('fallback-');

        if (isFakeId(validProjectId)) {
          const projectLink = document.querySelector('a[href*="/project/"]');
          if (projectLink) {
            const linkMatch = projectLink.getAttribute('href').match(//project/([a-zA-Z0-9_-]+)/);
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
        const modelKey = params.modelName || "NARWHAL";
        const ratioMap = undefined;
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
          22,
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

        const rpcId = "ogiZ0b";
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
        const timeoutId = setTimeout(() => abortController.abort(), 180000);

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
  