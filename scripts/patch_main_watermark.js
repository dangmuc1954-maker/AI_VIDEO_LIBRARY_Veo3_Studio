const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// Target 1: removeImageWatermark fallback
const target1 = 'try{const _pM=require("path"),_fM=require("fs"),_oM=require("os");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),"C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"];const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _cln=new _MC(A);const _ext=t?.includes("jpeg")||t?.includes("jpg")?".jpg":".png";const _tIn=_pM.join(_oM.tmpdir(),`wm_in_${Date.now()}_${Math.random().toString(36).slice(2,7)}${_ext}`);const _tOut=_pM.join(_oM.tmpdir(),`wm_out_${Date.now()}_${Math.random().toString(36).slice(2,7)}${_ext}`);_fM.writeFileSync(_tIn,e);await _cln.cleanMediaWatermark(_tIn,_tOut,{removeWatermark:!0});if(_fM.existsSync(_tOut)&&_fM.statSync(_tOut).size>0){const cleanedBuf=_fM.readFileSync(_tOut);try{_fM.unlinkSync(_tOut)}catch(_){}try{_fM.unlinkSync(_tIn)}catch(_){}return{buffer:cleanedBuf,modified:!0,details:"Cleaned via fallback Delogo"}}try{_fM.unlinkSync(_tIn)}catch(_){}}}catch(_fallbackErr){console.warn("[Watermark Cleaner Built-in Fallback]",_fallbackErr.message||_fallbackErr)}';

const replacement1 = 'try{const _pM=require("path"),_fM=require("fs");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),process.resourcesPath?_pM.join(process.resourcesPath,"app/modules/media_watermark_cleaner.cjs"):"",process.resourcesPath?_pM.join(process.resourcesPath,"modules/media_watermark_cleaner.cjs"):"","C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _cln=new _MC(A);const cleanedBuf=await _cln.cleanMediaWatermarkBuffer(e,t,{removeWatermark:!0});if(cleanedBuf&&cleanedBuf.length>0&&cleanedBuf!==e){return{buffer:cleanedBuf,modified:!0,details:"Cleaned via fallback Delogo"}}}}catch(_fallbackErr){console.warn("[Watermark Cleaner Built-in Fallback]",_fallbackErr.message||_fallbackErr)}';

if (content.includes(target1)) {
  content = content.replace(target1, replacement1);
  console.log('Target 1 replaced successfully!');
} else {
  console.warn('Target 1 NOT found!');
}

// Target 2: cacheQueueAsset fallback
const target2 = 'try{const _pM=require("path"),_fM=require("fs"),_oM=require("os");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),"C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"];const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _ffP=await Fs.getFfmpegPath();const _cln=new _MC(_ffP);const _ext=n.mimeType?.includes("jpeg")||n.mimeType?.includes("jpg")?".jpg":".png";const _tIn=_pM.join(_oM.tmpdir(),`wm_in_${Date.now()}_${Math.random().toString(36).slice(2,7)}${_ext}`);const _tOut=_pM.join(_oM.tmpdir(),`wm_out_${Date.now()}_${Math.random().toString(36).slice(2,7)}${_ext}`);_fM.writeFileSync(_tIn,a);await _cln.cleanMediaWatermark(_tIn,_tOut,{removeWatermark:!0});if(_fM.existsSync(_tOut)&&_fM.statSync(_tOut).size>0){a=_fM.readFileSync(_tOut);s=!0;i=!0;try{_fM.unlinkSync(_tOut)}catch(_){}}try{_fM.unlinkSync(_tIn)}catch(_){}}}catch(_dErr){console.warn("[Watermark Cleaner Image Fallback]",_dErr.message||_dErr)}';

const replacement2 = 'try{const _pM=require("path"),_fM=require("fs");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),process.resourcesPath?_pM.join(process.resourcesPath,"app/modules/media_watermark_cleaner.cjs"):"",process.resourcesPath?_pM.join(process.resourcesPath,"modules/media_watermark_cleaner.cjs"):"","C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _ffP=await Fs.getFfmpegPath();const _cln=new _MC(_ffP);const cleanedBuf=await _cln.cleanMediaWatermarkBuffer(a,n.mimeType,{removeWatermark:!0});if(cleanedBuf&&cleanedBuf.length>0&&cleanedBuf!==a){a=cleanedBuf;s=!0;i=!0}}}catch(_dErr){console.warn("[Watermark Cleaner Image Fallback]",_dErr.message||_dErr)}';

if (content.includes(target2)) {
  content = content.replace(target2, replacement2);
  console.log('Target 2 replaced successfully!');
} else {
  console.warn('Target 2 NOT found!');
}

// Target 3: Safety net right after writeAsset in cacheQueueAsset
const target3 = 'grokBindings:t.grokBindings,localVariantDiffersFromProvider:s,watermarkRemoved:i,resolution:t.type==="video"?Io(t.resolution)||Io(e.payload?.resolution)||"Standard":e.payload?.upsampleResolution==="2K"||e.payload?.upsampleResolution==="4K"?e.payload.upsampleResolution:"Standard"},{persistence:"batched"});return{...t,assetId:g.id,url:g.url,localPath:g.localPath,thumbnailPath:g.thumbnailPath,thumbnailUrl:g.thumbnailUrl,thumbnailMimeType:g.thumbnailMimeType,remoteUrl:g.remoteUrl,mimeType:g.mimeType,googleFlowBindings:g.googleFlowBindings,grokBindings:g.grokBindings,localVariantDiffersFromProvider:g.localVariantDiffersFromProvider,watermarkRemoved:i}';

const replacement3 = 'grokBindings:t.grokBindings,localVariantDiffersFromProvider:s,watermarkRemoved:i,resolution:t.type==="video"?Io(t.resolution)||Io(e.payload?.resolution)||"Standard":e.payload?.upsampleResolution==="2K"||e.payload?.upsampleResolution==="4K"?e.payload.upsampleResolution:"Standard"},{persistence:"batched"});if((e.payload?.autoRemoveWatermark===!0||e.payload?.removeWatermark===!0)&&t.type==="image"&&!i&&g.localPath){try{const _pM=require("path"),_fM=require("fs");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),process.resourcesPath?_pM.join(process.resourcesPath,"app/modules/media_watermark_cleaner.cjs"):"",process.resourcesPath?_pM.join(process.resourcesPath,"modules/media_watermark_cleaner.cjs"):"","C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath&&_fM.existsSync(g.localPath)){const _MC=require(_mPath);const _ffP=await Fs.getFfmpegPath();const _cln=new _MC(_ffP);await _cln.cleanMediaWatermark(g.localPath,g.localPath,{removeWatermark:!0});i=!0;g.watermarkRemoved=!0;const _curA=this.getAsset(g.id);if(_curA){_curA.watermarkRemoved=!0;this.scheduleEmit()}}}catch(_postErr){console.warn("[Post-Write Watermark Clean Safety Net]",_postErr.message||_postErr)}};return{...t,assetId:g.id,url:g.url,localPath:g.localPath,thumbnailPath:g.thumbnailPath,thumbnailUrl:g.thumbnailUrl,thumbnailMimeType:g.thumbnailMimeType,remoteUrl:g.remoteUrl,mimeType:g.mimeType,googleFlowBindings:g.googleFlowBindings,grokBindings:g.grokBindings,localVariantDiffersFromProvider:g.localVariantDiffersFromProvider,watermarkRemoved:i}';

if (content.includes(target3)) {
  content = content.replace(target3, replacement3);
  console.log('Target 3 replaced successfully!');
} else {
  console.warn('Target 3 NOT found!');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Saved app/out/main/index.js');
