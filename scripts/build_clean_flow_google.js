const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Take clean source from dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/main/index.js
const sourceFile = path.resolve('dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/out/main/index.js');
let code = fs.readFileSync(sourceFile, 'utf8');
console.log(`Original clean code length: ${code.length}`);

// 2. Update provider startUrls to https://flow.google.com/
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
console.log('[OK] 1. Updated provider startUrls to https://flow.google.com/');

// 3. Update readyUrlPatterns to include flow.google.com
code = code.replace(
  'readyUrlPatterns:[/(?:labs\\.google|flow\\.google\\.com)/i]',
  'readyUrlPatterns:[/flow\\.google\\.com/i,/labs\\.google/i]'
);
code = code.replace(
  'readyUrlPatterns:[/labs\\.google\\/fx/i]',
  'readyUrlPatterns:[/flow\\.google\\.com/i,/labs\\.google/i]'
);
console.log('[OK] 2. Updated readyUrlPatterns');

// 4. In getOrCreateView, install Google Flow network sniffer
const anchorView = 'const o={accountId:e.accountId,providerId:e.providerId,view:A,snapshotSequence:0,navigationSequence:0,diagnosticNetworkRequests:new Map,grokStatsigReadiness:new iu};return this.views.set(e.accountId,o),this.installGrokNetworkDiagnostics(o),o}';
const snifferRegistration = `try{
  if(e.providerId==="veo3"||e.providerId==="banana"){
    A.webContents.session.webRequest.onBeforeSendHeaders(
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
  }
}catch(_){}
`;

if (code.includes(anchorView)) {
  code = code.replace(
    anchorView,
    snifferRegistration + anchorView
  );
  console.log('[OK] 3. Installed Google Flow Network Sniffer in getOrCreateView');
} else {
  console.error('[WARN] anchorView not found for sniffer, checking partial');
  const partial = 'this.installGrokNetworkDiagnostics(o),o}';
  if (code.includes(partial)) {
    code = code.replace(partial, `this.installGrokNetworkDiagnostics(o),${snifferRegistration.replace(/\bA\b/g, 'o.view')}o}`);
    console.log('[OK] 3. Installed Google Flow Network Sniffer via partial anchor');
  }
}

// 5. Replace fetchAccessToken with multi-source token extractor
const fetchStartStr = 'async fetchAccessToken(e,t){';
const fetchEndAnchor = 'return this.store.upsertAccount(i);\n  }';

const fetchStartIdx = code.indexOf(fetchStartStr);
if (fetchStartIdx === -1) {
  console.error('[FAIL] fetchStartStr not found');
  process.exit(1);
}

const fetchEndIdx = code.indexOf(fetchEndAnchor, fetchStartIdx);
if (fetchEndIdx === -1) {
  console.error('[FAIL] fetchEndAnchor not found');
  process.exit(1);
}

const endOfFetch = fetchEndIdx + fetchEndAnchor.length;

const cleanFetchCode = `async fetchAccessToken(e,t){
    const o=this.store.getAccount(e.accountId);
    let token=null;
    let s=null;

    // 1. Check existing fresh token in account store
    if(o?.accessToken&&typeof o.accessToken==="string"&&o.accessToken.startsWith("ya29.")){
      token=o.accessToken;
    }

    // 2. Query active BrowserView webContents if available
    if(!token&&typeof Q!=="undefined"&&Q?.views){
      const v=Q.views.get(e.accountId);
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
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
              if(window.WIZ_global_data&&typeof window.WIZ_global_data==='object'){
                for(const k of Object.keys(window.WIZ_global_data)){
                  const val=String(window.WIZ_global_data[k]||'');
                  if(val.includes('ya29.')){
                    const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                    if(m)return m[0];
                  }
                }
              }
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

        if(!token){
          for(let step=0;step<6;step+=1){
            await new Promise(r=>setTimeout(r,500));
            const fresh=this.store.getAccount(e.accountId);
            if(fresh?.accessToken&&fresh.accessToken.startsWith("ya29.")){
              token=fresh.accessToken;
              break;
            }
          }
        }
      }
    }

    // 3. Fallback NextAuth if present
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
      throw new m("AUTH_REQUIRED","Tài khoản Google Flow chưa có API token. Vui lòng mở Browser Hub -> chọn Veo3 để tài khoản tự động nhận diện.",!0);
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

code = code.slice(0, fetchStartIdx) + cleanFetchCode + code.slice(endOfFetch);
console.log('[OK] 4. Replaced fetchAccessToken seamlessly');

// 6. Ensure guaranteed project pool fallback
const projAnchor = 'if(n.length>=ds){this.store.patchAccount(e.accountId,{projectIds:n});return}';
if (code.includes(projAnchor)) {
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
  
  const readTokenIdx = code.indexOf('const s=await this.readSessionToken(t);', code.indexOf(projAnchor));
  if (readTokenIdx !== -1) {
    code = code.slice(0, code.indexOf(projAnchor)) + projFallback + '\n    ' + code.slice(readTokenIdx);
    console.log('[OK] 5. Injected guaranteed project pool fallback');
  }
}

// 7. Write to app/out/main/index.js
const targetPath = path.resolve('app/out/main/index.js');
fs.writeFileSync(targetPath, code, 'utf8');
console.log(`[DONE] app/out/main/index.js successfully written. New length: ${code.length}`);

// 8. Verify syntax
try {
  execSync(`node --check "${targetPath}"`);
  console.log('🌟 SYNTAX VALID 100%! ZERO ERRORS! 🌟');
} catch (err) {
  console.error('❌ SYNTAX ERROR:', err.message);
  process.exit(1);
}
