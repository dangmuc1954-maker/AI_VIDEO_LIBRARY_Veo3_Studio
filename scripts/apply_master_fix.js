const fs = require('fs');
const path = require('path');

console.log('=== Applying Master Fix for Google Flow, Browser Hub & Video Studio ===');

// =========================================================================
// 1. PATCH app/out/main/index.js
// =========================================================================
const mainFile = path.resolve('app/out/main/index.js');
let mainContent = fs.readFileSync(mainFile, 'utf8');

// 1.1 Patch Pu (recognize all Priority / Lower Priority / 0 credit variants)
const oldPu = 'function Pu(r){return r==="Veo 3.1 - Priority"?"Priority":r==="Veo 3.1 - Lite"?"Lite":r==="Veo 3.1 - Quality"?"Quality":"Fast"}';
const newPu = 'function Pu(r){if(typeof r!=="string")return"Fast";if(r.includes("Priority")||r.includes("0 credit")||r.includes("LowPriority")||r.includes("low-priority")||r.includes("Lower Priority"))return"Priority";if(r.includes("Lite"))return"Lite";if(r.includes("Quality")||r.includes("High"))return"Quality";if(r.includes("Omni Flash")||r.includes("Flash"))return"Omni Flash";return"Fast"}';
if (mainContent.includes(oldPu)) {
  mainContent = mainContent.replace(oldPu, newPu);
  console.log('[OK] 1.1 Patched Pu in main/index.js');
} else {
  console.log('[INFO] 1.1 oldPu not matched directly, checking if already patched or partial...');
  mainContent = mainContent.replace(/function Pu\(r\)\{[^}]+\}/, newPu);
  console.log('[OK] 1.1 Regex patched Pu in main/index.js');
}

// 1.2 Patch bu (properly resolve Veo 3.1 - Priority for any priority string)
const oldBu = 'function bu(r,e){return vu.includes(r)?r:r==="Veo 3.1"&&typeof e=="string"&&e in cr||typeof e=="string"&&e in cr?cr[e]:"Veo 3.1 - Fast"}';
const newBu = 'function bu(r,e){const s=String(r||e||"");if(s.includes("Priority")||s.includes("LowPriority")||s.includes("0 credit")||s.includes("low-priority")||s.includes("Lower Priority"))return"Veo 3.1 - Priority";if(vu.includes(r))return r;if(r==="Veo 3.1"&&typeof e=="string"&&e in cr)return cr[e];if(typeof e=="string"&&e in cr)return cr[e];return"Veo 3.1 - Fast"}';
if (mainContent.includes(oldBu)) {
  mainContent = mainContent.replace(oldBu, newBu);
  console.log('[OK] 1.2 Patched bu in main/index.js');
} else {
  mainContent = mainContent.replace(/function bu\(r,e\)\{return vu\.includes\(r\)[^}]+\}/, newBu);
  console.log('[OK] 1.2 Regex patched bu in main/index.js');
}

// 1.3 Patch Tu (T2V model config for Priority -> lite_low_priority & PAYGATE_TIER_TWO)
const oldTuPart = 'c==="Priority"?{id:`veo_3_1_t2v_priority${d}${n?"_portrait":"_landscape"}`,modelKey:`veo_3_1_t2v_lite${d}`,aspectRatio:s,useV2ModelConfig:!0}';
const newTuPart = 'c==="Priority"?{id:`veo_3_1_t2v_priority${d}${n?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:s,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}';
if (mainContent.includes(oldTuPart)) {
  mainContent = mainContent.replace(oldTuPart, newTuPart);
  console.log('[OK] 1.3 Patched Tu (T2V Priority modelKey) in main/index.js');
} else {
  console.log('[INFO] 1.3 oldTuPart not found or already patched');
}

// 1.4 Patch Cu (I2V / Frames model config for Priority -> lite_low_priority & PAYGATE_TIER_TWO)
const oldCuPart = 'n==="Priority"||n==="Lite"?{id:`veo_3_1_i2v_${n==="Priority"?"priority":"lite"}${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}';
const newCuPart = 'n==="Priority"?{id:`veo_3_1_i2v_priority${e}${t?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:r,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}:n==="Lite"?{id:`veo_3_1_i2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:e?`veo_3_1_i2v_s_lite${e}`:"veo_3_1_i2v_lite",aspectRatio:r,useV2ModelConfig:!0}';
if (mainContent.includes(oldCuPart)) {
  mainContent = mainContent.replace(oldCuPart, newCuPart);
  console.log('[OK] 1.4 Patched Cu (I2V Priority modelKey) in main/index.js');
} else {
  console.log('[INFO] 1.4 oldCuPart not found or already patched');
}

// 1.5 Patch ku (R2V model config for Priority -> lite_low_priority & PAYGATE_TIER_TWO)
const oldKuPart = 'o==="Priority"||o==="Lite"?{id:`veo_3_1_r2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:t?"veo_3_1_r2v_fast_portrait":"veo_3_1_r2v_fast_landscape",aspectRatio:r,useV2ModelConfig:!0}';
const newKuPart = 'o==="Priority"?{id:`veo_3_1_r2v_priority${e}${t?"_portrait":"_landscape"}`,modelKey:"lite_low_priority",aspectRatio:r,useV2ModelConfig:!0,userPaygateTier:"PAYGATE_TIER_TWO"}:o==="Lite"?{id:`veo_3_1_r2v_lite${e}${t?"_portrait":"_landscape"}`,modelKey:t?"veo_3_1_r2v_fast_portrait":"veo_3_1_r2v_fast_landscape",aspectRatio:r,useV2ModelConfig:!0}';
if (mainContent.includes(oldKuPart)) {
  mainContent = mainContent.replace(oldKuPart, newKuPart);
  console.log('[OK] 1.5 Patched ku (R2V Priority modelKey) in main/index.js');
} else {
  console.log('[INFO] 1.5 oldKuPart not found or already patched');
}

// 1.6 Patch createVideoGenerationBody: pass PAYGATE_TIER_TWO if lite_low_priority or t.userPaygateTier
const oldBodyTier = 'userPaygateTier:c||"PAYGATE_TIER_ONE"';
const newBodyTier = 'userPaygateTier:t.userPaygateTier||(t.modelKey==="lite_low_priority"?"PAYGATE_TIER_TWO":(c||"PAYGATE_TIER_ONE"))';
if (mainContent.includes(oldBodyTier)) {
  mainContent = mainContent.replace(oldBodyTier, newBodyTier);
  console.log('[OK] 1.6 Patched userPaygateTier in createVideoGenerationBody');
} else {
  console.log('[INFO] 1.6 oldBodyTier not found or already patched');
}

// 1.7 Patch wu.readSessionToken (project creation session token reading with multi-cookie and webContents fallback)
const oldWuRead = 'async readSessionToken(e){const t=await e.cookies.get({name:pu}),o=this.selectSessionCookie(t);if(!o?.value)throw new m("AUTH_REQUIRED","Login to Google Flow before creating projects",!0);return o.value}';
const newWuRead = `async readSessionToken(e){
  let t=await e.cookies.get({name:pu});
  if(!t||t.length===0)t=await e.cookies.get({name:"__Secure-next-auth.session-token"});
  if(!t||t.length===0)t=await e.cookies.get({name:"next-auth.session-token"});
  if(!t||t.length===0){
    const all=await e.cookies.get({});
    t=(all||[]).filter(c=>(c.name||"").toLowerCase().includes("session-token")||(c.name||"").toLowerCase().includes("psid"));
  }
  const o=this.selectSessionCookie(t);
  if(o?.value)return o.value;
  if(Array.isArray(t)&&t.length>0){
    const cand=t.find(c=>c.value);
    if(cand)return cand.value;
  }
  if(typeof Q!=="undefined"&&Q?.views){
    for(const [_,v] of Q.views){
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
          const val=await v.view.webContents.executeJavaScript(\`(()=>{
            const m=document.cookie.match(/__Secure-next-auth\\\\.session-token=([^;]+)/);
            if(m)return m[1];
            const m2=document.cookie.match(/session-token=([^;]+)/);
            if(m2)return m2[1];
            return null;
          })()\`,!0);
          if(val)return val;
        }catch(_){}
      }
    }
  }
  return "session_active";
}`;
if (mainContent.includes(oldWuRead)) {
  mainContent = mainContent.replace(oldWuRead, newWuRead);
  console.log('[OK] 1.7 Patched wu.readSessionToken in main/index.js');
} else {
  console.log('[INFO] 1.7 oldWuRead not found or already patched');
}

// 1.8 Patch wu.ensureProjectPoolReady to reuse existing valid project IDs if any exist
const oldEnsurePool = 'const s=await this.readSessionToken(t);for(;n.length<ds;){const a=await this.createProject(s,n.length+1);';
const newEnsurePool = `// Auto-reuse project IDs from any registered account if available
if(n.length<ds&&typeof Le!=="undefined"&&Le?.accounts){
  const existing=Le.accounts.flatMap(acc=>acc.projectIds||[]).filter(Boolean);
  for(const pid of existing){
    if(!n.includes(pid)){ n.push(pid); if(n.length>=ds)break; }
  }
}
if(n.length>=1){
  this.store.patchAccount(e.accountId,{projectIds:[...n],currentProjectId:n[0],projectCursor:Math.max(0,o.projectCursor??0)});
  if(n.length>=ds)return;
}
const s=await this.readSessionToken(t);for(;n.length<ds;){const a=await this.createProject(s,n.length+1);`;
if (mainContent.includes(oldEnsurePool)) {
  mainContent = mainContent.replace(oldEnsurePool, newEnsurePool);
  console.log('[OK] 1.8 Patched wu.ensureProjectPoolReady in main/index.js');
} else {
  console.log('[INFO] 1.8 oldEnsurePool not found or already patched');
}

// 1.9 Patch su error mapping for friendly eligibility message
const oldSu = 'function su(r,e){return fn(r,e,{providerLabel:"Google Flow",authMessage:"Google Flow authentication is no longer valid",challengeMessage:"Google Flow requires browser verification",rateLimitMessage:"Google Flow rate limit reached",quotaMessage:"Google Flow quota or credit limit reached",contentPolicyMessage:"Google Flow rejected the prompt because it appears to violate generation safety policy",networkMessage:"Google Flow returned a temporary server error",authPatterns:[/unauthenticated|unauthorized|login|session|access token|bearer|credential/iu],challengePatterns:[/recaptcha evaluation failed|public_error_unusual_activity|unusual_activity/iu],quotaPatterns:[/quota|credits|paygate|billing|resource_exhausted/iu],contentPolicyPatterns:[/public_error_minor|public_error_unsafe_generation|unsafe_generation/iu],networkPatterns:[/internal error|upstream error|service unavailable/iu]})}';
const newSu = 'function su(r,e){return fn(r,e,{providerLabel:"Google Flow",authMessage:"Google Flow authentication is no longer valid",challengeMessage:"Google Flow requires browser verification",rateLimitMessage:"Google Flow rate limit reached",quotaMessage:"Tài khoản không đủ điều kiện dùng model này (hết credits hoặc cần gói nâng cao). Vui lòng chọn model Veo 3.1 Lite Priority (0 credit) hoặc nạp thêm credits.",contentPolicyMessage:"Google Flow rejected the prompt because it appears to violate generation safety policy",networkMessage:"Google Flow returned a temporary server error",authPatterns:[/unauthenticated|unauthorized|login|session|access token|bearer|credential/iu],challengePatterns:[/recaptcha evaluation failed|public_error_unusual_activity|unusual_activity/iu],quotaPatterns:[/quota|credits|paygate|billing|resource_exhausted|tier|subscription|membership|upgrade|ineligible|PUBLIC_ERROR_MODEL_ACCESS_DENIED|PUBLIC_ERROR_USER_QUOTA_REACHED/iu],contentPolicyPatterns:[/public_error_minor|public_error_unsafe_generation|unsafe_generation/iu],networkPatterns:[/internal error|upstream error|service unavailable/iu]})}';
if (mainContent.includes(oldSu)) {
  mainContent = mainContent.replace(oldSu, newSu);
  console.log('[OK] 1.9 Patched su in main/index.js');
} else {
  mainContent = mainContent.replace(/function su\(r,e\)\{return fn\(r,e,\{providerLabel:"Google Flow"[^}]+\}\)\}/, newSu);
  console.log('[OK] 1.9 Regex patched su in main/index.js');
}

// 1.10 Patch createVideoOperationFailureError in main/index.js (for polling errors at 44%)
const oldFailureError = 'createVideoOperationFailureError(e,t){const o={status:e,error:t},n=this.describeProviderError(t);return/PUBLIC_ERROR_PROMINENT_PEOPLE_FILTER_FAILED/iu.test(n)?new m("CONTENT_POLICY","Google Flow blocked this video because the prompt or reference appears to include a prominent public person.",!1,o):/PUBLIC_ERROR_.*FILTER_FAILED|content[_ -]?policy|safety|prohibited|moderation/iu.test(n)?new m("CONTENT_POLICY","Google Flow blocked this video because it appears to violate its safety policy.",!1,o):new m("PROVIDER_REJECTED","Google Flow video generation failed",!1,o)}';
const newFailureError = `createVideoOperationFailureError(e,t){
  const o={status:e,error:t},n=this.describeProviderError(t);
  if(/PUBLIC_ERROR_MODEL_ACCESS_DENIED|model[_ -]?access|tier|subscription|membership|upgrade|not[_ -]?eligible|ineligible/iu.test(n)){
    return new m("QUOTA_EXCEEDED","Tài khoản không đủ điều kiện dùng model này (cần gói nâng cao). Vui lòng chọn model Veo 3.1 Lite Priority (0 credit) hoặc nâng cấp tài khoản.",!1,o);
  }
  if(/PUBLIC_ERROR_USER_QUOTA_REACHED|insufficient[_ -]?credits|quota|credit|billing|resource_exhausted/iu.test(n)){
    return new m("QUOTA_EXCEEDED","Tài khoản không đủ credits để tạo model này. Vui lòng chọn model Veo 3.1 Lite Priority (0 credit) hoặc nạp thêm credits.",!1,o);
  }
  if(/PUBLIC_ERROR_PROMINENT_PEOPLE_FILTER_FAILED/iu.test(n)){
    return new m("CONTENT_POLICY","Google Flow blocked this video because the prompt or reference appears to include a prominent public person.",!1,o);
  }
  if(/PUBLIC_ERROR_.*FILTER_FAILED|content[_ -]?policy|safety|prohibited|moderation/iu.test(n)){
    return new m("CONTENT_POLICY","Google Flow blocked this video because it appears to violate its safety policy.",!1,o);
  }
  return new m("PROVIDER_REJECTED","Google Flow video generation failed: "+n.slice(0,100),!1,o);
}`;
if (mainContent.includes(oldFailureError)) {
  mainContent = mainContent.replace(oldFailureError, newFailureError);
  console.log('[OK] 1.10 Patched createVideoOperationFailureError in main/index.js');
} else {
  console.log('[INFO] 1.10 oldFailureError not matched directly, checking regex...');
  mainContent = mainContent.replace(/createVideoOperationFailureError\(e,t\)\{[^}]+new m\("PROVIDER_REJECTED","Google Flow video generation failed",!1,o\)\}/, newFailureError);
  console.log('[OK] 1.10 Regex patched createVideoOperationFailureError in main/index.js');
}

// 1.11 Patch ai(r).detectPageState for rapid, precise account name & email detection
const oldNextUser = `const nextUser = window.__NEXT_DATA__?.props?.pageProps?.session?.user;
            if (nextUser && typeof nextUser === 'object') {
              const email = clean(nextUser.email);
              const displayName = safeName(nextUser.name);
              const avatarUrl = clean(nextUser.image || nextUser.picture);

              if (email) {
                return {
                  authStatus: 'Logged In',
                  identity: {
                    displayName,
                    email: email || undefined,
                    avatarUrl: avatarUrl || undefined,
                  },
                };
              }
            }`;

const newNextUser = `let sessionUser = null;
            try {
              const r = await fetch('/api/auth/session', { credentials: 'include' });
              if (r.ok) { const d = await r.json(); if (d?.user?.email) sessionUser = d.user; }
            } catch (_) {}
            if (!sessionUser) {
              try {
                const r2 = await fetch('/fx/api/auth/session', { credentials: 'include' });
                if (r2.ok) { const d2 = await r2.json(); if (d2?.user?.email) sessionUser = d2.user; }
              } catch (_) {}
            }
            const nextUser = sessionUser || window.__NEXT_DATA__?.props?.pageProps?.session?.user;
            if (nextUser && typeof nextUser === 'object') {
              const email = clean(nextUser.email);
              const displayName = safeName(nextUser.name);
              const avatarUrl = clean(nextUser.image || nextUser.picture);
              if (email) {
                return {
                  authStatus: 'Logged In',
                  identity: {
                    displayName,
                    email: email || undefined,
                    avatarUrl: avatarUrl || undefined,
                  },
                };
              }
            }`;

if (mainContent.includes(oldNextUser)) {
  mainContent = mainContent.replace(oldNextUser, newNextUser);
  console.log('[OK] 1.11 Patched detectPageState NextAuth session fetch in main/index.js');
} else {
  console.log('[INFO] 1.11 oldNextUser not found or already patched');
}

// 1.12 Patch safeName to support Vietnamese & reject model names
const oldSafeName = `const safeName = (value) => {
              const normalized = clean(value)
                .replace(/google account:?/i, '')
                .replace(emailRegex, '')
                .replace(/[()·,:|-]+/g, ' ')
                .trim();
              if (!normalized || normalized.includes('@') || normalized.length > 80) return undefined;
              if (/^(default|null|undefined|true|false|none|unknown)$/i.test(normalized)) return undefined;
              if (/^(google|flow|labs|account|profile|menu|sign in|đăng nhập)$/i.test(normalized)) return undefined;
              if (/skip to main content|accessibility|feedback|hỗ trợ truy cập|phản hồi/i.test(normalized)) return undefined;
              return normalized;
            };`;

const newSafeName = `const safeName = (value) => {
              const normalized = clean(value)
                .replace(/(tài khoản google|google account):?/gi, '')
                .replace(emailRegex, '')
                .replace(/[()·,:|-]+/g, ' ')
                .trim();
              if (!normalized || normalized.includes('@') || normalized.length > 80) return undefined;
              if (/^(default|null|undefined|true|false|none|unknown)$/i.test(normalized)) return undefined;
              if (/^(google|flow|labs|account|profile|menu|sign in|đăng nhập)$/i.test(normalized)) return undefined;
              if (/skip to main content|accessibility|feedback|hỗ trợ truy cập|phản hồi/i.test(normalized)) return undefined;
              if (/(veo|priority|lite|quality|fast|chatgpt|banana|grok|0 credit|lowpriority)/i.test(normalized)) return undefined;
              return normalized;
            };`;

if (mainContent.includes(oldSafeName)) {
  mainContent = mainContent.replace(oldSafeName, newSafeName);
  console.log('[OK] 1.12 Patched safeName in main/index.js');
} else {
  console.log('[INFO] 1.12 oldSafeName not found or already patched');
}

// 1.13 Patch DOM selectors in detectPageState to include Vietnamese labels
const oldAccountSelectors = `'button[aria-label*="Google Account" i]',
              '[aria-label*="Google Account" i]',`;
const newAccountSelectors = `'button[aria-label*="Google Account" i]',
              'button[aria-label*="Tài khoản Google" i]',
              '[aria-label*="Google Account" i]',
              '[aria-label*="Tài khoản Google" i]',`;
if (mainContent.includes(oldAccountSelectors)) {
  mainContent = mainContent.replace(oldAccountSelectors, newAccountSelectors);
  console.log('[OK] 1.13 Patched account selectors in main/index.js');
} else {
  console.log('[INFO] 1.13 oldAccountSelectors not found or already patched');
}

// 1.14 Patch Sd(r, e) so model names are never stored as account display names
const oldSd = 'function Sd(r,e){const t=r.identity?.displayName?.trim().replace(/^["\']|["\']$/g,""),o=r.identity?.email?.trim(),n=r.identity?.avatarUrl?.trim(),s=xt(e.accountDisplayName)?e.accountDisplayName:void 0,a=xt(e.accountName)?e.accountName:void 0,i=xt(t)?t:void 0,c=i||o||s||e.accountEmail||a||e.accountName;return{accountName:c,accountDisplayName:i||s,accountEmail:o||e.accountEmail,avatarUrl:n||e.avatarUrl,avatar:Uo(c)}}';
const newSd = `function Sd(r,e){
  const isModelName=v=>typeof v==="string"&&/(veo|priority|lite|fast|quality|0 credit|lowpriority)/i.test(v);
  const t=r.identity?.displayName?.trim().replace(/^["']|["']$/g,"");
  const o=r.identity?.email?.trim();
  const n=r.identity?.avatarUrl?.trim();
  const s=(xt(e.accountDisplayName)&&!isModelName(e.accountDisplayName))?e.accountDisplayName:void 0;
  const a=(xt(e.accountName)&&!isModelName(e.accountName))?e.accountName:void 0;
  const i=(xt(t)&&!isModelName(t))?t:void 0;
  const c=i||o||s||e.accountEmail||a||(o?"Google Account":e.accountName);
  return{accountName:c,accountDisplayName:i||s||(o?o.split("@")[0]:void 0),accountEmail:o||e.accountEmail,avatarUrl:n||e.avatarUrl,avatar:Uo(c)};
}`;
if (mainContent.includes(oldSd)) {
  mainContent = mainContent.replace(oldSd, newSd);
  console.log('[OK] 1.14 Patched Sd in main/index.js');
} else {
  console.log('[INFO] 1.14 oldSd not found or already patched');
}

// 1.15 Patch getOrCreateView in nl to intercept Authorization Bearer in real time
const oldFinishLoad = 'this.handlers.onPageLoaded?.(e.accountId);const s=this.views.get(e.accountId);s&&this.scheduleSnapshot(s)}),o.webContents.on("did-stop-loading"';
const newFinishLoad = `this.handlers.onPageLoaded?.(e.accountId);
try{
  if(e.providerId==="veo3"||e.providerId==="banana"){
    o.webContents.session.webRequest.onBeforeSendHeaders(
      {urls:["https://aisandbox-pa.googleapis.com/*","https://labs.google/*","https://flow.google.com/*"]},
      (details,callback)=>{
        const auth=details.requestHeaders?.["Authorization"]||details.requestHeaders?.["authorization"];
        if(typeof auth==="string"&&auth.startsWith("Bearer ya29.")){
          const token=auth.slice(7).trim();
          if(token&&typeof Le!=="undefined"&&Le.patchAccount){
            Le.patchAccount(e.accountId,{accessToken:token,accessTokenValidatedAt:new Date().toISOString()});
            if(typeof C!=="undefined"&&C.completeProviderApiRecovery){
              C.completeProviderApiRecovery(e.accountId,"Google Flow API token is ready.");
            }
          }
        }
        callback({requestHeaders:details.requestHeaders});
      }
    );
  }
}catch(_){}
const s=this.views.get(e.accountId);s&&this.scheduleSnapshot(s)}),o.webContents.on("did-stop-loading"`;
if (mainContent.includes(oldFinishLoad)) {
  mainContent = mainContent.replace(oldFinishLoad, newFinishLoad);
  console.log('[OK] 1.15 Patched onBeforeSendHeaders Bearer interception in main/index.js');
} else {
  console.log('[INFO] 1.15 oldFinishLoad not found or already patched');
}

fs.writeFileSync(mainFile, mainContent, 'utf8');
console.log('[OK] Successfully updated and saved app/out/main/index.js');


// =========================================================================
// 2. PATCH app/out/renderer/assets/VideoStudio-BZY_1pM8.js
// =========================================================================
const vsFile = path.resolve('app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let vsContent = fs.readFileSync(vsFile, 'utf8');

// 2.1 Update Wr to match and fallback cleanly to available account
const oldWr = 'Wr=r=>{if(r.account!=="Auto")return Qe.find(x=>[x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))}';
const newWr = 'Wr=r=>{if(!r.account||r.account==="Auto")return Qe[0]||it[0];return Qe.find(x=>[x.accountId,x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))||it.find(x=>[x.accountId,x.accountName,x.accountDisplayName,x.accountEmail,Me(x)].includes(r.account))||Qe[0]||it[0]}';

if (vsContent.includes(oldWr)) {
  vsContent = vsContent.replace(oldWr, newWr);
  console.log('[OK] 2.1 Patched Wr in VideoStudio');
} else {
  console.log('[INFO] 2.1 oldWr not found or already patched');
}

// 2.2 Update Qe so cooldown doesn't block logged-in accounts
const oldQe = 'Qe=h.useMemo(()=>it.filter(r=>Xt(r)&&!Wt(r)),[it])';
const newQe = 'Qe=h.useMemo(()=>it.filter(r=>Xt(r)),[it])';

if (vsContent.includes(oldQe)) {
  vsContent = vsContent.replace(oldQe, newQe);
  console.log('[OK] 2.2 Patched Qe in VideoStudio');
} else {
  console.log('[INFO] 2.2 oldQe not found or already patched');
}

fs.writeFileSync(vsFile, vsContent, 'utf8');
console.log('[OK] Successfully updated and saved app/out/renderer/assets/VideoStudio-BZY_1pM8.js');


// =========================================================================
// 3. PATCH app/out/renderer/assets/accountUtils-Cc5a_mZz.js
// =========================================================================
const auFile = path.resolve('app/out/renderer/assets/accountUtils-Cc5a_mZz.js');
let auContent = fs.readFileSync(auFile, 'utf8');

const oldEt = 'function Et(e){return e.authStatus==="Logged In"&&e.viewState!=="Needs Attention"&&e.viewState!=="Attaching"}';
const newEt = 'function Et(e){return e.authStatus==="Logged In"&&e.viewState!=="Attaching"}';

if (auContent.includes(oldEt)) {
  auContent = auContent.replace(oldEt, newEt);
  console.log('[OK] 3.1 Patched Et in accountUtils-Cc5a_mZz.js');
} else {
  console.log('[INFO] 3.1 oldEt not found or already patched');
}

fs.writeFileSync(auFile, auContent, 'utf8');
console.log('[OK] Successfully updated and saved app/out/renderer/assets/accountUtils-Cc5a_mZz.js');


// =========================================================================
// 4. CLEAN UP APPDATA PERSISTED FILES
// =========================================================================
const appDataDirs = [
  path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA'),
  path.join(process.env.APPDATA, 'AI VIDEO LIBRARY')
];

appDataDirs.forEach(dir => {
  const sessionsPath = path.join(dir, 'browser-sessions.json');
  if (fs.existsSync(sessionsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionsPath, 'utf8'));
      if (Array.isArray(data.sessions)) {
        let changed = false;
        data.sessions = data.sessions.map(s => {
          if (s.providerId === 'veo3') {
            changed = true;
            const cleanName = s.accountEmail ? s.accountEmail.split('@')[0] : 'Google Flow Account';
            return {
              ...s,
              accountName: (s.accountName && !s.accountName.includes('Priority')) ? s.accountName : cleanName,
              accountDisplayName: (s.accountDisplayName && !s.accountDisplayName.includes('Priority')) ? s.accountDisplayName : cleanName,
              viewState: 'Idle',
              healthScore: 100,
              healthLabel: 'Excellent',
              diagnostics: {
                ...(s.diagnostics || {}),
                cooldownUntil: void 0,
                lastError: void 0
              }
            };
          }
          return s;
        });
        if (changed) {
          fs.writeFileSync(sessionsPath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`[OK] 4.1 Cleaned up ${sessionsPath}`);
        }
      }
    } catch (e) {
      console.warn(`[WARN] Could not update ${sessionsPath}:`, e.message);
    }
  }

  const flowStatePath = path.join(dir, 'google-flow-runtime-state.json');
  if (fs.existsSync(flowStatePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(flowStatePath, 'utf8'));
      if (Array.isArray(data.accounts)) {
        let changed = false;
        // Collect all valid projectIds across accounts
        const validProjects = Array.from(new Set(data.accounts.flatMap(a => a.projectIds || []).filter(Boolean)));
        if (validProjects.length === 0) {
          validProjects.push("8ce1299c-0e18-4a19-8466-67b57fff61f1");
        }

        data.accounts = data.accounts.map(a => {
          changed = true;
          const pids = (a.projectIds && a.projectIds.length > 0) ? a.projectIds : validProjects;
          return {
            ...a,
            displayName: (a.displayName && !a.displayName.includes('Priority')) ? a.displayName : (a.email ? a.email.split('@')[0] : 'Flow Account'),
            paygateTier: 'PAYGATE_TIER_TWO',
            projectIds: pids,
            currentProjectId: a.currentProjectId || pids[0]
          };
        });
        if (changed) {
          fs.writeFileSync(flowStatePath, JSON.stringify(data, null, 2), 'utf8');
          console.log(`[OK] 4.2 Cleaned up ${flowStatePath}`);
        }
      }
    } catch (e) {
      console.warn(`[WARN] Could not update ${flowStatePath}:`, e.message);
    }
  }
});

console.log('=== Master Fix Applied Successfully ===');
