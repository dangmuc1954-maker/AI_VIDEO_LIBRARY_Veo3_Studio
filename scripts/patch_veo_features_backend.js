const fs = require('fs');
const path = require('path');

const mainIndexPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainIndexPath, 'utf8');

// Backup original if not backed up
const bakPath = path.join(__dirname, '../app/out/main/index.js.before_veo_patch.bak');
if (!fs.existsSync(bakPath)) {
  fs.writeFileSync(bakPath, code, 'utf8');
  console.log('Created backup:', bakPath);
}

// 1. PATCH runVideoJob for autoUpscale
const targetRunVideo = `const P=k.operation?.metadata?.video?.mediaGenerationId||k.mediaName,J=P||this.generationClient.getVideoOperationName(k);return I("google-flow-runtime","video job generated",{jobId:e.id,projectId:u,providerAssetId:J,timings:s}),{assets:[{type:"video",url:R,providerAssetId:J,mimeType:"video/mp4",googleFlowBindings:P?[{provider:"google-flow",googleAccountKey:w,accountId:o.accountId,mediaKind:"video",mediaId:P,source:"generated",originProjectId:u,status:"active",createdAt:new Date().toISOString()}]:void 0}],provider:{projectId:u,operationId:J,raw:{timings:s,totalDurationMs:s.reduce((re,U)=>re+U.durationMs,0)}}}`;

const replacementRunVideo = `const P=k.operation?.metadata?.video?.mediaGenerationId||k.mediaName,J=P||this.generationClient.getVideoOperationName(k);
let finalVideoUrl=R,finalMediaId=J,autoUpscaleSuccess=!1;
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
}
return I("google-flow-runtime","video job generated",{jobId:e.id,projectId:u,providerAssetId:finalMediaId,timings:s}),{
  ...targetUpscale?{completionStatusText:autoUpscaleSuccess?\`Generated and upscaled to \${targetUpscale}\`:"Generated; auto upscale unavailable"}:{},
  assets:[{
    type:"video",
    url:finalVideoUrl,
    providerAssetId:finalMediaId,
    mimeType:"video/mp4",
    resolution:autoUpscaleSuccess?targetUpscale:(srcRes||"720p"),
    googleFlowBindings:P?[{provider:"google-flow",googleAccountKey:w,accountId:o.accountId,mediaKind:"video",mediaId:finalMediaId,source:"generated",originProjectId:u,status:"active",createdAt:new Date().toISOString()}]:void 0
  }],
  provider:{projectId:u,operationId:finalMediaId,raw:{timings:s,totalDurationMs:s.reduce((re,U)=>re+U.durationMs,0)}}
}`;

if (!code.includes(targetRunVideo)) {
  console.error('ERROR: Could not find targetRunVideo in main/index.js');
  process.exit(1);
}
code = code.replace(targetRunVideo, replacementRunVideo);
console.log('Successfully patched runVideoJob for autoUpscale!');

// 2. PATCH cacheQueueResult for autoRemoveWatermark
const targetWatermark = `const c=await this.assets.cacheQueueResult(n,a);`;
const replacementWatermark = `const c=await this.assets.cacheQueueResult(n,a);
  if((n.payload?.autoRemoveWatermark===!0||n.payload?.removeWatermark===!0)&&c.assets?.length>0){
    const vidAssetWm=c.assets.find(ast=>(ast.type||"").toLowerCase()==="video");
    if(vidAssetWm&&vidAssetWm.localPath&&nodeFs.existsSync(vidAssetWm.localPath)){
      try{
        this.queue.updateJobProgress(e.id,96,"Đang xử lý xóa watermark video (AI Del)...");
        const pathMod=require("path");
        const cleanerModulePath=pathMod.join(__dirname,"../../modules/video_watermark_cleaner.js");
        const {VideoWatermarkCleaner}=require(cleanerModulePath);
        const cleaner=new VideoWatermarkCleaner();
        await cleaner.cleanVideoWatermark(vidAssetWm.localPath);
        const fStat=nodeFs.statSync(vidAssetWm.localPath);
        vidAssetWm.bytes=fStat.size;
        if(this.assets&&this.assets.state&&Array.isArray(this.assets.state.assets)){
          const found=this.assets.state.assets.find(ast=>ast.id===vidAssetWm.assetId||ast.localPath===vidAssetWm.localPath);
          if(found) found.bytes=fStat.size;
          this.assets.emit?.();
        }
        c.completionStatusText=(c.completionStatusText||"Generated")+" (Watermark removed)";
        console.log("[Watermark Cleaner] Đã xóa watermark thành công:",vidAssetWm.localPath);
      }catch(wmErr){
        console.warn("[Watermark Cleaner Warning]",wmErr.message||wmErr);
      }
    }
  }`;

if (!code.includes(targetWatermark)) {
  console.error('ERROR: Could not find targetWatermark in main/index.js');
  process.exit(1);
}
code = code.replace(targetWatermark, replacementWatermark);
console.log('Successfully patched cacheQueueResult for autoRemoveWatermark!');

fs.writeFileSync(mainIndexPath, code, 'utf8');
console.log('All backend patches applied cleanly to app/out/main/index.js!');
