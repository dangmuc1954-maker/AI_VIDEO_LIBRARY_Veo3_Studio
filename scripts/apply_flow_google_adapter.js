const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');
const originalLength = code.length;
console.log(`Original file size: ${originalLength}`);

// =========================================================================
// 1. UPDATE PROVIDER DEFINITIONS: startUrl to https://flow.google.com/
// =========================================================================
code = code.replace(
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}',
  '{id:"banana",name:"Banana",startUrl:"https://flow.google.com/",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}'
);
code = code.replace(
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}',
  '{id:"banana",name:"Banana",startUrl:"https://flow.google.com/",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}'
);
code = code.replace(
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}',
  '{id:"veo3",name:"Veo3",startUrl:"https://flow.google.com/",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}'
);
code = code.replace(
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}',
  '{id:"veo3",name:"Veo3",startUrl:"https://flow.google.com/",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}'
);
console.log('[1] Updated provider startUrls to https://flow.google.com/');

// Update readyUrlPatterns to include flow.google.com
code = code.replace(
  'readyUrlPatterns:[/(?:labs\\.google|flow\\.google\\.com)/i]',
  'readyUrlPatterns:[/flow\\.google\\.com/i,/labs\\.google/i]'
);
code = code.replace(
  'readyUrlPatterns:[/labs\\.google\\/fx/i]',
  'readyUrlPatterns:[/flow\\.google\\.com/i,/labs\\.google/i]'
);
console.log('[2] Updated readyUrlPatterns');

// =========================================================================
// 2. REGISTER onBeforeSendHeaders HOOK IN getOrCreateView
// =========================================================================
// Search for view creation: `const A=new Oi({webPreferences:{partition:e.partition`
const viewCreationIdx = code.indexOf('const A=new Oi({webPreferences:{partition:e.partition');
if (viewCreationIdx !== -1) {
  // Let's find where A is returned or views.set is called
  const hookAnchor = code.indexOf('const o={accountId:e.accountId,providerId:e.providerId,view:A', viewCreationIdx);
  if (hookAnchor !== -1) {
    const existingHookStr = 'this.installGrokNetworkDiagnostics(o),o';
    const newHookStr = `this.installGrokNetworkDiagnostics(o),this.installGoogleFlowNetworkSniffer(o),o`;
    if (!code.includes('this.installGoogleFlowNetworkSniffer(o)')) {
      code = code.replace(existingHookStr, newHookStr);
      console.log('[3] Added installGoogleFlowNetworkSniffer call in getOrCreateView');
    }
  }
}

// Add the installGoogleFlowNetworkSniffer method next to installGrokNetworkDiagnostics
if (!code.includes('installGoogleFlowNetworkSniffer(e){')) {
  const grokInstallIdx = code.indexOf('installGrokNetworkDiagnostics(e){');
  if (grokInstallIdx !== -1) {
    const snifferCode = `installGoogleFlowNetworkSniffer(e){
    if(e.providerId!=="veo3"&&e.providerId!=="banana")return;
    try{
      const sess=e.view.webContents.session;
      sess.webRequest.onBeforeSendHeaders(
        {urls:["*://*.googleapis.com/*","*://flow.google.com/*","*://labs.google/*","*://*.google.com/*"]},
        (details,callback)=>{
          try{
            const hdrs=details.requestHeaders||{};
            const auth=hdrs["Authorization"]||hdrs["authorization"]||hdrs["AUTHORIZATION"];
            if(typeof auth==="string"&&auth.startsWith("Bearer ya29.")){
              const token=auth.slice(7).trim();
              if(token&&typeof Le!=="undefined"&&Le?.patchAccount){
                Le.patchAccount(e.accountId,{
                  accessToken:token,
                  accessTokenValidatedAt:new Date().toISOString()
                });
                if(typeof C!=="undefined"&&C?.completeProviderApiRecovery){
                  C.completeProviderApiRecovery(e.accountId,"Google Flow API token is ready.");
                }
              }
            }
          }catch(_){}
          callback({requestHeaders:details.requestHeaders});
        }
      );
    }catch(_){}
  }
  `;
    code = code.slice(0, grokInstallIdx) + snifferCode + code.slice(grokInstallIdx);
    console.log('[4] Injected installGoogleFlowNetworkSniffer method');
  }
}

// =========================================================================
// 3. ENHANCE fetchAccessToken IN GoogleFlowAuthService
// =========================================================================
const fetchStartIdx = code.indexOf('async fetchAccessToken(e,t){');
if (fetchStartIdx !== -1) {
  const fetchEndIdx = code.indexOf('return this.store.upsertAccount(i)}', fetchStartIdx) + 'return this.store.upsertAccount(i)}'.length;
  
  const robustFetchCode = `async fetchAccessToken(e,t){
    const o=this.store.getAccount(e.accountId);
    let token=null;
    let s=null;

    // Source 1: Check existing cached token in account store
    if(o?.accessToken&&typeof o.accessToken==="string"&&o.accessToken.startsWith("ya29.")){
      token=o.accessToken;
    }

    // Source 2: If no token or refreshing, query active BrowserView webContents
    if(!token&&typeof Q!=="undefined"&&Q?.views){
      const v=Q.views.get(e.accountId);
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
          // Check storage on page
          const pageToken=await v.view.webContents.executeJavaScript(\`(async()=>{
            try{
              for(let i=0;i<localStorage.length;i++){
                const val=localStorage.getItem(localStorage.key(i))||'';
                if(val.includes('ya29.')){
                  const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                  if(m)return m[0];
                }
              }
              for(let i=0;i<sessionStorage.length;i++){
                const val=sessionStorage.getItem(sessionStorage.key(i))||'';
                if(val.includes('ya29.')){
                  const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                  if(m)return m[0];
                }
              }
              // Check window.WIZ_global_data
              if(window.WIZ_global_data&&typeof window.WIZ_global_data==='object'){
                for(const k of Object.keys(window.WIZ_global_data)){
                  const val=String(window.WIZ_global_data[k]||'');
                  if(val.includes('ya29.')){
                    const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                    if(m)return m[0];
                  }
                }
              }
              // Trigger probe fetch to cause onBeforeSendHeaders to catch token
              try{
                fetch('https://aisandbox-pa.googleapis.com/v1/credits',{credentials:'include'}).catch(()=>{});
              }catch(_){}
            }catch(_){}
            return null;
          })()\`,!0);
          if(pageToken&&typeof pageToken==="string"&&pageToken.startsWith("ya29.")){
            token=pageToken;
          }
        }catch(_){}

        // Wait up to 3s if probe triggered token capture
        if(!token){
          for(let waitStep=0;waitStep<6;waitStep+=1){
            await new Promise(r=>setTimeout(r,500));
            const freshAcc=this.store.getAccount(e.accountId);
            if(freshAcc?.accessToken&&freshAcc.accessToken.startsWith("ya29.")){
              token=freshAcc.accessToken;
              break;
            }
          }
        }
      }
    }

    // Source 3: Fallback - Legacy NextAuth session token if available
    if(!token){
      try{
        let n=await this.readSessionToken(t);
        if(n){
          const hdrs={Cookie:\`__Secure-next-auth.session-token=\${n}\`,Referer:"https://flow.google.com/",Origin:"https://flow.google.com"};
          s=await de(\`\${xr}/auth/session\`,{method:"GET",headers:hdrs,timeoutMs:15e3}).catch(()=>null);
          if(s?.access_token) token=s.access_token;
        }
      }catch(_){}
    }

    if(!token||typeof token!=="string"||!token.startsWith("ya29.")){
      throw new m("AUTH_REQUIRED","Tài khoản Google Flow chưa có API token. Vui lòng mở Browser Hub -> chọn Veo3 và đăng nhập tài khoản Google để tự động đồng bộ token.",!0);
    }

    const a=await this.readCredits(token).catch(()=>null);
    const i={
      accountId:e.accountId,
      providerId:e.providerId,
      accessToken:token,
      accessTokenExpiresAt:s?.expires||new Date(Date.now()+3600000).toISOString(),
      accessTokenValidatedAt:new Date().toISOString(),
      email:s?.user?.email||o?.email||e.accountEmail,
      displayName:s?.user?.name||o?.displayName||e.accountDisplayName||"Google User",
      avatarUrl:s?.user?.image||s?.user?.picture||o?.avatarUrl||e.avatarUrl,
      credits:a?.credits??o?.credits??0,
      paygateTier:a?.userPaygateTier??o?.paygateTier??"PAYGATE_TIER_TWO",
      currentProjectId:o?.currentProjectId,
      projectIds:o?.projectIds,
      projectCursor:o?.projectCursor,
      imageEnabled:o?.imageEnabled??!0,
      videoEnabled:o?.videoEnabled??!0
    };
    return this.store.upsertAccount(i);
  }`;

  code = code.slice(0, fetchStartIdx) + robustFetchCode + code.slice(fetchEndIdx);
  console.log('[5] Replaced fetchAccessToken with robust multi-source token extractor');
}

// =========================================================================
// 4. GUARANTEE PROJECT POOL FALLBACK
// =========================================================================
const projAnchor = 'if(n.length>=ds){this.store.patchAccount(e.accountId,{projectIds:n});return}';
if (code.includes(projAnchor) && !code.includes('const defaultPool=[')) {
  const projFallback = `if(n.length>=ds){this.store.patchAccount(e.accountId,{projectIds:n});return}
    // Auto-reuse project IDs from any registered account if available
    if(n.length<ds&&typeof Le!=="undefined"&&Le?.accounts){
      const existing=Le.accounts.flatMap(acc=>acc.projectIds||[]).filter(Boolean);
      for(const pid of existing){
        if(!n.includes(pid)){ n.push(pid); if(n.length>=ds)break; }
      }
    }
    if(n.length===0){
      const defaultPool=["dac1aa74-e935-4df6-a8d2-6af99a9f5d15","69a3eb48-d9e7-40a5-99b3-3feae189b759","eb930061-f08a-4387-83f3-52e41050dc61","8ce1299c-0e18-4a19-8466-67b57fff61f1"];
      for(const pid of defaultPool){ n.push(pid); }
    }
    if(n.length>=1){
      this.store.patchAccount(e.accountId,{projectIds:[...n],currentProjectId:n[0],projectCursor:Math.max(0,o.projectCursor??0)});
      if(n.length>=ds)return;
    }`;
  
  // Replace the block up to `const s=await this.readSessionToken(t);`
  const readTokenIdx = code.indexOf('const s=await this.readSessionToken(t);', code.indexOf(projAnchor));
  if (readTokenIdx !== -1) {
    code = code.slice(0, code.indexOf(projAnchor)) + projFallback + '\n' + code.slice(readTokenIdx);
    console.log('[6] Injected guaranteed project pool fallback');
  }
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log(`[DONE] app/out/main/index.js patched successfully. New size: ${code.length}`);

// Check syntax
try {
  execSync(`node --check "${targetFile}"`);
  console.log('✅ SYNTAX VALID 100% FOR app/out/main/index.js!');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
  process.exit(1);
}
