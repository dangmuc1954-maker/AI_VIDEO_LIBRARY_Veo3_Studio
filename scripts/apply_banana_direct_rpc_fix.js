const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Replace defaultModel: "NARWHAL" with "GEM_PIX_2"
code = code.replace(/defaultModel:\s*"NARWHAL"/g, 'defaultModel:"GEM_PIX_2"');
console.log('✓ Updated defaultModel to GEM_PIX_2');

// 2. In Hm function, ensure GEM_PIX_2 is returned instead of NARWHAL
code = code.replace(/modelName:\s*"NARWHAL"/g, 'modelName:"GEM_PIX_2"');
console.log('✓ Updated all occurrences of NARWHAL to GEM_PIX_2');

// 3. Restore clean, high-speed pure RPC in zu
const zuStart = code.indexOf('function zu(');
const zuEnd = code.indexOf('function Ku(', zuStart);

if (zuStart === -1 || zuEnd === -1) {
  console.error('❌ Could not locate function zu / Ku');
  process.exit(1);
}

const newZuFunction = `function zu(r){const{params:e,timeoutMs:t=18e4,rpcConfig:A=qe}=r,o=A.recaptcha?.siteKey||Sn,n=A.recaptcha?.imageAction||"IMAGE_GENERATION",a=A.rpcIds?.imageGenerate||"ogiZ0b",s=A.clientContext?.clientVersionNumber??22,i=A.clientContext?.batchExecutePath||"/_/AiSandboxAngularFrontend/data/batchexecute",c=JSON.stringify(e),g=JSON.stringify(A.image?.aspectRatioMapping||qe.image.aspectRatioMapping),u=A.image?.defaultModel||qe.image.defaultModel||"GEM_PIX_2";return\`
    (async () => {
      const logs = [];
      function addLog(msg) {
        logs.push(new Date().toISOString().slice(11, 23) + ' ' + msg);
      }

      try {
        addLog('FlowImageRpc: Khoi chay pure RPC execution');
        const siteKey = \${JSON.stringify(o)};
        const params = \${c};

        // 1. Lay reCAPTCHA Enterprise Token
        let recaptchaToken = '';
        async function runRecaptchaExecute() {
          if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
            return await window.grecaptcha.enterprise.execute(siteKey, { action: \${JSON.stringify(n)} });
          }
          return '';
        }

        if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
          try {
            recaptchaToken = await runRecaptchaExecute();
          } catch (eErr) {
            addLog('Lỗi lấy reCAPTCHA trực tiếp: ' + eErr.message);
          }
        }

        if (!recaptchaToken) {
          const scriptId = 'aiforge-flow-recaptcha';
          let sEl = document.getElementById(scriptId);
          if (!sEl) {
            try {
              sEl = document.createElement('script');
              sEl.id = scriptId;
              let scriptUrl = 'https://www.google.com/recaptcha/enterprise.js?render=' + siteKey;
              sEl.src = scriptUrl;
              sEl.async = true;
              document.head.appendChild(sEl);
            } catch (_) {}
          }
          for (let k = 0; k < 40; k++) {
            if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
              try {
                recaptchaToken = await runRecaptchaExecute();
                if (recaptchaToken) break;
              } catch (_) {}
            }
            await new Promise(r => setTimeout(r, 200));
          }
        }

        if (!recaptchaToken) {
          return {
            success: false,
            error: 'Không thể lấy token reCAPTCHA Enterprise trên Google Flow',
            log: logs
          };
        }
        addLog('reCAPTCHA token san sang (' + recaptchaToken.length + ' chars)');

        // 2. Doc WIZ_global_data
        let at = window.WIZ_global_data?.SNlM0e;
        let fSid = window.WIZ_global_data?.FdrFJe;
        let bl = window.WIZ_global_data?.cfb2h || 'boq_labs-ai-sandbox-frontend_20261007.14_p0';

        if (!at || !fSid) {
          for (let k = 0; k < 25; k++) {
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
            error: 'Thiếu WIZ_global_data (SNlM0e / FdrFJe) trên Google Flow',
            log: logs
          };
        }

        // 3. Xac dinh realProjectId (uu tien URL thuc te tren tab Flow)
        const pathMatch = window.location.pathname.match(/\\/project\\/([a-f0-9-]+)/i);
        const effectiveProjectId = pathMatch ? pathMatch[1] : (params.projectId || 'b4ab78d0-1d67-460c-b367-c3a9766169c5');
        addLog('Effective Project ID: ' + effectiveProjectId);

        // 4. Model key chuan cho Banana tren Google Flow la GEM_PIX_2
        let modelKey = "GEM_PIX_2";
        if (params.modelName && params.modelName !== "NARWHAL") {
          modelKey = params.modelName;
        }

        // 5. Ty le khung hinh
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
          effectiveProjectId,
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
        const batchPath = \${JSON.stringify(i)};
        const reqId = Math.floor(Math.random() * 900000) + 100000;
        const url = batchPath + '?rpcids=' + encodeURIComponent(rpcId)
          + '&source-path=' + encodeURIComponent('/project/' + effectiveProjectId)
          + '&bl=' + encodeURIComponent(bl)
          + '&f.sid=' + encodeURIComponent(fSid)
          + '&hl=vi'
          + '&_reqid=' + reqId
          + '&rt=c';

        const bodyData = 'f.req=' + encodeURIComponent(JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, "generic"]]]))
          + '&at=' + encodeURIComponent(at)
          + '&';

        addLog('Gửi batchexecute RPC ' + rpcId + ' (model: ' + modelKey + ')...');
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
          projectId: effectiveProjectId,
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
  \`;}`;

code = code.slice(0, zuStart) + newZuFunction + code.slice(zuEnd);
console.log('✓ Replaced function zu with Pure High-Speed RPC');

// 4. Update executeFlowImageRpc to pass effective projectId to Lu
const execStart = code.indexOf('async executeFlowImageRpc(');
const execEnd = code.indexOf('async executeFlowUploadImageRpc(', execStart);

if (execStart === -1 || execEnd === -1) {
  console.error('❌ Could not locate executeFlowImageRpc');
  process.exit(1);
}

const newExecFunction = `async executeFlowImageRpc(e,t,A,o){const n=Date.now();if(A?.aborted)throw new p("PROVIDER_REJECTED","Yêu cầu tạo ảnh đã bị hủy",!1);const a=await this.ensureGoogleFlowViewReady(e,A),s=zu({params:t,rpcConfig:o});y("browser-view","flow rpc: bắt đầu thực thi in-page script",{accountId:e.accountId,projectId:t.projectId,prompt:t.prompt.slice(0,50),referenceCount:t.referenceMediaIds?.length||0});const i=a.view.webContents.executeJavaScript(s,!0),c=18e4;let g;const u=new Promise((l,m)=>{g=setTimeout(()=>{m(new p("NETWORK","Google Flow RPC quá thời gian chờ ("+Math.round(c/1e3)+"s)",!0))},c)});let d;try{A?d=await Promise.race([i,u,new Promise((l,m)=>{A.addEventListener("abort",()=>m(new p("PROVIDER_REJECTED","Tác vụ tạo ảnh bị hủy",!1)),{once:!0})})]):d=await Promise.race([i,u])}finally{g&&clearTimeout(g)}if(y("browser-view","flow rpc: kết quả in-page execution",{accountId:e.accountId,projectId:t.projectId,success:d.success,status:d.status,durationMs:Date.now()-n,error:d.error}),!d.success||!d.responseText)throw yt(d,d.error||("Google Flow RPC thất bại với status "+d.status));return Lu(d.responseText,d.projectId||t.projectId,o?.rpcIds?.imageGenerate||"ogiZ0b")}`;

code = code.slice(0, execStart) + newExecFunction + code.slice(execEnd);
console.log('✓ Replaced executeFlowImageRpc');

fs.writeFileSync(targetFile, code, 'utf8');
console.log(`✓ Saved patched ${targetFile}. Length: ${code.length}`);

// Validate syntax
try {
  execSync(`node --check "${targetFile}"`);
  console.log('🌟 SYNTAX 100% VALID! ZERO ERRORS! 🌟');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
  process.exit(1);
}
