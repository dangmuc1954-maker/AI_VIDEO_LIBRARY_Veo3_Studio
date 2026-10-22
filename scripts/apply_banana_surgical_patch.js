const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Backup
fs.writeFileSync(targetFile + '.before_banana_patch.bak', code, 'utf8');
console.log('✓ Created backup of app/out/main/index.js');

// 1. Locate function zu
const zuStart = code.indexOf('function zu(');
if (zuStart === -1) {
  console.error('❌ function zu not found');
  process.exit(1);
}

const zuEnd = code.indexOf('function Ku(', zuStart);
if (zuEnd === -1) {
  console.error('❌ function Ku not found');
  process.exit(1);
}

console.log(`Found function zu from ${zuStart} to ${zuEnd}`);

const newZuCode = `function zu(r){const{params:e,timeoutMs:t=18e4,rpcConfig:A=qe}=r,o=A.recaptcha?.siteKey||Sn,n=A.recaptcha?.imageAction||"IMAGE_GENERATION",a=A.rpcIds?.imageGenerate||"ogiZ0b",s=A.clientContext?.clientVersionNumber??22,i=A.clientContext?.batchExecutePath||"/_/AiSandboxAngularFrontend/data/batchexecute",c=JSON.stringify(e),g=JSON.stringify(A.image?.aspectRatioMapping||qe.image.aspectRatioMapping),u=A.image?.defaultModel||qe.image.defaultModel||"NARWHAL";return\`
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowImage: Khoi chay tao anh Banana');
        const params = \${c};
        const prompt = String(params.prompt || '').trim();

        // 1. Kiem tra va dam bao dang o trang Project hop le
        let curUrl = window.location.href;
        let pMatch = window.location.pathname.match(/\\\\/project\\\\/([a-f0-9-]+)/i);

        if (!pMatch && !curUrl.includes('/project/')) {
          addLog('Chua o trong project, kiem tra projectId...');
          if (params.projectId && /^[a-f0-9-]{16,}$/i.test(params.projectId)) {
            addLog('Chuyen den project: ' + params.projectId);
            window.location.href = 'https://flow.google.com/project/' + params.projectId;
            await new Promise(r => setTimeout(r, 3500));
            pMatch = window.location.pathname.match(/\\\\/project\\\\/([a-f0-9-]+)/i);
          }
          if (!pMatch) {
            const projLink = document.querySelector('a[href*="/project/"], [data-project-id]');
            if (projLink) {
              projLink.click();
              await new Promise(r => setTimeout(r, 2000));
            } else {
              const newBtn = Array.from(document.querySelectorAll('button, div')).find(el => 
                /new project|tạo mới|project/i.test(el.innerText || '')
              );
              if (newBtn) {
                newBtn.click();
                await new Promise(r => setTimeout(r, 2500));
              }
            }
            pMatch = window.location.pathname.match(/\\\\/project\\\\/([a-f0-9-]+)/i);
          }
        }

        const realProjectId = pMatch ? pMatch[1] : params.projectId;
        addLog('Project ID: ' + realProjectId);

        // 2. Setup sniffer cho URL anh tra ve
        let capturedImageUrl = null;
        let capturedMediaId = null;

        if (!window.__aiforge_flow_hooked) {
          window.__aiforge_flow_hooked = true;
          window.__aiforge_captured_images = [];
          const origFetch = window.fetch;
          window.fetch = async function(...args) {
            const res = await origFetch.apply(this, args);
            try {
              const clone = res.clone();
              const text = await clone.text();
              const imgMatches = text.match(/https:\\\\/\\\\/flow-content\\\\.google\\\\/image\\\\/[a-f0-9-]+/gi) ||
                                text.match(/https:\\\\/\\\\/flow\\\\.google\\\\.com\\\\/asb\\\\/[a-zA-Z0-9_-]+/gi);
              if (imgMatches) {
                for (const m of imgMatches) {
                  if (!window.__aiforge_captured_images.includes(m)) {
                    window.__aiforge_captured_images.push(m);
                  }
                }
              }
            } catch (_) {}
            return res;
          };
        }

        const initialCapturedCount = (window.__aiforge_captured_images || []).length;
        const initialImgSrcs = new Set(Array.from(document.querySelectorAll('img')).map(img => img.src).filter(Boolean));

        // 3. Phuong thuc 1: Tu dong hoa qua UI Google Flow (Native Banana UI)
        let uiSuccess = false;
        const inputEl = document.querySelector('.ProseMirror, textarea, [contenteditable="true"], input[placeholder*="tạo"], input[placeholder*="create"], input[placeholder*="What"], [data-placeholder*="tạo"], [data-placeholder*="create"], [data-placeholder*="What"], [aria-label*="prompt"], [aria-label*="Prompt"]');

        if (inputEl) {
          addLog('Tim thay o nhap lieu Google Flow UI');
          inputEl.focus();

          try {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, prompt);
          } catch (_) {
            if (inputEl.isContentEditable) {
              inputEl.innerText = prompt;
            } else {
              inputEl.value = prompt;
            }
          }
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));

          await new Promise(r => setTimeout(r, 600));

          // Nhan Enter
          inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

          const allButtons = Array.from(document.querySelectorAll('button'));
          const submitBtn = allButtons.find(b => {
            const aria = (b.getAttribute('aria-label') || '').toLowerCase();
            const hasIcon = Boolean(b.querySelector('mat-icon, svg'));
            const isSubmit = /submit|create|tạo|send|generate|tiếp tục|arrow|forward|gửi/i.test(aria) || (hasIcon && b.closest('form, .prompt-box, [class*="prompt"], [class*="input"], [class*="bottom"]'));
            return isSubmit && !b.disabled;
          }) || allButtons.find(b => {
            const icon = b.querySelector('mat-icon, svg');
            return icon && !b.disabled && b.closest('[class*="prompt"], [class*="bottom"], [class*="bar"], footer, .fixed');
          }) || allButtons.find(b => b.querySelector('mat-icon') && !b.disabled);

          if (submitBtn) {
            addLog('Bam nut gui yeu cau tao anh tren UI');
            submitBtn.click();
          }
          uiSuccess = true;
        }

        // 4. Neu UI submit thanh cong, doi anh hoan tat
        if (uiSuccess) {
          addLog('Dang cho Google Flow xu ly anh Banana...');
          const startTime = Date.now();
          const maxWaitMs = 120000;

          while (Date.now() - startTime < maxWaitMs) {
            await new Promise(r => setTimeout(r, 1500));

            const currentCaptured = window.__aiforge_captured_images || [];
            if (currentCaptured.length > initialCapturedCount) {
              capturedImageUrl = currentCaptured[currentCaptured.length - 1];
              addLog('Bat duoc URL anh tu network: ' + capturedImageUrl);
              break;
            }

            const currentImgs = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(Boolean);
            const newImg = currentImgs.reverse().find(s => 
              (s.includes('flow-content.google/image/') || s.includes('flow.google.com/asb/')) && !initialImgSrcs.has(s)
            );
            if (newImg) {
              capturedImageUrl = newImg;
              addLog('Bat duoc URL anh tu DOM: ' + capturedImageUrl);
              break;
            }

            const errorBanner = document.querySelector('[role="alert"], .error-message, .mat-snack-bar-container');
            if (errorBanner && /error|lỗi|từ chối|policy|vi phạm/i.test(errorBanner.innerText || '')) {
              return {
                success: false,
                error: errorBanner.innerText.trim(),
                log: logs
              };
            }
          }

          if (capturedImageUrl) {
            const idMatch = capturedImageUrl.match(/image\\\\/([a-f0-9-]+)/i);
            capturedMediaId = idMatch ? idMatch[1] : ('banana-' + Date.now());
            return {
              success: true,
              imageUrl: capturedImageUrl,
              providerAssetId: capturedMediaId,
              projectId: realProjectId,
              width: 1024,
              height: 1024,
              log: logs
            };
          }
        }

        // 5. Du phong RPC voi realProjectId neu khong dung duoc DOM
        addLog('Chuyen sang phuong an RPC du phong...');
        const siteKey = \${JSON.stringify(o)};
        let recaptchaToken = '';
        if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
          try {
            recaptchaToken = await window.grecaptcha.enterprise.execute(siteKey, { action: \${JSON.stringify(n)} });
          } catch (_) {}
        }

        let at = window.WIZ_global_data?.SNlM0e || '';
        let fSid = window.WIZ_global_data?.FdrFJe || '';
        let bl = window.WIZ_global_data?.cfb2h || 'boq_labs-ai-sandbox-frontend_20261007.14_p0';

        if (!at || !fSid) {
          return {
            success: false,
            error: 'Thiếu WIZ_global_data session Google Flow',
            log: logs
          };
        }

        const ratioMap = \${g};
        let aspectRatioNum = 3;
        if (typeof params.aspectRatio === 'string' && ratioMap && ratioMap[params.aspectRatio] !== undefined) {
          aspectRatioNum = ratioMap[params.aspectRatio];
        } else if (params.aspectRatio === '9:16') {
          aspectRatioNum = 2;
        } else if (params.aspectRatio === '1:1') {
          aspectRatioNum = 1;
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
          \${s},
          null,
          null,
          null,
          realProjectId,
          null,
          null,
          null,
          null,
          [recaptchaToken, 1]
        ];

        const referenceInputs = Array.isArray(params.referenceMediaIds) && params.referenceMediaIds.length > 0
          ? params.referenceMediaIds.map(id => [id, null, null, null, 1])
          : null;

        const modelKey = params.modelName || "NARWHAL";

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
              [[[ prompt ]]],
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
        const batchPath = \${JSON.stringify(i)};
        const reqId = Math.floor(Math.random() * 900000) + 100000;
        const url = batchPath + '?rpcids=' + encodeURIComponent(rpcId)
          + '&source-path=' + encodeURIComponent('/project/' + realProjectId)
          + '&bl=' + encodeURIComponent(bl)
          + '&f.sid=' + encodeURIComponent(fSid)
          + '&hl=en-US'
          + '&_reqid=' + reqId
          + '&rt=c';

        const bodyData = 'f.req=' + encodeURIComponent(JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, "generic"]]]))
          + '&at=' + encodeURIComponent(at)
          + '&';

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: bodyData,
          credentials: 'include'
        });

        const respText = await res.text();
        return {
          success: res.ok,
          status: res.status,
          responseText: respText,
          projectId: realProjectId,
          log: logs
        };

      } catch (err) {
        return {
          success: false,
          error: err.message,
          log: logs
        };
      }
    })()
  \`;}`;

// Replace zu
code = code.slice(0, zuStart) + newZuCode + code.slice(zuEnd);
console.log('✓ Replaced function zu');

// 2. Locate executeFlowImageRpc
const execStart = code.indexOf('async executeFlowImageRpc(');
if (execStart === -1) {
  console.error('❌ async executeFlowImageRpc not found');
  process.exit(1);
}

const execEnd = code.indexOf('async executeFlowUploadImageRpc(', execStart);
if (execEnd === -1) {
  console.error('❌ async executeFlowUploadImageRpc not found');
  process.exit(1);
}

console.log(`Found executeFlowImageRpc from ${execStart} to ${execEnd}`);

const newExecCode = `async executeFlowImageRpc(e,t,A,o){const n=Date.now();if(A?.aborted)throw new p("PROVIDER_REJECTED","Yêu cầu tạo ảnh đã bị hủy",!1);const a=await this.ensureGoogleFlowViewReady(e,A),s=zu({params:t,rpcConfig:o});y("browser-view","flow rpc: bắt đầu thực thi in-page script",{accountId:e.accountId,projectId:t.projectId,prompt:t.prompt.slice(0,50),referenceCount:t.referenceMediaIds?.length||0});const i=a.view.webContents.executeJavaScript(s,!0),c=18e4;let g;const u=new Promise((l,m)=>{g=setTimeout(()=>{m(new p("NETWORK","Google Flow RPC quá thời gian chờ ("+Math.round(c/1e3)+"s)",!0))},c)});let d;try{A?d=await Promise.race([i,u,new Promise((l,m)=>{A.addEventListener("abort",()=>m(new p("PROVIDER_REJECTED","Tác vụ tạo ảnh bị hủy",!1)),{once:!0})})]):d=await Promise.race([i,u])}finally{g&&clearTimeout(g)}if(d?.imageUrl){y("browser-view","flow rpc: tạo ảnh thành công qua web automation",{accountId:e.accountId,projectId:d.projectId,imageUrl:d.imageUrl,durationMs:Date.now()-n});return{imageUrl:d.imageUrl,width:d.width||1024,height:d.height||1024,providerAssetId:d.providerAssetId||('banana-asset-'+Date.now()),projectId:d.projectId||t.projectId,seed:d.seed||Math.floor(Math.random()*1e9)}}if(y("browser-view","flow rpc: kết quả in-page execution",{accountId:e.accountId,projectId:t.projectId,success:d.success,status:d.status,durationMs:Date.now()-n,error:d.error}),!d.success||!d.responseText)throw yt(d,d.error||("Google Flow RPC thất bại với status "+d.status));return Lu(d.responseText,t.projectId,o?.rpcIds?.imageGenerate||"ogiZ0b")}`;

// Replace executeFlowImageRpc
code = code.slice(0, execStart) + newExecCode + code.slice(execEnd);
console.log('✓ Replaced executeFlowImageRpc');

fs.writeFileSync(targetFile, code, 'utf8');
console.log(`✓ Saved patched ${targetFile}. Length: ${code.length}`);

// Validate syntax
try {
  execSync(`node --check "${targetFile}"`);
  console.log('🌟 SYNTAX VALID 100%! ZERO ERRORS! 🌟');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
  // Restore backup
  fs.copyFileSync(targetFile + '.before_banana_patch.bak', targetFile);
  console.log('Restored backup due to syntax error.');
  process.exit(1);
}
