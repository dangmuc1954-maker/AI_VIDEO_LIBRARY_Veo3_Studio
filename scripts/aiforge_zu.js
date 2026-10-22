function zu(r){const{params:e,timeoutMs:t=18e4,rpcConfig:A=qe}=r,o=A.recaptcha?.siteKey||Sn,n=A.recaptcha?.imageAction||"IMAGE_GENERATION",a=A.rpcIds?.imageGenerate||"ogiZ0b",s=A.clientContext?.clientVersionNumber??22,i=A.clientContext?.batchExecutePath||"/_/AiSandboxAngularFrontend/data/batchexecute",c=JSON.stringify(e),g=JSON.stringify(A.image?.aspectRatioMapping||qe.image.aspectRatioMapping),u=A.image?.defaultModel||qe.image.defaultModel||"NARWHAL";return`
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
          let s = document.getElementById(scriptId);
          if (!s) {
            try {
              s = document.createElement('script');
              s.id = scriptId;
              const existingNonce = document.querySelector('script[nonce]')?.nonce || document.querySelector('script[nonce]')?.getAttribute('nonce');
              if (existingNonce) s.setAttribute('nonce', existingNonce);
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
              s.src = scriptUrl;
              s.async = true;
              document.head.appendChild(s);
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
          // Thử đợi thêm một chút nếu trang vừa tải xong
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
            error: 'Thiếu WIZ_global_data (SNlM0e / FdrFJe). Có thể phiên đăng nhập chưa hoàn tất hoặc bị chuyển hướng.',
            log: logs
          };
        }
        addLog('WIZ_global_data sẵn sàng: fSid=' + fSid);

        // 3. Đóng gói innerPayload và f.req
        const modelKey = params.modelName || ${JSON.stringify(u)};
        const ratioMap = ${g};
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

        function generateUuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16).toUpperCase();
          });
        }

        const clientMediaUuid = generateUuid();
        const clientSessionUuid = generateUuid();
        const clientBatchUuid = generateUuid();
        const seed = Math.floor(Math.random() * 2147483647);

        const clientContext = [
          null,
          ${s},
          null,
          null,
          null,
          params.projectId,
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

        const rpcId = ${JSON.stringify(a)};
        const batchPath = ${JSON.stringify(i)};
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

        addLog('Gửi batchexecute RPC ' + rpcId + '...');
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
  `}