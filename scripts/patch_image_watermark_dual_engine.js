const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] KÍCH HOẠT DUAL-ENGINE DELOGO XÓA SẠCH 100% WATERMARK ẢNH ===');

// 1. Patch app/out/main/index.js
const mainIndexPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainIndexPath, 'utf8');

const targetMain = 'if(t.type==="image"){const u=await Fs.removeImageWatermark(a,n.mimeType);u.modified&&(a=u.buffer,s=!0,i=!0)}';
const replacementMain = 'if(t.type==="image"){let u=await Fs.removeImageWatermark(a,n.mimeType);if(u.modified){a=u.buffer;s=!0;i=!0}else{try{const _pM=require("path"),_fM=require("fs"),_oM=require("os");const _cPaths=[_pM.join(__dirname,"../../modules/media_watermark_cleaner.cjs"),_pM.join(__dirname,"../modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs")];const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){const _MC=require(_mPath);const _cln=new _MC();const _tIn=_pM.join(_oM.tmpdir(),`wm_in_${Date.now()}_${Math.random().toString(36).slice(2,7)}.png`);const _tOut=_pM.join(_oM.tmpdir(),`wm_out_${Date.now()}_${Math.random().toString(36).slice(2,7)}.png`);_fM.writeFileSync(_tIn,a);await _cln.cleanMediaWatermark(_tIn,_tOut,{removeWatermark:!0});if(_fM.existsSync(_tOut)){a=_fM.readFileSync(_tOut);s=!0;i=!0;try{_fM.unlinkSync(_tOut)}catch(_){}}try{_fM.unlinkSync(_tIn)}catch(_){}}}catch(_dErr){console.warn("[Watermark Cleaner Image Fallback]",_dErr.message||_dErr)}}}';

if (mainCode.includes(targetMain)) {
  mainCode = mainCode.replace(targetMain, replacementMain);
  fs.writeFileSync(mainIndexPath, mainCode, 'utf8');
  console.log('✅ Đã patch Dual-Engine Delogo vào app/out/main/index.js');
} else if (mainCode.includes('[Watermark Cleaner Image Fallback]')) {
  console.log('ℹ️ app/out/main/index.js đã được patch trước đó.');
} else {
  console.error('❌ Không tìm thấy target trong app/out/main/index.js');
  process.exit(1);
}

// 2. Patch app/modules/google_flow_web_runner.js
const runnerPath = path.join(__dirname, '../app/modules/google_flow_web_runner.js');
if (fs.existsSync(runnerPath)) {
  let runnerCode = fs.readFileSync(runnerPath, 'utf8');
  runnerCode = runnerCode.replace(
    /const shouldRemoveWatermark = job\.payload\?\.removeWatermark === true;/g,
    'const shouldRemoveWatermark = job.payload?.removeWatermark === true || job.payload?.autoRemoveWatermark === true;'
  );
  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('✅ Đã cập nhật google_flow_web_runner.js');
}

// 3. Kiểm tra AST syntax
try {
  execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] app/out/main/index.js cú pháp JavaScript 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] Syntax error in app/out/main/index.js');
  process.exit(1);
}

console.log('=== HOÀN TẤT PATCH DUAL-ENGINE DELOGO ===');
