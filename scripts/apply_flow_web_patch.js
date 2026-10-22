const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(filePath, 'utf8');

console.log('Original code length:', code.length);

// 1. Patch isAccessTokenFresh
const freshTarget = 'isAccessTokenFresh(e){if(!e?.accessToken||!e.accessTokenExpiresAt)return!1;const t=new Date(e.accessTokenExpiresAt).getTime();return Number.isFinite(t)&&t-Date.now()>60000}';
const freshReplacement = 'isAccessTokenFresh(e){if(!e?.accessToken)return!1;if(typeof e.accessToken==="string"&&e.accessToken.startsWith("flow_active_session_"))return!0;if(!e.accessTokenExpiresAt)return!1;const t=new Date(e.accessTokenExpiresAt).getTime();return Number.isFinite(t)&&t-Date.now()>60000}';

if (code.includes(freshTarget)) {
  code = code.replace(freshTarget, freshReplacement);
  console.log('✓ Patched isAccessTokenFresh');
} else {
  console.warn('⚠ freshTarget not found');
}

// 2. Patch fetchAccessToken fallback
const tokenFallbackTarget = 'if(!token||typeof token!=="string"||!token.startsWith("ya29.")){throw new m("AUTH_REQUIRED","Tài khoản Google Flow đang tự động kết nối lại. Vui lòng thử lại sau giây lát.",!0)}';
const tokenFallbackReplacement = 'if(!token||typeof token!=="string"||!token.startsWith("ya29.")){token="flow_active_session_"+e.accountId;}';

if (code.includes('Tài khoản Google Flow đang tự động kết nối lại')) {
  // Replace the throw error
  code = code.replace(
    /if\(!token\|\|typeof token!=="string"\|\|!token\.startsWith\("ya29\."\)\)\{\s*throw new m\("AUTH_REQUIRED","Tài khoản Google Flow đang tự động kết nối lại[^"]*",!0\);\s*\}/,
    'if(!token||typeof token!=="string"||!token.startsWith("ya29.")){token="flow_active_session_"+e.accountId;}'
  );
  console.log('✓ Patched tokenFallback in fetchAccessToken');
} else {
  console.warn('⚠ tokenFallback not found');
}

// 3. Patch runVideoJob
const runVideoJobTarget = 'async runVideoJob(e,t){I("google-flow-runtime","video job started",{jobId:e.id,accountId:e.accountId,ratio:e.payload?.ratio,duration:e.payload?.duration,model:e.payload?.model,mode:e.payload?.mode,promptLength:this.readPrompt(e).length});const o=this.getBrowserSession(e.accountId);if(o.providerId!==this.providerId)throw new m("PROVIDER_REJECTED","Selected account does not belong to Google Flow Video");if(o.authStatus!=="Logged In")throw new m("AUTH_REQUIRED","Login to the selected Google Flow account first",!0);const n=Se.fromPartition(o.partition),s=[];';

const runVideoJobReplacement = 'async runVideoJob(e,t){I("google-flow-runtime","video job started",{jobId:e.id,accountId:e.accountId,ratio:e.payload?.ratio,duration:e.payload?.duration,model:e.payload?.model,mode:e.payload?.mode,promptLength:this.readPrompt(e).length});const o=this.getBrowserSession(e.accountId);if(o.providerId!==this.providerId)throw new m("PROVIDER_REJECTED","Selected account does not belong to Google Flow Video");if(o.authStatus!=="Logged In")throw new m("AUTH_REQUIRED","Login to the selected Google Flow account first",!0);try{const pathMod=require("path");const flowRunnerMod=pathMod.join(__dirname,"../../modules/google_flow_web_runner.js");const {runGoogleFlowWebVideoJob}=require(flowRunnerMod);const flowRes=await runGoogleFlowWebVideoJob(e,t,o,this);if(flowRes&&flowRes.assets?.length>0)return flowRes;}catch(flowErr){b("google-flow-runtime","Google Flow web automation error; checking fallback",{jobId:e.id,error:T(flowErr)});if(flowErr.message?.includes("AUTH_REQUIRED")||flowErr.message?.includes("Job cancelled"))throw flowErr;}const n=Se.fromPartition(o.partition),s=[];';

if (code.includes(runVideoJobTarget)) {
  code = code.replace(runVideoJobTarget, runVideoJobReplacement);
  console.log('✓ Patched runVideoJob');
} else {
  console.warn('⚠ runVideoJobTarget not found');
}

// 4. Patch runJob for banana
const runJobTarget = 'if(await this.validateJob(e),this.providerId==="veo3")return this.runVideoJob(e,t);I("google-flow-runtime","image job started"';

const runJobReplacement = 'if(await this.validateJob(e),this.providerId==="veo3")return this.runVideoJob(e,t);if(this.providerId==="banana"){const o=this.getBrowserSession(e.accountId);if(o.authStatus!=="Logged In")throw new m("AUTH_REQUIRED","Login to the selected Google Flow account first",!0);try{const pathMod=require("path");const flowRunnerMod=pathMod.join(__dirname,"../../modules/google_flow_web_runner.js");const {runGoogleFlowWebImageJob}=require(flowRunnerMod);const flowRes=await runGoogleFlowWebImageJob(e,t,o,this);if(flowRes&&flowRes.assets?.length>0)return flowRes;}catch(flowErr){b("google-flow-runtime","Google Flow image web automation error; checking fallback",{jobId:e.id,error:T(flowErr)});if(flowErr.message?.includes("AUTH_REQUIRED")||flowErr.message?.includes("Job cancelled"))throw flowErr;}}I("google-flow-runtime","image job started"';

if (code.includes(runJobTarget)) {
  code = code.replace(runJobTarget, runJobReplacement);
  console.log('✓ Patched runJob for banana');
} else {
  console.warn('⚠ runJobTarget not found');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully saved patched app/out/main/index.js! New length:', code.length);
