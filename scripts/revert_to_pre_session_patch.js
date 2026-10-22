const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let content = fs.readFileSync(targetFile, 'utf8');
const originalLength = content.length;

// 1. Restore startUrls for banana and veo3 to https://labs.google/fx/vi/tools/flow
content = content.replace(
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}',
  '{id:"banana",name:"Banana",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Image Generation","Upscale","Face Restore"]}'
);
content = content.replace(
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}',
  '{id:"veo3",name:"Veo3",startUrl:"https://labs.google/fx/vi/tools/flow",supportedJobTypes:["Video Generation","Image to Video","Reference Assets"]}'
);

// 2. Restore deferProviderApiRecovery
const currentDeferIdx = content.indexOf('deferProviderApiRecovery(e,t,o){const n=Date.now()');
if (currentDeferIdx !== -1) {
  const currentDeferEnd = content.indexOf('this.emit(),this.save()}', currentDeferIdx) + 'this.emit(),this.save()}'.length;
  const originalDefer = 'deferProviderApiRecovery(e,t,o){const n=Date.now(),s=new Date(n+o).toISOString();this.sessions=this.sessions.map(a=>{if(a.accountId!==e)return a;const i=Math.min(a.healthScore||82,82);return{...a,healthScore:i,healthLabel:Be(i),diagnostics:{...a.diagnostics,lastError:t,lastProviderErrorCode:"GOOGLE_FLOW_AUTH_NETWORK",cooldownUntil:s,cooldownReason:t,lastHeartbeatAt:new Date(n).toISOString()},activity:[{id:`${a.accountId}-api-recovery-deferred-${n}`,type:"auth",title:"Google Flow API retry scheduled",detail:`${t}. Retrying shortly.`,createdAt:new Date(n).toISOString(),severity:"warning"},...a.activity].slice(0,12)}}),this.emit(),this.save()}';
  content = content.slice(0, currentDeferIdx) + originalDefer + content.slice(currentDeferEnd);
  console.log('[OK] Restored original deferProviderApiRecovery');
}

// 3. Restore fetchAccessToken
const currentFetchIdx = content.indexOf('async fetchAccessToken(e,t){');
if (currentFetchIdx !== -1) {
  const currentFetchEnd = content.indexOf('return this.store.upsertAccount(i)}', currentFetchIdx) + 'return this.store.upsertAccount(i)}'.length;
  const originalFetch = 'async fetchAccessToken(e,t){const o=this.store.getAccount(e.accountId),n=await this.readSessionToken(t),s=await de(`${xr}/auth/session`,{method:"GET",headers:{Cookie:`__Secure-next-auth.session-token=${n}`},timeoutMs:3e4});if(!s.access_token)throw new m("AUTH_REQUIRED","Google Flow did not return an access token",!0);if(this.isAuthSessionAccessTokenExpired(s.expires))throw new m("AUTH_REQUIRED","Google Flow API token expired. Reopen or re-login this account.",!0);const a=await this.readCredits(s.access_token),i={accountId:e.accountId,providerId:e.providerId,accessToken:s.access_token,accessTokenExpiresAt:s.expires,accessTokenValidatedAt:a?new Date().toISOString():void 0,email:s.user?.email||e.accountEmail,displayName:s.user?.name||e.accountDisplayName,avatarUrl:s.user?.image||s.user?.picture||e.avatarUrl,credits:a?.credits??o?.credits,paygateTier:a?.userPaygateTier??o?.paygateTier,currentProjectId:o?.currentProjectId,projectIds:o?.projectIds,projectCursor:o?.projectCursor,imageEnabled:o?.imageEnabled??!0,videoEnabled:o?.videoEnabled??!0};return this.store.upsertAccount(i)}';
  content = content.slice(0, currentFetchIdx) + originalFetch + content.slice(currentFetchEnd);
  console.log('[OK] Restored original fetchAccessToken');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log(`[DONE] app/out/main/index.js reverted. Size: ${originalLength} -> ${content.length}`);
