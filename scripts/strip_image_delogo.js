const fs = require('fs');

console.log('--- Removing image Delogo blur layer from app/out/main/index.js ---');
let content = fs.readFileSync('app/out/main/index.js', 'utf8');

// 1. Remove Delogo from removeImageWatermark
const targetCleanerInMethod = `try{const _MC=_getWatermarkCleanerModule();if(_MC){const _cln=new _MC(A);const cleanedBuf=await _cln.cleanMediaWatermarkBuffer(e,t,{removeWatermark:!0});if(cleanedBuf&&cleanedBuf.length>0&&cleanedBuf!==e){return{buffer:cleanedBuf,modified:!0,details:"Cleaned via fallback Delogo"}}}}catch(_fallbackErr){console.warn("[Watermark Cleaner Built-in Fallback]",_fallbackErr.message||_fallbackErr)}return{buffer:e,modified:!1,details:"No watermark detected or cleaned"}`;

const replaceCleanerInMethod = `return{buffer:e,modified:!1,details:"No watermark detected"}`;

if (!content.includes(targetCleanerInMethod)) {
  console.error('ERROR: Could not find targetCleanerInMethod in app/out/main/index.js');
  process.exit(1);
}
content = content.replace(targetCleanerInMethod, replaceCleanerInMethod);
console.log('1. Successfully stripped Delogo from removeImageWatermark');

// 2. Remove Delogo fallback from cacheQueueAsset (image branch)
const targetCacheImageBranch = `      if (t.type === "image") {
        let u = await Fs.removeImageWatermark(a, n.mimeType);
        if (u.modified) {
          a = u.buffer; s = !0; i = !0;
        } else {
          try {
            const _pM = require("path"), _fM = require("fs");
            const _cPaths = [_pM.join(__dirname, "../../modules/media_watermark_cleaner.cjs"), _pM.join(__dirname, "../modules/media_watermark_cleaner.cjs"), _pM.join(process.cwd(), "app/modules/media_watermark_cleaner.cjs"), _pM.join(process.cwd(), "modules/media_watermark_cleaner.cjs"), process.resourcesPath ? _pM.join(process.resourcesPath, "app/modules/media_watermark_cleaner.cjs") : "", process.resourcesPath ? _pM.join(process.resourcesPath, "modules/media_watermark_cleaner.cjs") : "", "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);
            const _mPath = _cPaths.find(p => _fM.existsSync(p));
            if (_mPath) {
              const _MC = require(_mPath);
              const _ffP = await Fs.getFfmpegPath();
              const _cln = new _MC(_ffP);
              const cleanedBuf = await _cln.cleanMediaWatermarkBuffer(a, n.mimeType, { removeWatermark: !0 });
              if (cleanedBuf && cleanedBuf.length > 0 && cleanedBuf !== a) {
                a = cleanedBuf; s = !0; i = !0;
              }
            }
          } catch (_dErr) {
            console.warn("[Watermark Cleaner Image Fallback]", _dErr.message || _dErr);
          }
        }
      } else if (t.type === "video") {`;

const replaceCacheImageBranch = `      if (t.type === "image") {
        let u = await Fs.removeImageWatermark(a, n.mimeType);
        if (u.modified) {
          a = u.buffer; s = !0; i = !0;
        }
      } else if (t.type === "video") {`;

if (!content.includes(targetCacheImageBranch)) {
  console.error('ERROR: Could not find targetCacheImageBranch in app/out/main/index.js');
  process.exit(1);
}
content = content.replace(targetCacheImageBranch, replaceCacheImageBranch);
console.log('2. Successfully stripped Delogo fallback from cacheQueueAsset (image branch)');

fs.writeFileSync('app/out/main/index.js', content, 'utf8');
console.log('Saved app/out/main/index.js successfully!');
