const fs = require('fs');

console.log('--- REVERTING APP/OUT/MAIN/INDEX.JS TO PRISTINE ORIGINAL ---');
const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Revert rP and oP
const currentRp = 'const AP=1e-8,xs=.22,qs=.15,Qs=.35,rP=[{width:1024,height:1024,margin:78},{width:1024,height:1024,margin:76},{width:1024,height:1024,margin:73},{width:1376,height:768,margin:73},{width:1376,height:768,margin:76},{width:1376,height:768,margin:78},{width:1376,height:768,margin:80},{width:1376,height:768,margin:89},{width:1376,height:768,margin:95},{width:768,height:1376,margin:73},{width:768,height:1376,margin:76},{width:768,height:1376,margin:78},{width:768,height:1376,margin:80},{width:768,height:1376,margin:89},{width:768,height:1376,margin:95},{width:1200,height:896,margin:76},{width:896,height:1200,margin:76}];function oP(r,e){const t=[];for(const A of rP)for(const o of[1,2,4]){if(Math.abs(r-A.width*o)>4||Math.abs(e-A.height*o)>4)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);const variants=n===48?["48-image","48-outline","48","48-video","48-outline-video"]:n===96?["96-image-scaled","96","20260520","96-outline-dark","96-outline-light"]:["192-image-scaled","192-image","192-image-v2"];for(const i of variants)t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}';

const originalRp = 'const AP=1e-8,xs=.22,qs=.15,Qs=.35,rP=[{width:1024,height:1024,margin:78},{width:1376,height:768,margin:73},{width:768,height:1376,margin:73},{width:1200,height:896,margin:76},{width:896,height:1200,margin:76}];function oP(r,e){const t=[];for(const A of rP)for(const o of[1,2,4]){if(Math.abs(r-A.width*o)>4||Math.abs(e-A.height*o)>4)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);const variants=n===48?["48-image","48-outline","48","48-video","48-outline-video"]:n===96?["96-image-scaled","96","20260520"]:["192-image-scaled","192-image","192-image-v2"];for(const i of variants)t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}';

if (content.includes(currentRp)) {
  content = content.replace(currentRp, originalRp);
  console.log('1. Reverted rP and oP to original');
} else {
  console.log('1. rP is already original or not matching currentRp');
}

// 2. Revert Hn
const currentHn = 'function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);if(t==="image"){A.push(...oP(r,e));for(const m of[73,76,78,80,89,95])for(const v of["48-image","48-outline","48","48-video"])A.push({size:48,marginRight:m,marginBottom:m,alphaVariant:v});if(o>=1400||n>=2000){for(const m of[146,152,156,160,178,190,192])for(const v of["96-image-scaled","96","20260520","96-outline-dark","96-outline-light"])A.push({size:96,marginRight:m,marginBottom:m,alphaVariant:v})}};(o>=2100||n>=3800)&&(A.push({size:144,marginRight:288,marginBottom:288,alphaVariant:"144"}),A.push({size:144,marginRight:216,marginBottom:216,alphaVariant:"144"})),(o>=1400||n>=2000)&&(A.push({size:96,marginRight:146,marginBottom:146,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:152,marginBottom:152,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:156,marginBottom:156,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:160,marginBottom:160,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:178,marginBottom:178,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:190,marginBottom:190,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:192,marginBottom:192,alphaVariant:"20260520"}),A.push({size:96,marginRight:192,marginBottom:192}),A.push({size:96,marginRight:64,marginBottom:64}))';

const originalHn = 'function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);if(t==="image"){A.push(...oP(r,e));for(const m of[73,76,78,80,89,95])for(const v of["48-image","48-outline","48","48-video"])A.push({size:48,marginRight:m,marginBottom:m,alphaVariant:v})};(o>=2100||n>=3800)&&(A.push({size:144,marginRight:288,marginBottom:288,alphaVariant:"144"}),A.push({size:144,marginRight:216,marginBottom:216,alphaVariant:"144"})),(o>=1600||n>=2048)&&(A.push({size:48,marginRight:89,marginBottom:89,alphaVariant:"48"}),A.push({size:48,marginRight:95,marginBottom:95,alphaVariant:"48"}),A.push({size:48,marginRight:94,marginBottom:94,alphaVariant:"48"}),A.push({size:48,marginRight:105,marginBottom:97,alphaVariant:"48"}),A.push({size:48,marginRight:97,marginBottom:105,alphaVariant:"48"}),A.push({size:48,marginRight:100,marginBottom:100,alphaVariant:"48"}),A.push({size:48,marginRight:96,marginBottom:100,alphaVariant:"48"}),A.push({size:48,marginRight:96,marginBottom:96,alphaVariant:"48"}),A.push({size:48,marginRight:100,marginBottom:96,alphaVariant:"48"}),A.push({size:96,marginRight:192,marginBottom:192,alphaVariant:"20260520"}),A.push({size:96,marginRight:192,marginBottom:192}),A.push({size:96,marginRight:64,marginBottom:64}))';

if (content.includes(currentHn)) {
  content = content.replace(currentHn, originalHn);
  console.log('2. Reverted Hn to original');
} else {
  console.log('2. Hn is already original or not matching currentHn');
}

// 3. Revert removeImageWatermark
const startRem = content.indexOf('async removeImageWatermark(e,t){');
const endRem = content.indexOf('async removeVideoWatermark(e,t,A){', startRem);

if (startRem !== -1 && endRem !== -1) {
  const originalRemMethod = `async removeImageWatermark(e,t){if(!e||e.length===0)return{buffer:e,modified:!1,details:"Empty buffer"};try{const A=await this.getFfmpegPath(),{width:o,height:n,rgba:a}=await this.decodeImageToRgba(A,e);if(!o||!n||a.length!==o*n*4)return{buffer:e,modified:!1,details:"Decode dimension mismatch"};const s=iP({width:o,height:n,data:a});if(!s.length)return y("watermark-service","No watermark detected in image",{width:o,height:n}),{buffer:e,modified:!1,details:"No watermark detected"};let i="Image restoration verification failed; original preserved";for(const c of s){y("watermark-service","Watermark detected, applying reverse alpha blending",{box:{x:c.x,y:c.y,size:c.size},darkPolarity:c.darkPolarity,confidence:c.confidence,candidate:c.candidate});const g=Buffer.from(a),u=lP({width:o,height:n,data:g},c);if(!u)continue;const d=await this.encodeRgbaToImage(A,g,o,n,t),l=await this.decodeImageToRgba(A,d);if(l.width!==o||l.height!==n||!xg({width:o,height:n,data:l.rgba},c,u)){i="Encoded image verification failed; original preserved";continue}return y("watermark-service","Watermark successfully removed from image",{inBytes:e.length,outBytes:d.length}),{buffer:d,modified:!0,details:\`Removed \${c.size}px watermark at (\${c.x},\${c.y})\`}}return{buffer:e,modified:!1,details:i}}catch(A){return B("watermark-service","Error during image watermark removal, using original",{error:A instanceof Error?A.message:String(A)}),{buffer:e,modified:!1,details:"Fallback on error"}}}`;
  
  content = content.substring(0, startRem) + originalRemMethod + content.substring(endRem);
  console.log('3. Reverted removeImageWatermark to original pristine function');
}

// 4. Revert cacheQueueAsset
const startCache = content.indexOf('async cacheQueueAsset(e,');
const endCache = content.indexOf('async downloadRemoteAsset(e,t,A=Hs){', startCache);

if (startCache !== -1 && endCache !== -1) {
  const originalCacheMethod = `async cacheQueueAsset(e,t,A){if(t.type!=="image"&&t.type!=="video"&&t.type!=="audio")return t;const o=t.url,n=o.startsWith("data:")?Ws(o):await this.downloadRemoteAsset(o,t.mimeType,t.type==="video"?GP:Hs);if(t.type==="image"&&!yo.has(n.mimeType))throw new Error(\`Provider result is not a supported image: \${n.mimeType}\`);if(t.type==="video"&&!Ks.has(n.mimeType))throw new Error(\`Provider result is not a supported video: \${n.mimeType}\`);if(t.type==="audio"&&!QP.has(n.mimeType))throw new Error(\`Provider result is not a supported audio: \${n.mimeType}\`);let a=n.bytes,s=t.localVariantDiffersFromProvider,i=!1;if((e.providerId==="banana"&&t.type==="image"||e.providerId==="veo3"&&t.type==="video")&&(e.payload?.autoRemoveWatermark===!0||e.payload?.removeWatermark===!0))try{if(t.type==="image"){const u=await Fs.removeImageWatermark(a,n.mimeType);u.modified&&(a=u.buffer,s=!0,i=!0)}else if(t.type==="video"){const u=await Fs.removeVideoWatermarkFromBuffer(a,n.mimeType);u.modified&&u.buffer&&u.verified===!0&&(a=u.buffer,s=!0,i=u.verified===!0)}}catch(u){B("asset-store","watermark removal failed in cacheQueueAsset, using original",{error:v(u)})}const g=await this.writeAsset({id:q(),bytes:a,mimeType:n.mimeType,name:_getGenName(e,n.mimeType),sceneName:e.payload?.sceneName||(e.payload?.promptOrder?("Cảnh "+e.payload.promptOrder):void 0),type:t.type,role:"generated",createdAt:new Date().toISOString(),remoteUrl:o.startsWith("data:")?void 0:o,providerId:e.providerId,provider:e.provider,providerAssetId:t.providerAssetId,accountId:e.accountId,account:e.account,jobId:e.id,promptId:typeof e.payload?.promptId=="string"?e.payload.promptId:void 0,prompt:typeof e.payload?.prompt=="string"?e.payload.prompt:e.title,ratio:typeof e.payload?.ratio=="string"?e.payload.ratio:void 0,projectId:A,origin:"generated",pinnedAsReference:!1,googleFlowBindings:t.googleFlowBindings,grokBindings:t.grokBindings,localVariantDiffersFromProvider:s,watermarkRemoved:i,resolution:t.type==="video"?Io(t.resolution)||Io(e.payload?.resolution)||"Standard":e.payload?.upsampleResolution==="2K"||e.payload?.upsampleResolution==="4K"?e.payload.upsampleResolution:"Standard"},{persistence:"batched"});return{...t,assetId:g.id,url:g.url,localPath:g.localPath,thumbnailPath:g.thumbnailPath,thumbnailUrl:g.thumbnailUrl,thumbnailMimeType:g.thumbnailMimeType,remoteUrl:g.remoteUrl,mimeType:g.mimeType,googleFlowBindings:g.googleFlowBindings,grokBindings:g.grokBindings,localVariantDiffersFromProvider:g.localVariantDiffersFromProvider,watermarkRemoved:i}}`;

  content = content.substring(0, startCache) + originalCacheMethod + content.substring(endCache);
  console.log('4. Reverted cacheQueueAsset to original pristine function (ZERO delogo, ZERO post-write blur)');
}

// 5. Remove _getWatermarkCleanerModule if present
const cleanerHelper = `function _getWatermarkCleanerModule(){try{const _p=require("path"),_f=require("fs");const _d=typeof __dirname!=="undefined"?__dirname:(typeof import.meta!=="undefined"&&import.meta.dirname)?import.meta.dirname:process.cwd();const _candidates=[_p.join(_d,"../../modules/media_watermark_cleaner.cjs"),_p.join(_d,"../modules/media_watermark_cleaner.cjs"),_p.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_p.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),process.resourcesPath?_p.join(process.resourcesPath,"app/modules/media_watermark_cleaner.cjs"):"",process.resourcesPath?_p.join(process.resourcesPath,"modules/media_watermark_cleaner.cjs"):"","C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);const _found=_candidates.find(p=>_f.existsSync(p));if(_found)return require(_found)}catch(e){}return null}`;

if (content.includes(cleanerHelper)) {
  content = content.replace(cleanerHelper, '');
  console.log('5. Removed _getWatermarkCleanerModule helper');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('--- REVERT COMPLETED SUCCESSFULLY! ---');
