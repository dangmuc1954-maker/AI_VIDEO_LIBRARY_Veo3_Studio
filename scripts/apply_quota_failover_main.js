const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let content = fs.readFileSync(targetFile, 'utf8');
console.log('Original length:', content.length);

// 1. UPDATE reassignQueuedAutoJobs & requeueAutoJobForAlternateAccount
const origReassign = `reassignQueuedAutoJobs(e,t){let A=!1;return this.state={...this.state,jobs:this.state.jobs.map(o=>{if(o.accountId!==e||o.status!=="Queued"||o.payload?.accountSelection!=="auto")return o;const n=t(o);return!n?.accountId||n.accountId===o.accountId?o:(A=!0,{...o,accountId:n.accountId,account:n.account,statusText:\`Auto moved to \${n.account||"another account"}\`,updatedAt:new Date().toISOString()})})},A&&this.commit(),A}requeueAutoJobForAlternateAccount(e,t,A,o){const n=this.findJob(e);return!n||n.status!=="Running"||n.payload?.accountSelection!=="auto"?!1:(this.updateJob(e,{accountId:void 0,account:void 0,status:"Queued",progress:0,statusText:"Waiting for another account",providerErrorCode:A,providerErrorDetails:o,recoveryAction:"retry",retryAt:new Date(Date.now()+250).toISOString(),error:t,attempts:Math.max(0,n.attempts-1)},this.getUrgentJobPatchOptions(e)),!0)}`;

const newReassign = `reassignQueuedAutoJobs(e,t,force=!1){let A=!1;return this.state={...this.state,jobs:this.state.jobs.map(o=>{if(o.accountId!==e||o.status!=="Queued"||(!force&&o.payload?.accountSelection!=="auto"))return o;const n=t(o);if(n?.accountId&&n.accountId!==o.accountId)return A=!0,{...o,accountId:n.accountId,account:n.account,statusText:\`Tự động chuyển sang \${n.account||"tài khoản khác"}\`,updatedAt:new Date().toISOString()};if(!n?.accountId)return A=!0,{...o,accountId:void 0,account:void 0,payload:{...(o.payload||{}),accountSelection:"auto"},statusText:"Tự động chuyển sang tài khoản khác (do tài khoản cũ hết quota)",updatedAt:new Date().toISOString()};return o})},A&&this.commit(),A}requeueAutoJobForAlternateAccount(e,t,A,o,force=!1){const n=this.findJob(e);return!n||n.status!=="Running"||(!force&&n.payload?.accountSelection!=="auto")?!1:(this.updateJob(e,{accountId:void 0,account:void 0,payload:{...(n.payload||{}),accountSelection:"auto"},status:"Queued",progress:0,statusText:"Tự động chuyển sang tài khoản khác do hết quota/giới hạn",providerErrorCode:A,providerErrorDetails:o,recoveryAction:"retry",retryAt:new Date(Date.now()+250).toISOString(),error:t,attempts:Math.max(0,n.attempts-1)},this.getUrgentJobPatchOptions(e)),!0)}`;

if (content.includes(origReassign)) {
  content = content.replace(origReassign, newReassign);
  console.log('Replaced reassignQueuedAutoJobs & requeueAutoJobForAlternateAccount');
} else {
  console.log('reassignQueuedAutoJobs already patched or not found');
}

// 2. UPDATE catch block in queue worker
const origCatch = `}catch(n){const a=this.queue.findJob(e.id);if(t.aborted&&(!a||a.status==="Canceled")){await this.deleteDiscardedJobAssets(e),y("queue-worker","job canceled",this.describeJob(e));return}if(n instanceof p){B("queue-worker","provider job failed",{...this.describeJob(o),code:n.code,recoverable:n.recoverable,details:n.details,error:v(n)}),this.applyProviderErrorPolicy(o,n),this.onAccountFailure?.(o,n,this.getAccountCooldownMs(n));return}lu("queue-worker","job crashed",{...this.describeJob(e),error:v(n)}),this.queue.failJob(e.id,n instanceof Error?n.message:"Job execution failed")}`;

const newCatch = `}catch(n){const a=this.queue.findJob(e.id);if(t.aborted&&(!a||a.status==="Canceled")){await this.deleteDiscardedJobAssets(e),y("queue-worker","job canceled",this.describeJob(e));return}let err=n;if(!(err instanceof p)&&err instanceof Error&&/quota|rate[ _-]?limit|too many requests|cooldown|exhausted|out of credits|hết credit|insufficient credit|credit limit|chạm hạn mức|hết quota|429/i.test(err.message||"")){err=new p("QUOTA_EXCEEDED",err.message,!1)}if(err instanceof p){B("queue-worker","provider job failed",{...this.describeJob(o),code:err.code,recoverable:err.recoverable,details:err.details,error:v(err)}),this.applyProviderErrorPolicy(o,err),this.onAccountFailure?.(o,err,this.getAccountCooldownMs(err));return}lu("queue-worker","job crashed",{...this.describeJob(e),error:v(n)}),this.queue.failJob(e.id,n instanceof Error?n.message:"Job execution failed")}`;

if (content.includes(origCatch)) {
  content = content.replace(origCatch, newCatch);
  console.log('Replaced queue worker catch block');
} else {
  console.log('queue worker catch block already patched or not found');
}

// 3. UPDATE applyProviderErrorPolicy
const origPolicy = `applyProviderErrorPolicy(e,t){if(this.isGrokStatsigNotReadyError(e,t)){this.applyGrokStatsigNotReadyPolicy(e,t);return}if(this.isGrokBrowserRecoveryError(e,t)){this.applyGrokBrowserRecoveryPolicy(e,t);return}if(this.isGrokProviderBusyError(e,t)){this.applyGrokProviderBusyPolicy(e,t);return}if(t.code==="CHALLENGE_REQUIRED"&&(e.providerId==="banana"||e.providerId==="veo3")&&e.payload?.accountSelection==="auto"&&!cm(e)){const A=this.queue.requeueAutoJobForAlternateAccount(e.id,t.message,t.code,t.details);if(this.onAccountRecoveryNeeded?.(e,t),A)return}if(t.code==="AUTH_REQUIRED"||t.code==="CHALLENGE_REQUIRED"){this.queue.pauseJobForRecovery(e.id,t.message,"Open browser account to recover",t.code,t.details),this.onAccountRecoveryNeeded?.(e,t);return}`;

const newPolicy = `applyProviderErrorPolicy(e,t){if(this.isGrokStatsigNotReadyError(e,t)){this.applyGrokStatsigNotReadyPolicy(e,t);return}if(this.isGrokBrowserRecoveryError(e,t)){this.applyGrokBrowserRecoveryPolicy(e,t);return}if(this.isGrokProviderBusyError(e,t)){this.applyGrokProviderBusyPolicy(e,t);return}const isQuotaOrLimit=t.code==="QUOTA_EXCEEDED"||t.code==="RESOURCE_EXHAUSTED"||t.code==="RATE_LIMITED"||t.code==="CHALLENGE_REQUIRED"||/quota|rate[ _-]?limit|too many requests|cooldown|exhausted|out of credits|hết credit|insufficient credit|credit limit|chạm hạn mức|hết quota|429/i.test(t.message||"");if(isQuotaOrLimit&&!cm(e)){const cdMs=this.getAccountCooldownMs(t)||(t.code==="RATE_LIMITED"?6e4:15*6e4);e.accountId&&this.onAccountFailure?.(e,t,cdMs);const A=this.queue.requeueAutoJobForAlternateAccount(e.id,t.message,t.code,t.details,!0);if(t.code==="CHALLENGE_REQUIRED"&&this.onAccountRecoveryNeeded?.(e,t),A)return}if(t.code==="AUTH_REQUIRED"||t.code==="CHALLENGE_REQUIRED"){this.queue.pauseJobForRecovery(e.id,t.message,"Open browser account to recover",t.code,t.details),this.onAccountRecoveryNeeded?.(e,t);return}`;

if (content.includes(origPolicy)) {
  content = content.replace(origPolicy, newPolicy);
  console.log('Replaced applyProviderErrorPolicy');
} else {
  console.log('applyProviderErrorPolicy already patched or not found');
}

// 4. UPDATE getAccountCooldownMs
const origCooldown = `getAccountCooldownMs(e){if(e.code==="RATE_LIMITED")return 6e4;if(e.code==="NETWORK")return 3e3+Math.floor(Math.random()*2001);if(e.code==="QUOTA_EXCEEDED")return 15*6e4}`;

const newCooldown = `getAccountCooldownMs(e){if(!e)return 15*6e4;if(e.code==="RATE_LIMITED"||/rate[ _-]?limit|too many requests|429/i.test(e.message||""))return 6e4;if(e.code==="NETWORK")return 3e3+Math.floor(Math.random()*2001);if(e.code==="QUOTA_EXCEEDED"||e.code==="RESOURCE_EXHAUSTED"||/quota|exhausted|credit|hết quota|hạn mức/i.test(e.message||""))return 15*6e4;return 15*6e4}`;

if (content.includes(origCooldown)) {
  content = content.replace(origCooldown, newCooldown);
  console.log('Replaced getAccountCooldownMs');
} else {
  console.log('getAccountCooldownMs already patched or not found');
}

// 5. UPDATE onAccountFailure in new im
const origOnFailure = `t&&(T.markJobRuntimeCooldown(r.accountId,e.code,e.message,t),U.reassignQueuedAutoJobs(r.accountId,o=>{const n=Xn({...o,accountId:void 0,account:void 0});return n?.accountId?{accountId:n.accountId,account:n.account}:null}),$())}`;

const newOnFailure = `t&&(T.markJobRuntimeCooldown(r.accountId,e.code,e.message,t),U.reassignQueuedAutoJobs(r.accountId,o=>{const n=Xn({...o,accountId:void 0,account:void 0});return n?.accountId?{accountId:n.accountId,account:n.account}:null},!0),$())}`;

if (content.includes(origOnFailure)) {
  content = content.replace(origOnFailure, newOnFailure);
  console.log('Replaced onAccountFailure in new im');
} else {
  console.log('onAccountFailure already patched or not found');
}

// 6. UPDATE _B for Muse session cooldown filtering
const orig_B = `const allMuse=T.listSessions().filter(s=>s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));if(allMuse.length>0){global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;const ms=allMuse[(global.__muse_dispatch_counter-1)%allMuse.length];return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}`;

const new_B = `const allMuse=T.listSessions().filter(s=>s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));const availMuse=allMuse.filter(s=>!ct(s));const pool=availMuse.length>0?availMuse:allMuse;if(pool.length>0){global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;const ms=pool[(global.__muse_dispatch_counter-1)%pool.length];return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}`;

if (content.includes(orig_B)) {
  content = content.replace(orig_B, new_B);
  console.log('Replaced _B for Muse cooldown support');
} else {
  console.log('_B already patched or not found');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Saved app/out/main/index.js successfully. New length:', content.length);
