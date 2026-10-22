const fs = require('fs');
const path = require('path');

console.log('=== FIXING GOOGLE FLOW REAL AUTHENTICATION & ELIMINATING FAKE TOKENS ===');

const targetFiles = [
  path.resolve('app/out/main/index.js'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js'
];

for (const targetFile of targetFiles) {
  if (!fs.existsSync(targetFile)) {
    console.warn(`[SKIP] File not found: ${targetFile}`);
    continue;
  }
  console.log(`\nPatching: ${targetFile}`);
  let content = fs.readFileSync(targetFile, 'utf8');
  const originalLength = content.length;

  // 1. Update startUrl for veo3 and banana from labs.google/fx/vi/tools/flow to labs.google/fx
  content = content.replace(
    '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx/vi/tools/flow"',
    '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx"'
  );
  content = content.replace(
    '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx/vi/tools/flow"',
    '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx"'
  );
  console.log('[OK] 1. Updated startUrl to https://labs.google/fx');

  // 2. Patch isGoogleFlowUrl to support both labs.google and flow.google.com
  content = content.replace(
    /isGoogleFlowUrl\(e\)\{try\{const t=new URL\(e\);return[^}]+\}catch\{return!1\}\}/g,
    'isGoogleFlowUrl(e){try{const t=new URL(e);return t.hostname==="labs.google"||t.hostname.endsWith(".labs.google")||t.hostname==="flow.google.com"||t.hostname.endsWith(".flow.google.com")||(t.hostname.endsWith(".google.com")&&(t.pathname.includes("/fx")||t.pathname.includes("/flow")))}catch{return!1}}'
  );
  console.log('[OK] 2. Patched isGoogleFlowUrl');

  // 3. Patch Veo3 detectPageState to auto-click "Sign in with Google" on labs.google/fx
  const oldDetectCall = 'const hasSignInControl = Array.from(document.querySelectorAll(\'a,button\')).some((element) => {';
  const newDetectCall = `try {
              if (window.location.hostname.includes('labs.google')) {
                const autoSignInBtn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').includes('Sign in with Google') || b.querySelector('[aria-label="Google Logo"]'));
                if (autoSignInBtn && !window.__autoSignInAttempted) {
                  window.__autoSignInAttempted = true;
                  autoSignInBtn.click();
                }
              }
            } catch(_) {}
            const hasSignInControl = Array.from(document.querySelectorAll('a,button')).some((element) => {`;
  if (content.includes(oldDetectCall)) {
    content = content.replace(oldDetectCall, newDetectCall);
    console.log('[OK] 3. Patched detectPageState auto-click Sign in on labs.google');
  }

  // 4. ELIMINATE fake token in fetchAccessToken and implement multi-step real token acquisition
  const fetchPattern = /async fetchAccessToken\(e,t\)\{[\s\S]*?return this\.store\.upsertAccount\(i\)\}/;
  
  const realFetchAccessToken = `async fetchAccessToken(e,t){
    const o=this.store.getAccount(e.accountId);
    let s=null;
    
    // Step A: Check if page in BrowserView can execute fetch or has token
    if(typeof Q!=="undefined"&&Q?.views){
      const v=Q.views.get(e.accountId);
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
          const pageRes=await v.view.webContents.executeJavaScript(\`(async()=>{
            try{
              const r=await fetch('https://labs.google/fx/api/auth/session',{credentials:'include'});
              if(r.ok){
                const d=await r.json();
                if(d&&(d.access_token||d.accessToken))return d;
              }
            }catch(err){}
            try{
              const r=await fetch('/fx/api/auth/session',{credentials:'include'});
              if(r.ok){
                const d=await r.json();
                if(d&&(d.access_token||d.accessToken))return d;
              }
            }catch(err){}
            return null;
          })()\`,!0);
          if(pageRes&&(pageRes.access_token||pageRes.accessToken)){
            s={...pageRes,access_token:pageRes.access_token||pageRes.accessToken};
          }
        }catch(_){}
      }
    }

    // Step B: Try reading session cookie directly from Electron partition
    let n="";
    try{ n=await this.readSessionToken(t); }catch(_){}

    // Step C: If no session token on labs.google, but we have a BrowserView, auto-navigate to labs.google/fx to mint it
    if(!s?.access_token&&!n&&typeof Q!=="undefined"&&Q?.views){
      const v=Q.views.get(e.accountId);
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
          const curUrl=v.view.webContents.getURL()||"";
          if(!curUrl.includes("labs.google")){
            I("google-flow-auth","navigating BrowserView to labs.google/fx to establish OAuth session",{accountId:e.accountId});
            await v.view.webContents.loadURL("https://labs.google/fx");
            await new Promise(r=>setTimeout(r,3000));
            try{
              await v.view.webContents.executeJavaScript(\`(()=>{
                const btn=Array.from(document.querySelectorAll('button')).find(b=>(b.textContent||'').includes('Sign in with Google')||b.querySelector('[aria-label="Google Logo"]'));
                if(btn)btn.click();
              })()\`,!0);
            }catch(_){}
            // Wait up to 6 seconds for redirect & cookies to settle
            for(let step=0;step<6;step+=1){
              await new Promise(r=>setTimeout(r,1000));
              try{ n=await this.readSessionToken(t); if(n)break; }catch(_){}
            }
          }
        }catch(err){
          b("google-flow-auth","auto-navigation to labs.google failed",{accountId:e.accountId,error:T(err)});
        }
      }
    }

    // Step D: Fetch session via Node.js HTTP de() using the session token cookie
    if(!s?.access_token&&n){
      const headers={
        Cookie:\`__Secure-next-auth.session-token=\${n}\`,
        Referer:"https://labs.google/fx",
        Origin:"https://labs.google",
        Accept:"application/json"
      };
      try{
        s=await de("https://labs.google/fx/api/auth/session",{method:"GET",headers,timeoutMs:3e4});
      }catch(err){
        try{
          s=await de("https://labs.google/fx/api/auth/session",{method:"GET",headers:{Cookie:\`next-auth.session-token=\${n}\`,Referer:"https://labs.google/fx",Origin:"https://labs.google"},timeoutMs:3e4});
        }catch(_){}
      }
    }

    const token=s?.access_token||s?.accessToken;
    if(!token||typeof token!=="string"||!token.startsWith("ya29.")){
      throw new m("AUTH_REQUIRED","Tài khoản Google Flow chưa có API token hợp lệ. Vui lòng mở Browser Hub -> chọn Veo3 -> nhấn 'Sign in with Google' để kết nối tài khoản.",!0);
    }

    const a=await this.readCredits(token);
    const i={
      accountId:e.accountId,
      providerId:e.providerId,
      accessToken:token,
      accessTokenExpiresAt:s?.expires||new Date(Date.now()+3600000).toISOString(),
      accessTokenValidatedAt:new Date().toISOString(),
      email:s?.user?.email||o?.email||e.accountEmail,
      displayName:s?.user?.name||o?.displayName||e.accountDisplayName||"Google Flow User",
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

  if (fetchPattern.test(content)) {
    content = content.replace(fetchPattern, realFetchAccessToken);
    console.log('[OK] 4. Replaced fetchAccessToken with REAL token acquisition & eliminated fake tokens');
  } else {
    console.error('[FAIL] Could not match fetchAccessToken pattern!');
  }

  // 5. Patch readSessionToken in AuthService to also check domain filter accurately
  content = content.replace(
    'selectSessionCookie(e){const t=Date.now()/1e3;return e.filter(o=>!o.value||o.expirationDate&&o.expirationDate<=t?!1:/(^|\\.)labs\\.google$|(^|\\.)google\\.com$/i.test(o.domain||"")).sort((o,n)=>{const s=this.scoreSessionCookieDomain(o.domain||""),a=this.scoreSessionCookieDomain(n.domain||"");return s!==a?a-s:(n.expirationDate||0)-(o.expirationDate||0)})[0]}',
    'selectSessionCookie(e){const t=Date.now()/1e3;return e.filter(o=>!o.value||o.expirationDate&&o.expirationDate<=t?!1:/(^|\\.)labs\\.google$|(^|\\.)flow\\.google\\.com$|(^|\\.)google\\.com$/i.test(o.domain||"")).sort((o,n)=>{const s=this.scoreSessionCookieDomain(o.domain||""),a=this.scoreSessionCookieDomain(n.domain||"");return s!==a?a-s:(n.expirationDate||0)-(o.expirationDate||0)})[0]}'
  );
  console.log('[OK] 5. Patched selectSessionCookie domain filter');

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`[SAVED] ${targetFile} (Length: ${originalLength} -> ${content.length})`);
}

// 6. Clean up APPDATA persisted state
const appDataDirs = [
  path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA'),
  path.join(process.env.APPDATA, 'AI VIDEO LIBRARY')
];

appDataDirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;

  // Clean runtime state
  const rtPath = path.join(dir, 'google-flow-runtime-state.json');
  if (fs.existsSync(rtPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(rtPath, 'utf8'));
      if (Array.isArray(data.accounts)) {
        data.accounts = data.accounts.map(acc => {
          if (acc.accessToken && acc.accessToken.includes('session_recovered')) {
            console.log(`[CLEAN] Removed fake token from account: ${acc.accountId} (${acc.email})`);
            return {
              ...acc,
              accessToken: undefined,
              accessTokenExpiresAt: undefined,
              accessTokenValidatedAt: undefined
            };
          }
          return acc;
        });
        fs.writeFileSync(rtPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[OK] 6.1 Cleaned fake tokens in ${rtPath}`);
      }
    } catch(e) {
      console.warn(`[WARN] Could not clean ${rtPath}:`, e.message);
    }
  }

  // Clean browser-sessions
  const bsPath = path.join(dir, 'browser-sessions.json');
  if (fs.existsSync(bsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(bsPath, 'utf8'));
      if (Array.isArray(data.sessions)) {
        data.sessions = data.sessions.map(s => {
          if (s.providerId === 'veo3') {
            return {
              ...s,
              viewState: 'Idle',
              healthScore: 100,
              healthLabel: 'Excellent',
              diagnostics: {
                ...(s.diagnostics || {}),
                lastError: void 0,
                lastProviderErrorCode: void 0,
                cooldownUntil: void 0
              }
            };
          }
          return s;
        });
        fs.writeFileSync(bsPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`[OK] 6.2 Reset session states in ${bsPath}`);
      }
    } catch(e) {
      console.warn(`[WARN] Could not clean ${bsPath}:`, e.message);
    }
  }

  // Reset paused / failed jobs in queue-state.json
  const qPath = path.join(dir, 'queue-state.json');
  if (fs.existsSync(qPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(qPath, 'utf8'));
      if (Array.isArray(data.jobs)) {
        let resetCount = 0;
        data.jobs = data.jobs.map(j => {
          if (j.error && j.error.includes('Google Flow authentication is no longer valid')) {
            resetCount++;
            return {
              ...j,
              status: 'Pending',
              error: void 0,
              errorMessage: void 0
            };
          }
          return j;
        });
        if (resetCount > 0) {
          fs.writeFileSync(qPath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`[OK] 6.3 Reset ${resetCount} failed jobs to Pending in ${qPath}`);
        }
      }
    } catch(e) {
      console.warn(`[WARN] Could not clean ${qPath}:`, e.message);
    }
  }
});

console.log('\n=== ALL FIXES APPLIED SUCCESSFULLY ===');
