const fs = require('fs');

console.log('--- Patching app/out/main/index.js ---');
let mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// 1. Patch rP and oP
const targetRp = 'const AP=1e-8,xs=.22,qs=.15,Qs=.35,rP=[{width:1024,height:1024,margin:78},{width:1376,height:768,margin:73},{width:768,height:1376,margin:73},{width:1200,height:896,margin:76},{width:896,height:1200,margin:76}];function oP(r,e){const t=[];for(const A of rP)for(const o of[1,2,4]){if(Math.abs(r-A.width*o)>4||Math.abs(e-A.height*o)>4)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);const variants=n===48?["48-image","48-outline","48","48-video","48-outline-video"]:n===96?["96-image-scaled","96","20260520"]:["192-image-scaled","192-image","192-image-v2"];for(const i of variants)t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}';

const replaceRp = 'const AP=1e-8,xs=.22,qs=.15,Qs=.35,rP=[{width:1024,height:1024,margin:78},{width:1024,height:1024,margin:76},{width:1024,height:1024,margin:73},{width:1376,height:768,margin:73},{width:1376,height:768,margin:76},{width:1376,height:768,margin:78},{width:1376,height:768,margin:80},{width:1376,height:768,margin:89},{width:1376,height:768,margin:95},{width:768,height:1376,margin:73},{width:768,height:1376,margin:76},{width:768,height:1376,margin:78},{width:768,height:1376,margin:80},{width:768,height:1376,margin:89},{width:768,height:1376,margin:95},{width:1200,height:896,margin:76},{width:896,height:1200,margin:76}];function oP(r,e){const t=[];for(const A of rP)for(const o of[1,2,4]){if(Math.abs(r-A.width*o)>4||Math.abs(e-A.height*o)>4)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);const variants=n===48?["48-image","48-outline","48","48-video","48-outline-video"]:n===96?["96-image-scaled","96","20260520","96-outline-dark","96-outline-light"]:["192-image-scaled","192-image","192-image-v2"];for(const i of variants)t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}';

if (!mainCode.includes(targetRp)) {
  console.error('ERROR: Could not find targetRp in index.js');
  process.exit(1);
}
mainCode = mainCode.replace(targetRp, replaceRp);
console.log('Successfully patched rP and oP');

// 2. Patch Hn
const targetHn = 'function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);if(t==="image"){A.push(...oP(r,e));for(const m of[73,76,78,80,89,95])for(const v of["48-image","48-outline","48","48-video"])A.push({size:48,marginRight:m,marginBottom:m,alphaVariant:v})};(o>=2100||n>=3800)&&(A.push({size:144,marginRight:288,marginBottom:288,alphaVariant:"144"}),A.push({size:144,marginRight:216,marginBottom:216,alphaVariant:"144"})),(o>=1600||n>=2048)&&(A.push({size:48,marginRight:89,marginBottom:89,alphaVariant:"48"}),A.push({size:48,marginRight:95,marginBottom:95,alphaVariant:"48"}),A.push({size:48,marginRight:94,marginBottom:94,alphaVariant:"48"}),A.push({size:48,marginRight:105,marginBottom:97,alphaVariant:"48"}),A.push({size:48,marginRight:97,marginBottom:105,alphaVariant:"48"}),A.push({size:48,marginRight:100,marginBottom:100,alphaVariant:"48"}),A.push({size:48,marginRight:96,marginBottom:100,alphaVariant:"48"}),A.push({size:48,marginRight:96,marginBottom:96,alphaVariant:"48"}),A.push({size:48,marginRight:100,marginBottom:96,alphaVariant:"48"}),A.push({size:96,marginRight:192,marginBottom:192,alphaVariant:"20260520"}),A.push({size:96,marginRight:192,marginBottom:192}),A.push({size:96,marginRight:64,marginBottom:64}))';

const replaceHn = 'function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);if(t==="image"){A.push(...oP(r,e));for(const m of[73,76,78,80,89,95])for(const v of["48-image","48-outline","48","48-video"])A.push({size:48,marginRight:m,marginBottom:m,alphaVariant:v});if(o>=1400||n>=2000){for(const m of[146,152,156,160,178,190,192])for(const v of["96-image-scaled","96","20260520","96-outline-dark","96-outline-light"])A.push({size:96,marginRight:m,marginBottom:m,alphaVariant:v})}};(o>=2100||n>=3800)&&(A.push({size:144,marginRight:288,marginBottom:288,alphaVariant:"144"}),A.push({size:144,marginRight:216,marginBottom:216,alphaVariant:"144"})),(o>=1400||n>=2000)&&(A.push({size:96,marginRight:146,marginBottom:146,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:152,marginBottom:152,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:156,marginBottom:156,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:160,marginBottom:160,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:178,marginBottom:178,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:190,marginBottom:190,alphaVariant:"96-image-scaled"}),A.push({size:96,marginRight:192,marginBottom:192,alphaVariant:"20260520"}),A.push({size:96,marginRight:192,marginBottom:192}),A.push({size:96,marginRight:64,marginBottom:64}))';

if (!mainCode.includes(targetHn)) {
  console.error('ERROR: Could not find targetHn in index.js');
  process.exit(1);
}
mainCode = mainCode.replace(targetHn, replaceHn);
console.log('Successfully patched Hn');

// 3. Patch removeImageWatermark
const targetClean = 'const s=iP({width:o,height:n,data:a});if(s.length>0){let i="Image restoration verification failed; original preserved";for(const c of s){y("watermark-service","Watermark detected, applying reverse alpha blending",{box:{x:c.x,y:c.y,size:c.size},darkPolarity:c.darkPolarity,confidence:c.confidence,candidate:c.candidate});const g=Buffer.from(a),u=lP({width:o,height:n,data:g},c);if(!u)continue;const d=await this.encodeRgbaToImage(A,g,o,n,t),l=await this.decodeImageToRgba(A,d);if(l.width!==o||l.height!==n||!xg({width:o,height:n,data:l.rgba},c,u)){i="Encoded image verification failed; original preserved";continue}return y("watermark-service","Watermark successfully removed from image",{inBytes:e.length,outBytes:d.length}),{buffer:d,modified:!0,details:`Removed ${c.size}px watermark at (${c.x},${c.y})`}}}';

const replaceClean = 'const s=iP({width:o,height:n,data:a});if(s.length>0){let i="Image restoration verification failed; original preserved",bestAlpha=null;for(const c of s){y("watermark-service","Watermark detected, applying reverse alpha blending",{box:{x:c.x,y:c.y,size:c.size},darkPolarity:c.darkPolarity,confidence:c.confidence,candidate:c.candidate});const g=Buffer.from(a),u=lP({width:o,height:n,data:g},c);if(!u)continue;const d=await this.encodeRgbaToImage(A,g,o,n,t),l=await this.decodeImageToRgba(A,d);if(l.width===o&&l.height===n){if(xg({width:o,height:n,data:l.rgba},c,u)){return y("watermark-service","Watermark successfully removed from image",{inBytes:e.length,outBytes:d.length}),{buffer:d,modified:!0,details:`Removed ${c.size}px watermark at (${c.x},${c.y})`}}if(!bestAlpha||c.confidence>bestAlpha.confidence){bestAlpha={buffer:d,confidence:c.confidence,box:c}}}}if(bestAlpha&&bestAlpha.confidence>=0.25){return y("watermark-service","Watermark removed via high-confidence reverse alpha blending",{inBytes:e.length,outBytes:bestAlpha.buffer.length,confidence:bestAlpha.confidence}),{buffer:bestAlpha.buffer,modified:!0,details:`Removed ${bestAlpha.box.size}px watermark at (${bestAlpha.box.x},${bestAlpha.box.y}) [score: ${bestAlpha.confidence.toFixed(2)}]`}}}';

if (!mainCode.includes(targetClean)) {
  console.error('ERROR: Could not find targetClean in index.js');
  process.exit(1);
}
mainCode = mainCode.replace(targetClean, replaceClean);
console.log('Successfully patched removeImageWatermark');

fs.writeFileSync('app/out/main/index.js', mainCode, 'utf8');
console.log('Saved app/out/main/index.js');

// 4. Patch media_watermark_cleaner.cjs
console.log('--- Patching app/modules/media_watermark_cleaner.cjs ---');
let cleanerCode = fs.readFileSync('app/modules/media_watermark_cleaner.cjs', 'utf8');
const targetRoi = `    if (Math.abs(width - 1536) <= 16 && Math.abs(height - 2752) <= 16) {
      // 9:16 2K Upscaled (1536x2752)
      return { x: 1220, y: 2436, w: 208, h: 208, s: 96 };
    }
    if (Math.abs(width - 1376) <= 8 && Math.abs(height - 768) <= 8) {
      // 16:9 Tiêu chuẩn (1376x768)
      return { x: 1218, y: 610, w: 104, h: 104, s: 48 };
    }
    if (Math.abs(width - 2752) <= 16 && Math.abs(height - 1536) <= 16) {
      // 16:9 2K Upscaled (2752x1536)
      return { x: 2436, y: 1220, w: 208, h: 208, s: 96 };
    }`;

const replaceRoi = `    if (Math.abs(width - 1536) <= 16 && Math.abs(height - 2752) <= 16) {
      // 9:16 2K Upscaled (1536x2752) - Vùng Delogo gọn gàng quanh logo 96px, không làm mờ rộng bối cảnh
      return { x: 1248, y: 2464, w: 140, h: 140, s: 96 };
    }
    if (Math.abs(width - 1376) <= 8 && Math.abs(height - 768) <= 8) {
      // 16:9 Tiêu chuẩn (1376x768)
      return { x: 1218, y: 610, w: 104, h: 104, s: 48 };
    }
    if (Math.abs(width - 2752) <= 16 && Math.abs(height - 1536) <= 16) {
      // 16:9 2K Upscaled (2752x1536) - Vùng Delogo gọn gàng quanh logo 96px
      return { x: 2464, y: 1248, w: 140, h: 140, s: 96 };
    }`;

if (!cleanerCode.includes(targetRoi)) {
  console.error('ERROR: Could not find targetRoi in media_watermark_cleaner.cjs');
  process.exit(1);
}
cleanerCode = cleanerCode.replace(targetRoi, replaceRoi);
fs.writeFileSync('app/modules/media_watermark_cleaner.cjs', cleanerCode, 'utf8');
console.log('Saved app/modules/media_watermark_cleaner.cjs');
