const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let content = fs.readFileSync(targetFile, 'utf8');

const checks = [
  {
    name: 'isGoogleFlowUrl',
    search: 'isGoogleFlowUrl(e){try{const t=new URL(e);return t.hostname==="labs.google"&&t.pathname.startsWith("/fx")}catch{return!1}}'
  },
  {
    name: 'readyUrlPatterns',
    search: 'readyUrlPatterns:[/labs\\.google\\/fx/i]'
  },
  {
    name: 'readCredits',
    search: 'async readCredits(e){try{return await this.requestCredits(e)}catch(t){if(t instanceof m&&t.code==="AUTH_REQUIRED")throw t;return b("google-flow-auth","access token credits validation skipped",{error:T(t)}),null}}'
  },
  {
    name: 'validateCachedAccessToken',
    search: 'async validateCachedAccessToken(e,t,o){if(!o.accessToken)return this.refreshAccessToken(e,t);I("google-flow-auth","cached access token validation started",{accountId:e.accountId});try{const n=await this.requestCredits(o.accessToken),s=this.store.patchAccount(e.accountId,{credits:n.credits??o.credits,paygateTier:n.userPaygateTier??o.paygateTier,accessTokenValidatedAt:new Date().toISOString()});return I("google-flow-auth","cached access token validation completed",{accountId:e.accountId}),s||o}catch(n){return n instanceof m&&n.code==="AUTH_REQUIRED"?(b("google-flow-auth","cached access token validation rejected; refreshing",{accountId:e.accountId,error:T(n)}),this.refreshAccessToken(e,t)):(b("google-flow-auth","cached access token validation skipped",{accountId:e.accountId,error:T(n)}),o)}}'
  },
  {
    name: 'fetchAccessToken',
    search: 'async fetchAccessToken(e,t){const o=this.store.getAccount(e.accountId),n=await this.readSessionToken(t),s=await de(`${xr}/auth/session`,{method:"GET",headers:{Cookie:`__Secure-next-auth.session-token=${n}`},timeoutMs:3e4});if(!s.access_token)throw new m("AUTH_REQUIRED","Google Flow did not return an access token",!0);if(this.isAuthSessionAccessTokenExpired(s.expires))throw new m("AUTH_REQUIRED","Google Flow API token expired. Reopen or re-login this account.",!0);const a=await this.readCredits(s.access_token),i={accountId:e.accountId,providerId:e.providerId,accessToken:s.access_token,accessTokenExpiresAt:s.expires,accessTokenValidatedAt:a?new Date().toISOString():void 0,email:s.user?.email||e.accountEmail,displayName:s.user?.name||e.accountDisplayName,avatarUrl:s.user?.image||s.user?.picture||e.avatarUrl,credits:a?.credits??o?.credits,paygateTier:a?.userPaygateTier??o?.paygateTier,currentProjectId:o?.currentProjectId,projectIds:o?.projectIds,projectCursor:o?.projectCursor,imageEnabled:o?.imageEnabled??!0,videoEnabled:o?.videoEnabled??!0};return this.store.upsertAccount(i)}'
  },
  {
    name: 'readSessionToken',
    search: 'async readSessionToken(e){const t=await e.cookies.get({name:as}),o=this.selectSessionCookie(t);if(!o?.value)throw new m("AUTH_REQUIRED","Login to Google Flow before running jobs",!0);return I("google-flow-auth","session cookie selected",{domain:o.domain,path:o.path,expiresInMs:o.expirationDate?Math.round(o.expirationDate*1e3-Date.now()):void 0,candidateCount:t.length}),o.value}'
  },
  {
    name: 'selectSessionCookie',
    search: 'selectSessionCookie(e){const t=Date.now()/1e3;return e.filter(o=>!o.value||o.expirationDate&&o.expirationDate<=t?!1:/(^|\\.)labs\\.google$|(^|\\.)google\\.com$/i.test(o.domain||"")).sort((o,n)=>{const s=this.scoreSessionCookieDomain(o.domain||""),a=this.scoreSessionCookieDomain(n.domain||"");return s!==a?a-s:(n.expirationDate||0)-(o.expirationDate||0)})[0]}scoreSessionCookieDomain(e){return/(^|\\.)labs\\.google$/i.test(e)?20:/(^|\\.)google\\.com$/i.test(e)?10:0}'
  },
  {
    name: 'createProject',
    search: 'headers:{Cookie:`__Secure-next-auth.session-token=${e}`},body:JSON.stringify({json:{projectTitle:o,toolName:"PINHOLE"}})'
  },
  {
    name: 'Zr catch',
    search: 'c?C.failProviderApiRecovery(r,i instanceof m&&i.code==="CHALLENGE_REQUIRED"?"Google Flow requires browser verification.":"Google Flow API session expired. Reopen or re-login this account."):C.deferProviderApiRecovery(r,i instanceof Error?i.message:"Google Flow API session validation failed.",d)'
  },
  {
    name: 'failProviderApiRecovery',
    search: 'failProviderApiRecovery(e,t){this.sessions=this.sessions.map(o=>o.accountId!==e?o:{...o,viewState:"Needs Attention",healthScore:Math.min(o.healthScore,65),healthLabel:"Poor",diagnostics:{...o.diagnostics,lastError:t,lastProviderErrorCode:"AUTH_REQUIRED",lastHeartbeatAt:new Date().toISOString()},activity:[{id:`${o.accountId}-api-recovery-failed-${Date.now()}`,type:"auth",title:"Google Flow API session expired",detail:t,createdAt:new Date().toISOString(),severity:"warning"},...o.activity].slice(0,12)}),this.emit(),this.save()}'
  },
  {
    name: 'canRunJobSession',
    search: 'canRunJobSession(e){if(!e)return!0;const t=this.sessions.find(o=>o.accountId===e);return!t||t.viewState!=="Needs Attention"&&t.viewState!=="Attaching"&&!Me(t)}'
  }
];

let allPassed = true;
for (const check of checks) {
  const idx = content.indexOf(check.search);
  if (idx === -1) {
    console.error(`[FAIL] Not found: ${check.name}`);
    allPassed = false;
  } else {
    console.log(`[PASS] Found: ${check.name} at ${idx}`);
  }
}

if (!allPassed) {
  process.exit(1);
}
console.log('ALL EXACT SEARCH STRINGS VERIFIED!');
