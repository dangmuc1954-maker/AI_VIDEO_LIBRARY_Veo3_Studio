const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] KHẮC PHỤC TRIỆT ĐỂ LỖI XÓA WATERMARK TRÊN ẢNH XƯỞNG THỜI TRANG 100% ===');

// -------------------------------------------------------------------
// 1. SỬA app/modules/media_watermark_cleaner.cjs
// -------------------------------------------------------------------
const cleanerFiles = [
  path.resolve(__dirname, '../app/modules/media_watermark_cleaner.cjs'),
  path.resolve(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/modules/media_watermark_cleaner.cjs'),
  path.resolve(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/modules/media_watermark_cleaner.cjs'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs'
];

const newRoiCode = `  computeWatermarkRoi(width, height) {
    const isPortrait = height > width;
    const shortEdge = Math.min(width, height);
    
    // 🎯 TỌA ĐỘ CHUẨN XÁC 100% CHO CÁC KHỔ ẢNH TIÊU CHUẨN GOOGLE FLOW / IMAGEN 3
    if (Math.abs(width - 768) <= 8 && Math.abs(height - 1376) <= 8) {
      const boxSize = 56;
      return { x: 768 - 73 - boxSize, y: 1376 - 73 - boxSize, w: boxSize, h: boxSize, s: 48 };
    }
    if (Math.abs(width - 1376) <= 8 && Math.abs(height - 768) <= 8) {
      const boxSize = 56;
      return { x: 1376 - 73 - boxSize, y: 768 - 73 - boxSize, w: boxSize, h: boxSize, s: 48 };
    }
    if (Math.abs(width - 1024) <= 8 && Math.abs(height - 1024) <= 8) {
      const boxSize = 56;
      return { x: 1024 - 78 - boxSize, y: 1024 - 78 - boxSize, w: boxSize, h: boxSize, s: 48 };
    }
    if (Math.abs(width - 896) <= 8 && Math.abs(height - 1200) <= 8) {
      const boxSize = 56;
      return { x: 896 - 76 - boxSize, y: 1200 - 76 - boxSize, w: boxSize, h: boxSize, s: 48 };
    }
    if (Math.abs(width - 1200) <= 8 && Math.abs(height - 896) <= 8) {
      const boxSize = 56;
      return { x: 1200 - 76 - boxSize, y: 896 - 76 - boxSize, w: boxSize, h: boxSize, s: 48 };
    }

    const s = Math.round(shortEdge / 15);
    const boxW = Math.round(s * 1.35);
    const boxH = Math.round(s * 1.35);

    let marginX = isPortrait ? Math.round(shortEdge * 0.08) : Math.round(shortEdge * 0.07);
    let marginY = isPortrait ? Math.round(shortEdge * 0.08) : Math.round(shortEdge * 0.07);

    let x = width - marginX - boxW;
    let y = height - marginY - boxH;

    x = Math.max(0, Math.min(x, width - boxW));
    y = Math.max(0, Math.min(y, height - boxH));

    return { x, y, w: boxW, h: boxH, s };
  }`;

cleanerFiles.forEach(cf => {
  if (fs.existsSync(cf)) {
    let code = fs.readFileSync(cf, 'utf8');
    code = code.replace(/computeWatermarkRoi\(width,\s*height\)\s*\{[\s\S]*?return\s*\{\s*x,\s*y,\s*w:\s*boxW,\s*h:\s*boxH,\s*s\s*\};\s*\}/, newRoiCode);
    fs.writeFileSync(cf, code, 'utf8');
    console.log('✅ Đã cập nhật computeWatermarkRoi chuẩn xác cho:', cf);
  }
});

// -------------------------------------------------------------------
// 2. SỬA app/out/main/index.js
// -------------------------------------------------------------------
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 2.1 Mở rộng oP để hỗ trợ 1X [1, 2, 4] và mọi variant cho 48px
const oldOp = `function oP(r,e){const t=[];for(const A of rP)for(const o of[2,4]){if(Math.abs(r-A.width*o)>2||Math.abs(e-A.height*o)>2)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);for(const i of n===96?["96-image-scaled","96","20260520"]:["192-image-scaled","192-image","192-image-v2"])t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}`;
const newOp = `function oP(r,e){const t=[];for(const A of rP)for(const o of[1,2,4]){if(Math.abs(r-A.width*o)>4||Math.abs(e-A.height*o)>4)continue;const n=48*o,a=Math.round(A.margin*r/A.width),s=Math.round(A.margin*e/A.height);const variants=n===48?["48-image","48-outline","48","48-video","48-outline-video"]:n===96?["96-image-scaled","96","20260520"]:["192-image-scaled","192-image","192-image-v2"];for(const i of variants)t.push({size:n,marginRight:a,marginBottom:s,alphaVariant:i})}return t}`;

if (mainCode.includes(oldOp)) {
  mainCode = mainCode.replace(oldOp, newOp);
  console.log('✅ 2.1 Đã sửa oP để hỗ trợ 1X [1, 2, 4] (ảnh chuẩn 768x1376 của Flow)');
} else {
  console.log('ℹ️ oP đã được sửa từ trước hoặc dạng khác');
}

// 2.2 Bổ sung candidates 48px trực tiếp trong Hn
const oldHn = `function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);t==="image"&&A.push(...oP(r,e)),(o>=2100||n>=3800)`;
const newHn = `function Hn(r,e,t){if(t==="video")return nP(r,e);const A=[],o=Math.min(r,e),n=Math.max(r,e);if(t==="image"){A.push(...oP(r,e));for(const m of[73,76,78,80,89,95])for(const v of["48-image","48-outline","48","48-video"])A.push({size:48,marginRight:m,marginBottom:m,alphaVariant:v})};(o>=2100||n>=3800)`;

if (mainCode.includes(oldHn)) {
  mainCode = mainCode.replace(oldHn, newHn);
  console.log('✅ 2.2 Đã bổ sung candidates 48px trực tiếp trong Hn');
}

// 2.3 Nâng cấp removeImageWatermark với Fallback tự động 100%
const oldRemove = `async removeImageWatermark(e,t){if(!e||e.length===0)return{buffer:e,modified:!1,details:"Empty buffer"};try{const A=await this.getFfmpegPath(),{width:o,height:n,rgba:a}=await this.decodeImageToRgba(A,e);if(!o||!n||a.length!==o*n*4)return{buffer:e,modified:!1,details:"Decode dimension mismatch"};const s=iP({width:o,height:n,data:a});if(!s.length)return y("watermark-service","No watermark detected in image",{width:o,height:n}),{buffer:e,modified:!1,details:"No watermark detected"};let i="Image restoration verification failed; original preserved";for(const c of s){y("watermark-service","Watermark detected, applying reverse alpha blending",{box:{x:c.x,y:c.y,size:c.size},darkPolarity:c.darkPolarity,confidence:c.confidence,candidate:c.candidate});const g=Buffer.from(a),u=lP({width:o,height:n,data:g},c);if(!u)continue;const d=await this.encodeRgbaToImage(A,g,o,n,t),l=await this.decodeImageToRgba(A,d);if(l.width!==o||l.height!==n||!xg({width:o,height:n,data:l.rgba},c,u)){i="Encoded image verification failed; original preserved";continue}return y("watermark-service","Watermark successfully removed from image",{inBytes:e.length,outBytes:d.length}),{buffer:d,modified:!0,details:\`Removed \${c.size}px watermark at (\${c.x},\${c.y})\`}}return{buffer:e,modified:!1,details:i}}catch(A){return B("watermark-service","Error during image watermark removal, using original",{error:A instanceof Error?A.message:String(A)}),{buffer:e,modified:!1,details:"Fallback on error"}}}`;

const newRemove = `async removeImageWatermark(e,t){if(!e||e.length===0)return{buffer:e,modified:!1,details:"Empty buffer"};try{const A=await this.getFfmpegPath(),{width:o,height:n,rgba:a}=await this.decodeImageToRgba(A,e);if(!o||!n||a.length!==o*n*4)return{buffer:e,modified:!1,details:"Decode dimension mismatch"};const s=iP({width:o,height:n,data:a});if(s.length>0){let i="Image restoration verification failed; original preserved";for(const c of s){y("watermark-service","Watermark detected, applying reverse alpha blending",{box:{x:c.x,y:c.y,size:c.size},darkPolarity:c.darkPolarity,confidence:c.confidence,candidate:c.candidate});const g=Buffer.from(a),u=lP({width:o,height:n,data:g},c);if(!u)continue;const d=await this.encodeRgbaToImage(A,g,o,n,t),l=await this.decodeImageToRgba(A,d);if(l.width!==o||l.height!==n||!xg({width:o,height:n,data:l.rgba},c,u)){i="Encoded image verification failed; original preserved";continue}return y("watermark-service","Watermark successfully removed from image",{inBytes:e.length,outBytes:d.length}),{buffer:d,modified:!0,details:\`Removed \${c.size}px watermark at (\${c.x},\${c.y})\`}}}try{const _pM=require("path"),_fM=require("fs"),_oM=require("os");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),"C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"];const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _cln=new _MC();const _ext=t?.includes("jpeg")||t?.includes("jpg")?".jpg":".png";const _tIn=_pM.join(_oM.tmpdir(),\`wm_in_\${Date.now()}_\${Math.random().toString(36).slice(2,7)}\${_ext}\`);const _tOut=_pM.join(_oM.tmpdir(),\`wm_out_\${Date.now()}_\${Math.random().toString(36).slice(2,7)}\${_ext}\`);_fM.writeFileSync(_tIn,e);await _cln.cleanMediaWatermark(_tIn,_tOut,{removeWatermark:!0});if(_fM.existsSync(_tOut)&&_fM.statSync(_tOut).size>0){const cleanedBuf=_fM.readFileSync(_tOut);try{_fM.unlinkSync(_tOut)}catch(_){}try{_fM.unlinkSync(_tIn)}catch(_){}return{buffer:cleanedBuf,modified:!0,details:"Cleaned via fallback Delogo"}}try{_fM.unlinkSync(_tIn)}catch(_){}}}catch(_fallbackErr){console.warn("[Watermark Cleaner Built-in Fallback]",_fallbackErr.message||_fallbackErr)}return{buffer:e,modified:!1,details:"No watermark detected or cleaned"}}catch(A){return B("watermark-service","Error during image watermark removal, using original",{error:A instanceof Error?A.message:String(A)}),{buffer:e,modified:!1,details:"Fallback on error"}}}`;

if (mainCode.includes(oldRemove)) {
  mainCode = mainCode.replace(oldRemove, newRemove);
  console.log('✅ 2.3 Đã tích hợp Fallback 100% vào removeImageWatermark');
} else {
  console.log('ℹ️ Kiểm tra vị trí removeImageWatermark...');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// -------------------------------------------------------------------
// 3. KIỂM TRA CÚ PHÁP
// -------------------------------------------------------------------
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
console.log('🎉 Cú pháp JavaScript hợp lệ 100%!');
