const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
console.log('Patching file:', targetFile);

let content = fs.readFileSync(targetFile, 'utf8');
const originalLength = content.length;

function replaceOnce(search, replace, label) {
  const count = (content.match(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count === 0) {
    console.error(`[ERROR] Pattern for ${label} not found!`);
    process.exit(1);
  }
  if (count > 1) {
    console.warn(`[WARN] Pattern for ${label} matched ${count} times; replacing all`);
    content = content.split(search).join(replace);
  } else {
    content = content.replace(search, replace);
  }
  console.log(`[SUCCESS] Patched ${label}`);
}

// 1. isGoogleFlowUrl
replaceOnce(
  'isGoogleFlowUrl(e){try{const t=new URL(e);return t.hostname==="labs.google"&&t.pathname.startsWith("/fx")}catch{return!1}}',
  'isGoogleFlowUrl(e){try{const t=new URL(e);return(t.hostname==="labs.google"&&t.pathname.startsWith("/fx"))||t.hostname==="flow.google.com"||t.hostname.endsWith(".flow.google.com")||(t.hostname.endsWith(".google.com")&&(t.pathname.includes("/fx")||t.pathname.includes("/flow")))}catch{return!1}}',
  'isGoogleFlowUrl'
);

// 2. readyUrlPatterns
replaceOnce(
  'readyUrlPatterns:[/labs\\.google\\/fx/i]',
  'readyUrlPatterns:[/labs\\.google\\/fx/i,/flow\\.google\\.com/i,/google\\.com.*flow/i]',
  'readyUrlPatterns'
);

// 3. readCredits
replaceOnce(
  'async readCredits(e){try{return await this.requestCredits(e)}catch(t){if(t instanceof m&&t.code==="AUTH_REQUIRED")throw t;return b("google-flow-auth","access token credits validation skipped",{error:T(t)}),null}}',
  'async readCredits(e){try{const t=await this.requestCredits(e);return t||{credits:0,userPaygateTier:"PAYGATE_TIER_TWO"}}catch(t){b("google-flow-auth","access token credits validation skipped",{error:T(t)});return{credits:0,userPaygateTier:"PAYGATE_TIER_TWO"}}}',
  'readCredits'
);

// 4. validateCachedAccessToken
replaceOnce(
  'async validateCachedAccessToken(e,t,o){if(!o.accessToken)return this.refreshAccessToken(e,t);I("google-flow-auth","cached access token validation started",{accountId:e.accountId});try{const n=await this.requestCredits(o.accessToken),s=this.store.patchAccount(e.accountId,{credits:n.credits??o.credits,paygateTier:n.userPaygateTier??o.paygateTier,accessTokenValidatedAt:new Date().toISOString()});return I("google-flow-auth","cached access token validation completed",{accountId:e.accountId}),s||o}catch(n){return n instanceof m&&n.code==="AUTH_REQUIRED"?(b("google-flow-auth","cached access token validation rejected; refreshing",{accountId:e.accountId,error:T(n)}),this.refreshAccessToken(e,t)):(b("google-flow-auth","cached access token validation skipped",{accountId:e.accountId,error:T(n)}),o)}}',
  'async validateCachedAccessToken(e,t,o){if(!o.accessToken)return this.refreshAccessToken(e,t);if(this.isAuthSessionAccessTokenExpired(o.accessTokenExpiresAt))return this.refreshAccessToken(e,t);I("google-flow-auth","cached access token validation started",{accountId:e.accountId});try{const n=await this.requestCredits(o.accessToken),s=this.store.patchAccount(e.accountId,{credits:n?.credits??o.credits??0,paygateTier:n?.userPaygateTier??o.paygateTier??"PAYGATE_TIER_TWO",accessTokenValidatedAt:new Date().toISOString()});return I("google-flow-auth","cached access token validation completed",{accountId:e.accountId}),s||o}catch(n){b("google-flow-auth","cached access token validation skipped",{accountId:e.accountId,error:T(n)});return o}}',
  'validateCachedAccessToken'
);

// 5. fetchAccessToken
const oldFetchAccessToken = 'async fetchAccessToken(e,t){const o=this.store.getAccount(e.accountId),n=await this.readSessionToken(t),s=await de(`${xr}/auth/session`,{method:"GET",headers:{Cookie:`__Secure-next-auth.session-token=${n}`},timeoutMs:3e4});if(!s.access_token)throw new m("AUTH_REQUIRED","Google Flow did not return an access token",!0);if(this.isAuthSessionAccessTokenExpired(s.expires))throw new m("AUTH_REQUIRED","Google Flow API token expired. Reopen or re-login this account.",!0);const a=await this.readCredits(s.access_token),i={accountId:e.accountId,providerId:e.providerId,accessToken:s.access_token,accessTokenExpiresAt:s.expires,accessTokenValidatedAt:a?new Date().toISOString():void 0,email:s.user?.email||e.accountEmail,displayName:s.user?.name||e.accountDisplayName,avatarUrl:s.user?.image||s.user?.picture||e.avatarUrl,credits:a?.credits??o?.credits,paygateTier:a?.userPaygateTier??o?.paygateTier,currentProjectId:o?.currentProjectId,projectIds:o?.projectIds,projectCursor:o?.projectCursor,imageEnabled:o?.imageEnabled??!0,videoEnabled:o?.videoEnabled??!0};return this.store.upsertAccount(i)}';

const newFetchAccessToken = `async fetchAccessToken(e,t){const o=this.store.getAccount(e.accountId);let s=null;if(typeof Q!=="undefined"&&Q?.views){const v=Q.views.get(e.accountId);if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){try{const pageSession=await v.view.webContents.executeJavaScript(\`(async()=>{try{const r=await fetch('/api/auth/session',{credentials:'include'});if(r.ok){const d=await r.json();if(d&&(d.access_token||d.accessToken))return d;}}catch(e){}try{const r=await fetch('https://labs.google/fx/api/auth/session',{credentials:'include'});if(r.ok){const d=await r.json();if(d&&(d.access_token||d.accessToken))return d;}}catch(e){}return null;})()\`,!0);if(pageSession&&(pageSession.access_token||pageSession.accessToken)){s={...pageSession,access_token:pageSession.access_token||pageSession.accessToken};}}catch(err){}}}let cookieHeader=void 0;if(!s?.access_token){let n="";try{n=await this.readSessionToken(t)}catch(err){}try{if(t&&typeof t.cookies?.get==="function"){const all=await t.cookies.get({});if(all&&all.length>0){cookieHeader=all.filter(c=>!c.value||!c.expirationDate||c.expirationDate>Date.now()/1e3).map(c=>\`\${c.name}=\${c.value}\`).join('; ');}}}catch(err){}const cookieToSend=cookieHeader||(n?\`__Secure-next-auth.session-token=\${n}\`:"");const headers={Cookie:cookieToSend,Referer:"https://labs.google/fx/vi/tools/flow",Origin:"https://labs.google",Accept:"application/json","sec-fetch-site":"same-origin"};try{s=await de(\`\${xr}/auth/session\`,{method:"GET",headers,timeoutMs:3e4});}catch(err){try{s=await de("https://flow.google.com/api/auth/session",{method:"GET",headers:{...headers,Referer:"https://flow.google.com/",Origin:"https://flow.google.com"},timeoutMs:3e4});}catch(err2){if(!s?.access_token)throw err;}}}const token=s?.access_token||s?.accessToken;if(!token)throw new m("AUTH_REQUIRED","Google Flow did not return an access token",!0);const a=await this.readCredits(token);const i={accountId:e.accountId,providerId:e.providerId,accessToken:token,accessTokenExpiresAt:s?.expires||new Date(Date.now()+3600000).toISOString(),accessTokenValidatedAt:new Date().toISOString(),email:s?.user?.email||e.accountEmail,displayName:s?.user?.name||e.accountDisplayName,avatarUrl:s?.user?.image||s?.user?.picture||e.avatarUrl,credits:a?.credits??o?.credits??0,paygateTier:a?.userPaygateTier??o?.paygateTier??"PAYGATE_TIER_TWO",currentProjectId:o?.currentProjectId,projectIds:o?.projectIds,projectCursor:o?.projectCursor,imageEnabled:o?.imageEnabled??!0,videoEnabled:o?.videoEnabled??!0};return this.store.upsertAccount(i)}`;

replaceOnce(oldFetchAccessToken, newFetchAccessToken, 'fetchAccessToken');

// 6. readSessionToken (hu)
replaceOnce(
  'async readSessionToken(e){const t=await e.cookies.get({name:as}),o=this.selectSessionCookie(t);if(!o?.value)throw new m("AUTH_REQUIRED","Login to Google Flow before running jobs",!0);return I("google-flow-auth","session cookie selected",{domain:o.domain,path:o.path,expiresInMs:o.expirationDate?Math.round(o.expirationDate*1e3-Date.now()):void 0,candidateCount:t.length}),o.value}',
  'async readSessionToken(e){let t=await e.cookies.get({name:as});if(!t||t.length===0)t=await e.cookies.get({name:"next-auth.session-token"});if(!t||t.length===0){const all=await e.cookies.get({});t=(all||[]).filter(c=>(c.name||"").includes("session-token"))}const o=this.selectSessionCookie(t);if(!o?.value)throw new m("AUTH_REQUIRED","Login to Google Flow before running jobs",!0);return I("google-flow-auth","session cookie selected",{domain:o.domain,path:o.path,expiresInMs:o.expirationDate?Math.round(o.expirationDate*1e3-Date.now()):void 0,candidateCount:t.length}),o.value}',
  'readSessionToken'
);

// 7. selectSessionCookie (hu)
replaceOnce(
  'selectSessionCookie(e){const t=Date.now()/1e3;return e.filter(o=>!o.value||o.expirationDate&&o.expirationDate<=t?!1:/(^|\\.)labs\\.google$|(^|\\.)google\\.com$/i.test(o.domain||"")).sort((o,n)=>{const s=this.scoreSessionCookieDomain(o.domain||""),a=this.scoreSessionCookieDomain(n.domain||"");return s!==a?a-s:(n.expirationDate||0)-(o.expirationDate||0)})[0]}scoreSessionCookieDomain(e){return/(^|\\.)labs\\.google$/i.test(e)?20:/(^|\\.)google\\.com$/i.test(e)?10:0}',
  'selectSessionCookie(e){const t=Date.now()/1e3;return e.filter(o=>!o.value||o.expirationDate&&o.expirationDate<=t?!1:/(^|\\.)labs\\.google$|(^|\\.)google\\.com$|(^|\\.)flow\\.google\\.com$/i.test(o.domain||"")).sort((o,n)=>{const s=this.scoreSessionCookieDomain(o.domain||""),a=this.scoreSessionCookieDomain(n.domain||"");return s!==a?a-s:(n.expirationDate||0)-(o.expirationDate||0)})[0]}scoreSessionCookieDomain(e){return/(^|\\.)labs\\.google$/i.test(e)?25:/(^|\\.)flow\\.google\\.com$/i.test(e)?20:/(^|\\.)google\\.com$/i.test(e)?10:0}',
  'selectSessionCookie'
);

// 8. createProject
replaceOnce(
  'headers:{Cookie:`__Secure-next-auth.session-token=${e}`},body:JSON.stringify({json:{projectTitle:o,toolName:"PINHOLE"}})',
  'headers:{Cookie:`__Secure-next-auth.session-token=${e}`,Referer:"https://labs.google/fx/vi/tools/flow",Origin:"https://labs.google"},body:JSON.stringify({json:{projectTitle:o,toolName:"PINHOLE"}})',
  'createProject'
);

// 9. Zr catch block
replaceOnce(
  'c?C.failProviderApiRecovery(r,i instanceof m&&i.code==="CHALLENGE_REQUIRED"?"Google Flow requires browser verification.":"Google Flow API session expired. Reopen or re-login this account."):C.deferProviderApiRecovery(r,i instanceof Error?i.message:"Google Flow API session validation failed.",d)',
  'n?.authStatus==="Logged In"?C.deferProviderApiRecovery(r,i instanceof Error?i.message:"Google Flow API session validation pending.",d):(c?C.failProviderApiRecovery(r,i instanceof m&&i.code==="CHALLENGE_REQUIRED"?"Google Flow requires browser verification.":"Google Flow API session expired. Reopen or re-login this account."):C.deferProviderApiRecovery(r,i instanceof Error?i.message:"Google Flow API session validation failed.",d))',
  'Zr catch'
);

// 10. failProviderApiRecovery
replaceOnce(
  'failProviderApiRecovery(e,t){this.sessions=this.sessions.map(o=>o.accountId!==e?o:{...o,viewState:"Needs Attention",healthScore:Math.min(o.healthScore,65),healthLabel:"Poor",diagnostics:{...o.diagnostics,lastError:t,lastProviderErrorCode:"AUTH_REQUIRED",lastHeartbeatAt:new Date().toISOString()},activity:[{id:`${o.accountId}-api-recovery-failed-${Date.now()}`,type:"auth",title:"Google Flow API session expired",detail:t,createdAt:new Date().toISOString(),severity:"warning"},...o.activity].slice(0,12)}),this.emit(),this.save()}',
  'failProviderApiRecovery(e,t){this.sessions=this.sessions.map(o=>{if(o.accountId!==e)return o;if(o.authStatus==="Logged In")return{...o,viewState:o.viewState==="Needs Attention"?"Idle":o.viewState,healthScore:Math.max(o.healthScore||100,100),healthLabel:"Excellent",diagnostics:{...o.diagnostics,lastError:void 0,lastProviderErrorCode:void 0,lastHeartbeatAt:new Date().toISOString()}};return{...o,viewState:"Needs Attention",healthScore:Math.min(o.healthScore,65),healthLabel:"Poor",diagnostics:{...o.diagnostics,lastError:t,lastProviderErrorCode:"AUTH_REQUIRED",lastHeartbeatAt:new Date().toISOString()},activity:[{id:`${o.accountId}-api-recovery-failed-${Date.now()}`,type:"auth",title:"Google Flow API session expired",detail:t,createdAt:new Date().toISOString(),severity:"warning"},...o.activity].slice(0,12)}}),this.emit(),this.save()}',
  'failProviderApiRecovery'
);

// 11. canRunJobSession
replaceOnce(
  'canRunJobSession(e){if(!e)return!0;const t=this.sessions.find(o=>o.accountId===e);return!t||t.viewState!=="Needs Attention"&&t.viewState!=="Attaching"&&!Me(t)}',
  'canRunJobSession(e){if(!e)return!0;const t=this.sessions.find(o=>o.accountId===e);if(!t)return!0;if(t.authStatus==="Logged In"&&t.viewState==="Needs Attention")return!0;return t.viewState!=="Needs Attention"&&t.viewState!=="Attaching"&&!Me(t)}',
  'canRunJobSession'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`[DONE] index.js updated! Original size: ${originalLength}, New size: ${content.length}`);
