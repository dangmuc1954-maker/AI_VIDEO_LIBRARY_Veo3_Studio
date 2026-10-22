const fs = require('fs');
const path = require('path');

const mainIndexPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainIndexPath, 'utf8');

// 1. ADD generateVideoUpsample TO generationClient
// Look for generateVideoReferenceImages end
const targetGenRef = `s=await de(\`\${ge}/video:batchAsyncGenerateVideoReferenceImages\`,{method:\"POST\",signal:e.signal,headers:{...me(e.fingerprint),authorization:\`Bearer \${e.accessToken}\`},body:JSON.stringify(n),timeoutMs:12e4}),a=this.readFirstVideoOperation(s,e.projectId);if(!this.getVideoOperationName(a))throw new m(\"PROVIDER_REJECTED\",\"Google Flow returned no video operation id\");return{operation:a,projectId:e.projectId,sceneId:o,sessionId:t,response:s}}async checkVideoStatus(e){`;

const replacementGenRef = `s=await de(\`\${ge}/video:batchAsyncGenerateVideoReferenceImages\`,{method:\"POST\",signal:e.signal,headers:{...me(e.fingerprint),authorization:\`Bearer \${e.accessToken}\`},body:JSON.stringify(n),timeoutMs:12e4}),a=this.readFirstVideoOperation(s,e.projectId);if(!this.getVideoOperationName(a))throw new m(\"PROVIDER_REJECTED\",\"Google Flow returned no video operation id\");return{operation:a,projectId:e.projectId,sceneId:o,sessionId:t,response:s}}async generateVideoUpsample(e){const t=\`;\${Date.now()}\`,A=e.targetResolution===\"720p\"?\"VIDEO_RESOLUTION_720P\":\"VIDEO_RESOLUTION_1080P\",o=e.targetResolution===\"720p\"?\"omni_upsampler_360p\":\"veo_3_1_upsampler_1080p\",n={mediaGenerationContext:{batchId:M(),audioFailurePreference:\"BLOCK_SILENCED_VIDEOS\"},clientContext:{projectId:e.projectId,tool:\"PINHOLE\",userPaygateTier:e.userPaygateTier||\"PAYGATE_TIER_ONE\",sessionId:t,recaptchaContext:{token:e.recaptchaToken,applicationType:\"RECAPTCHA_APPLICATION_TYPE_WEB\"}},requests:[{resolution:A,aspectRatio:e.aspectRatio||\"VIDEO_ASPECT_RATIO_LANDSCAPE\",videoModelKey:o,seed:Math.floor(Math.random()*99999)+1,metadata:e.workflowId?{workflowId:e.workflowId}:{},videoInput:{mediaId:e.originalMediaId}}],useV2ModelConfig:!0},s=await de(\`\${ge}/video:batchAsyncGenerateVideoUpsampleVideo\`,{method:\"POST\",signal:e.signal,headers:{...me(e.fingerprint),authorization:\`Bearer \${e.accessToken}\`},body:JSON.stringify(n),timeoutMs:12e4}),a=this.readFirstVideoOperation(s,e.projectId);if(!this.getVideoOperationName(a))throw new m(\"PROVIDER_REJECTED\",\"Google Flow returned no video upsample operation id\");return{operation:a,projectId:e.projectId,response:s}}async checkVideoStatus(e){`;

if (!code.includes(targetGenRef)) {
  console.error('ERROR: Could not find targetGenRef in main/index.js');
  process.exit(1);
}
code = code.replace(targetGenRef, replacementGenRef);
console.log('1. Added generateVideoUpsample to generationClient!');

// 2. ADD autoUpscaleVideo TO RUNNER CLASS
// We will add it before pollVideoOperation
const targetPollDef = `async pollVideoOperation({accessToken:e,context:t,fingerprint:o,jobId:n,operation:s,partition:a,timings:i}){`;

const replacementPollDef = `async autoUpscaleVideo({accessToken:e,account:t,browserSession:A,completedOperation:o,context:n,fingerprint:a,jobId:s,mediaName:i,model:c,partition:g,projectId:d,refreshAccessToken:u,targetResolution:l,timings:m}){
  const p=i.endsWith(\"_upsampled\")?i:\`\${i}_upsampled\`;
  n.updateProgress(89,\`Đang nâng cấp video lên \${l}...\`);
  I(\"google-flow-runtime\",\"video auto upscale requested\",{jobId:s,mediaName:i,upsampledMediaName:p,targetResolution:l,projectId:d});
  try{
    let w=await this.measureStep(m,\"video-upscale-recaptcha\",()=>this.captchaService.requestVideoToken(A.accountId)),P;
    for(let D=1;D<=3;D+=1)try{
      P=await this.withAccessTokenRetry(D===1?\"video-upscale-submit-auth-retry\":\`video-upscale-submit-auth-retry-\${D}\`,()=>this.generationClient.generateVideoUpsample({accessToken:e,projectId:d,originalMediaId:i,aspectRatio:o.operation?.metadata?.video?.aspectRatio||c.aspectRatio||\"VIDEO_ASPECT_RATIO_LANDSCAPE\",targetResolution:l,recaptchaToken:w.token,workflowId:o.workflowId,userPaygateTier:t.paygateTier,fingerprint:w.fingerprint||a,signal:n.signal}),u);
      break;
    }catch(v){
      if(!(v instanceof m)||!this.isRetryableFlowOperationError(v)||D>=3)throw v;
      b(\"google-flow-runtime\",\"video auto upscale submit retryable failure\",{jobId:s,attempt:D,error:T(v)});
      await this.captchaService.recoverAfterFlowError(A.accountId,{operation:\"video-generation\",projectId:d,attempt:D,maxAttempts:3,code:v.code,details:v.details,error:v});
      w=await this.measureStep(m,\`video-upscale-recaptcha-retry-\${D+1}\`,()=>this.captchaService.requestVideoToken(A.accountId));
    }
    if(!P)throw new m(\"PROVIDER_REJECTED\",\"Google Flow video upscale submission failed\",!1);
    let f=P.operation;
    const startTime=Date.now();
    let G=0;
    for(;Date.now()-startTime<18e4;){
      if(n.signal.aborted)throw new m(\"UNKNOWN\",\"Google Flow video upscale was cancelled\",!1);
      const D=this.readVideoStatus(f),v=this.generationClient.extractVideoUrl(f);
      if(v&&!this.isVideoFailed(D))return{url:v,mediaName:p};
      if(this.isVideoFailed(D)||f.operation?.error)throw this.createVideoOperationFailureError(D,f.operation?.error);
      if(this.isVideoSuccessful(D)){
        const S=await this.authService.readSessionCookieHeader(g);
        for(let Q=1;Q<=3;Q+=1){
          try{
            const R=await this.measureStep(m,Q===1?\"video-upscale-media-url\":\`video-upscale-media-url-\${Q}\`,()=>this.generationClient.resolveVideoMediaUrl({mediaName:p,sessionCookieHeader:S,fingerprint:w.fingerprint||a,signal:n.signal}));
            if(R)return I(\"google-flow-runtime\",\"video auto upscale resolved\",{jobId:s,mediaName:p,sourceMediaName:i,targetResolution:l,pollAttempt:G,resolveAttempt:Q}),{url:R,mediaName:p};
          }catch(R){
            if(n.signal.aborted)throw R;
            b(\"google-flow-runtime\",\"video auto upscale media URL attempt failed\",{jobId:s,mediaName:p,resolveAttempt:Q,error:T(R)});
          }
          Q<3&&await this.delay(5e3);
        }
        throw new m(\"PROVIDER_REJECTED\",\"Google Flow video upscale succeeded but returned no video URL\",!1);
      }
      G+=1;
      n.updateProgress(Math.min(97,89+G*2),D?\`Upscaling video to \${l} (\${D})\`:\`Upscaling video to \${l}\`);
      await this.delay(5e3);
      try{
        const S=await this.measureStep(m,G===1?\"video-upscale-poll\":\`video-upscale-poll-\${G}\`,()=>this.withAccessTokenRetry(\"video-upscale-poll-auth-retry\",()=>this.generationClient.checkVideoStatus({accessToken:e,operations:[f],fingerprint:w.fingerprint||a,signal:n.signal}),u));
        f=this.mergeVideoOperation(f,S.operation);
      }catch(S){
        if(n.signal.aborted)throw S;
        b(\"google-flow-runtime\",\"video auto upscale poll failed; will retry\",{jobId:s,pollAttempt:G,error:T(S)});
      }
    }
    throw new m(\"NETWORK\",\"Google Flow video upscale timed out\",!0);
  }catch(err){
    b(\"google-flow-runtime\",\"video auto upscale failed; using source 720p video\",{jobId:s,mediaName:i,error:T(err)});
    return null;
  }
}
async pollVideoOperation({accessToken:e,context:t,fingerprint:o,jobId:n,operation:s,partition:a,timings:i}){`;

if (!code.includes(targetPollDef)) {
  console.error('ERROR: Could not find targetPollDef in main/index.js');
  process.exit(1);
}
code = code.replace(targetPollDef, replacementPollDef);
console.log('2. Added autoUpscaleVideo to runner class!');

// 3. UPDATE runVideoJob to call this.autoUpscaleVideo
const targetRunVideoUpscale = `let finalVideoUrl=R,finalMediaId=J,autoUpscaleSuccess=!1;
const srcRes=typeof e.payload?.resolution==="string"?e.payload.resolution:f.resolution;
const targetUpscale=e.payload?.autoUpscale===!0?(srcRes?.includes("360")?"720p":"1080p"):void 0;
if(targetUpscale&&P){
  try{
    t.updateProgress(89,\`Đang nâng cấp video lên \${targetUpscale}...\`);
    const pathMod=require("path");
    const upscalerModulePath=pathMod.join(__dirname,"../../modules/veo_upscaler.js");
    const {VeoAiUpscaler}=require(upscalerModulePath);
    const upscaler=new VeoAiUpscaler();
    const upRes=await upscaler.upscaleVideo({
      accessToken:d,
      projectId:u,
      originalMediaId:P,
      aspectRatio:f.aspectRatio,
      targetResolution:targetUpscale,
      userPaygateTier:c.paygateTier||"PAYGATE_TIER_TWO",
      signal:t.signal,
      onProgress:(prog,msg)=>t.updateProgress(prog,msg)
    });
    if(upRes?.url){
      finalVideoUrl=upRes.url;
      finalMediaId=upRes.mediaName||finalMediaId;
      autoUpscaleSuccess=!0;
      I("google-flow-runtime","video upscaled successfully",{jobId:e.id,targetResolution:targetUpscale,url:finalVideoUrl});
    }
  }catch(upErr){
    b("google-flow-runtime","video upscale warning; falling back to 720p",{error:T(upErr)});
  }
}`;

const replacementRunVideoUpscale = `let finalVideoUrl=R,finalMediaId=J,autoUpscaleSuccess=!1;
const srcRes=typeof e.payload?.resolution==="string"?e.payload.resolution:f.resolution;
const targetUpscale=e.payload?.autoUpscale===!0?(srcRes?.includes("360")?"720p":"1080p"):void 0;
if(targetUpscale&&P){
  const upRes=await this.autoUpscaleVideo({
    accessToken:d,
    account:c,
    browserSession:o,
    completedOperation:k,
    context:t,
    fingerprint:v.fingerprint,
    jobId:e.id,
    mediaName:P,
    model:f,
    partition:n,
    projectId:u,
    refreshAccessToken:l,
    targetResolution:targetUpscale,
    timings:s
  });
  if(upRes?.url){
    finalVideoUrl=upRes.url;
    finalMediaId=upRes.mediaName||finalMediaId;
    autoUpscaleSuccess=!0;
    I("google-flow-runtime","video auto upscale completed successfully",{jobId:e.id,targetResolution:targetUpscale,url:finalVideoUrl});
  }
}`;

if (code.includes(targetRunVideoUpscale)) {
  code = code.replace(targetRunVideoUpscale, replacementRunVideoUpscale);
  console.log('3. Updated runVideoJob to use native autoUpscaleVideo!');
} else {
  console.warn('targetRunVideoUpscale not found, checking if already updated...');
}

// 4. UPDATE Watermark Cleaner call to use native Ln (FFmpeg)
const targetCleanerCall = `const cleaner=new VideoWatermarkCleaner();`;
const replacementCleanerCall = `const cleaner=new VideoWatermarkCleaner(Ln);`;

if (code.includes(targetCleanerCall)) {
  code = code.replace(targetCleanerCall, replacementCleanerCall);
  console.log('4. Updated VideoWatermarkCleaner to pass Ln (FFmpeg)!');
}

fs.writeFileSync(mainIndexPath, code, 'utf8');
console.log('All native robust backend patches applied successfully!');
