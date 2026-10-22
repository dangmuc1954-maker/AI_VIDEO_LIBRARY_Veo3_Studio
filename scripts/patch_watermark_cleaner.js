const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== PATCHING MEDIA WATERMARK CLEANER FIX ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../extracted_original'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app')
];

for (const root of targetRoots) {
  const mainPath = path.join(root, 'out/main/index.js');
  if (!fs.existsSync(mainPath)) continue;
  console.log('[*] Updating:', mainPath);
  let code = fs.readFileSync(mainPath, 'utf8');

  // 1. Add __dirname definition and safe module resolver
  const anchor1 = 'const hD=import.meta.filename,na=import.meta.dirname,Nd=Ud.createRequire(import.meta.url);';
  const helperCode = 'const __dirname=na;function _getWatermarkCleanerModule(){const _pM=require("node:path"),_fM=require("node:fs");const _base=typeof na!=="undefined"?na:(typeof __dirname!=="undefined"?__dirname:process.cwd());const _cPaths=[_pM.join(_base,"../../modules/media_watermark_cleaner.cjs"),_pM.join(_base,"../modules/media_watermark_cleaner.cjs"),_pM.join(_base,"modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"app/modules/media_watermark_cleaner.cjs"),_pM.join(process.cwd(),"modules/media_watermark_cleaner.cjs"),process.resourcesPath?_pM.join(process.resourcesPath,"app/modules/media_watermark_cleaner.cjs"):"",process.resourcesPath?_pM.join(process.resourcesPath,"modules/media_watermark_cleaner.cjs"):"","C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);const _mPath=_cPaths.find(p=>_fM.existsSync(p));if(_mPath){try{return require(_mPath)}catch(e){console.warn("[MediaWatermarkCleaner require failed]:",e.message)}}return null;}';

  if (!code.includes('function _getWatermarkCleanerModule()')) {
    code = code.replace(anchor1, anchor1 + helperCode);
    console.log('  -> Added _getWatermarkCleanerModule and __dirname definition');
  }

  // 2. Replace builtin fallback in removeImageWatermark
  const oldBuiltinFallbackRegex = /try\{const _pM=require\("path"\),_fM=require\("fs"\);const _cPaths=\[_pM\.join\(__dirname[\s\S]*?No watermark detected or cleaned"\}\}/;
  const newBuiltinFallback = 'try{const _MC=_getWatermarkCleanerModule();if(_MC){const _cln=new _MC(A);const cleanedBuf=await _cln.cleanMediaWatermarkBuffer(e,t,{removeWatermark:!0});if(cleanedBuf&&cleanedBuf.length>0&&cleanedBuf!==e){return{buffer:cleanedBuf,modified:!0,details:"Cleaned via fallback Delogo"}}}}catch(_fallbackErr){console.warn("[Watermark Cleaner Built-in Fallback]",_fallbackErr.message||_fallbackErr)}return{buffer:e,modified:!1,details:"No watermark detected or cleaned"}}';

  if (oldBuiltinFallbackRegex.test(code)) {
    code = code.replace(oldBuiltinFallbackRegex, newBuiltinFallback);
    console.log('  -> Updated removeImageWatermark builtin fallback to safe resolver');
  }

  // 3. Update cacheQueueAsset image & video clean logic and safety net
  const oldCleanBlockRegex = /if \(_shouldClean\) \{[\s\S]*?console\.warn\("\[Post-Write Watermark Clean Safety Net\]"[\s\S]*?\}\s*\}\s*\}\s*return \{/;
  const newCleanBlock = `if (_shouldClean) {
    try {
      if (t.type === "image") {
        let u = await Fs.removeImageWatermark(a, n.mimeType);
        if (u && u.modified && u.buffer && u.buffer.length > 0) {
          a = u.buffer; s = !0; i = !0;
        } else {
          try {
            const _MC = _getWatermarkCleanerModule();
            if (_MC) {
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
      } else if (t.type === "video") {
        let u = await Fs.removeVideoWatermarkFromBuffer(a, n.mimeType);
        if (u && u.modified && u.buffer && u.verified === !0) {
          a = u.buffer; s = !0; i = !0;
        } else {
          try {
            const _MC = _getWatermarkCleanerModule();
            if (_MC) {
              const _ffP = await Fs.getFfmpegPath();
              const _cln = new _MC(_ffP);
              const cleanedBuf = await _cln.cleanMediaWatermarkBuffer(a, n.mimeType, { removeWatermark: !0 });
              if (cleanedBuf && cleanedBuf.length > 0 && cleanedBuf !== a) {
                a = cleanedBuf; s = !0; i = !0;
              }
            }
          } catch (_vErr) {
            console.warn("[Watermark Cleaner Video Fallback]", _vErr.message || _vErr);
          }
        }
      }
    } catch (u) {
      B("asset-store", "watermark removal failed in cacheQueueAsset, using original", { error: v(u) });
    }
  }

  const g = await this.writeAsset({
    id: q(),
    bytes: a,
    mimeType: n.mimeType,
    name: _getGenName(e, n.mimeType),
    sceneName: e.payload?.sceneName || (e.payload?.promptOrder ? ("Cảnh " + e.payload.promptOrder) : void 0),
    type: t.type,
    role: "generated",
    createdAt: new Date().toISOString(),
    remoteUrl: o.startsWith("data:") ? void 0 : o,
    providerId: e.providerId,
    provider: e.provider,
    providerAssetId: t.providerAssetId,
    accountId: e.accountId,
    account: e.account,
    jobId: e.id,
    promptId: typeof e.payload?.promptId == "string" ? e.payload.promptId : void 0,
    prompt: typeof e.payload?.prompt == "string" ? e.payload.prompt : e.title,
    ratio: typeof e.payload?.ratio == "string" ? e.payload.ratio : void 0,
    projectId: A,
    origin: "generated",
    pinnedAsReference: !1,
    googleFlowBindings: t.googleFlowBindings,
    grokBindings: t.grokBindings,
    localVariantDiffersFromProvider: s,
    watermarkRemoved: i,
    resolution: t.type === "video" ? Io(t.resolution) || Io(e.payload?.resolution) || "Standard" : e.payload?.upsampleResolution === "2K" || e.payload?.upsampleResolution === "4K" ? e.payload.upsampleResolution : "Standard"
  }, { persistence: "batched" });

  if (_shouldClean && !i && g.localPath) {
    try {
      const _MC = _getWatermarkCleanerModule();
      const _fM = require("node:fs");
      if (_MC && _fM.existsSync(g.localPath)) {
        const _ffP = await Fs.getFfmpegPath();
        const _cln = new _MC(_ffP);
        await _cln.cleanMediaWatermark(g.localPath, g.localPath, { removeWatermark: !0 });
        i = !0;
        g.watermarkRemoved = !0;
        const _curA = this.getAsset(g.id);
        if (_curA) {
          _curA.watermarkRemoved = !0;
          this.scheduleEmit();
        }
      }
    } catch (_postErr) {
      console.warn("[Post-Write Watermark Clean Safety Net]", _postErr.message || _postErr);
    }
  }

  return {`;

  if (oldCleanBlockRegex.test(code)) {
    code = code.replace(oldCleanBlockRegex, newCleanBlock);
    console.log('  -> Updated cacheQueueAsset with safe resolver and synchronous memory cleaning');
  }

  fs.writeFileSync(mainPath, code, 'utf8');

  // Validate syntax
  fs.writeFileSync('temp_check.mjs', code);
  try {
    execSync('node --check temp_check.mjs', { stdio: 'inherit' });
    console.log('  -> Syntax check passed for:', mainPath);
  } catch(e) {
    console.error('  -> Syntax check FAILED for:', mainPath);
    process.exit(1);
  } finally {
    try { fs.unlinkSync('temp_check.mjs'); } catch(_) {}
  }
}

// 4. Update VideoFactoryStudio.js for Fashion KOC Pro root job watermark flags
for (const root of targetRoots) {
  const vfsPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfsPath)) continue;
  console.log('[*] Updating VideoFactoryStudio.js at:', vfsPath);
  let vCode = fs.readFileSync(vfsPath, 'utf8');

  // Ensure root jobInput in generateSingleImage has autoRemoveWatermark & removeWatermark
  vCode = vCode.replace(
    /const jobInput = \{\s*title: `\[KOC Thời Trang\] Storyboard Cảnh \$\{frameId\}`,\s*type: "Image",\s*providerId: "banana",\s*provider: "Banana",/g,
    `const jobInput = {\n        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,\n        type: "Image",\n        providerId: "banana",\n        provider: "Banana",\n        autoRemoveWatermark: cs.removeWatermark !== false,\n        removeWatermark: cs.removeWatermark !== false,`
  );

  // Ensure root jobs in generateAllImages (Case 1) have autoRemoveWatermark & removeWatermark
  vCode = vCode.replace(
    /return \{\s*title: `\[KOC Thời Trang\] Storyboard Cảnh \$\{frame\.id\}`,\s*type: "Image",\s*providerId: "banana",\s*provider: "Banana",\s*\.\.\.\(targetAccId \? \{ accountId: targetAccId \} : \{\}\),\s*payload: \{/g,
    `return {\n            title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,\n            type: "Image",\n            providerId: "banana",\n            provider: "Banana",\n            autoRemoveWatermark: cs.removeWatermark !== false,\n            removeWatermark: cs.removeWatermark !== false,\n            ...(targetAccId ? { accountId: targetAccId } : {}),\n            payload: {`
  );

  // Ensure root f1Job in Case 3 has autoRemoveWatermark & removeWatermark
  vCode = vCode.replace(
    /const f1Job = \{\s*title: `\[KOC Thời Trang\] Storyboard Cảnh 1`,\s*type: "Image",\s*providerId: "banana",\s*provider: "Banana",\s*\.\.\.\(targetAccId \? \{ accountId: targetAccId, account: targetAccName \} : \{\}\),\s*payload: \{/g,
    `const f1Job = {\n          title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,\n          type: "Image",\n          providerId: "banana",\n          provider: "Banana",\n          autoRemoveWatermark: cs.removeWatermark !== false,\n          removeWatermark: cs.removeWatermark !== false,\n          ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),\n          payload: {`
  );

  // Ensure root jobs in dispatchScenesWaitingAnchor1 have autoRemoveWatermark & removeWatermark
  vCode = vCode.replace(
    /const jobs = waitingScenes\.map\(\(frame, idx\) => \{[\s\S]*?return \{\s*title: `\[KOC Thời Trang\] Storyboard Cảnh \$\{frame\.id\}`,\s*type: "Image",\s*providerId: "banana",\s*provider: "Banana",\s*\.\.\.\(targetAccId \? \{ accountId: targetAccId \} : \{\}\),\s*payload: \{/g,
    (match) => {
      if (match.includes('autoRemoveWatermark: cs.removeWatermark !== false')) return match;
      return match.replace(
        `provider: "Banana",`,
        `provider: "Banana",\n          autoRemoveWatermark: cs.removeWatermark !== false,\n          removeWatermark: cs.removeWatermark !== false,`
      );
    }
  );

  // Ensure root jobs in dispatchScenesWaitingAnchor3 have autoRemoveWatermark & removeWatermark
  vCode = vCode.replace(
    /const jobs = waitingScenes\.map\(\(frame, idx\) => \{[\s\S]*?return \{\s*title: `\[KOC Thời Trang\] Storyboard Cảnh \$\{frame\.id\}`,\s*type: "Image",\s*providerId: "banana",\s*provider: "Banana",\s*\.\.\.\(targetAccId \? \{ accountId: targetAccId \} : \{\}\),\s*payload: \{/g,
    (match) => {
      if (match.includes('autoRemoveWatermark: cs.removeWatermark !== false')) return match;
      return match.replace(
        `provider: "Banana",`,
        `provider: "Banana",\n          autoRemoveWatermark: cs.removeWatermark !== false,\n          removeWatermark: cs.removeWatermark !== false,`
      );
    }
  );

  fs.writeFileSync(vfsPath, vCode, 'utf8');

  // Validate syntax
  fs.writeFileSync('temp_check.mjs', vCode);
  try {
    execSync('node --check temp_check.mjs', { stdio: 'inherit' });
    console.log('  -> Syntax check passed for:', vfsPath);
  } catch(e) {
    console.error('  -> Syntax check FAILED for:', vfsPath);
    process.exit(1);
  } finally {
    try { fs.unlinkSync('temp_check.mjs'); } catch(_) {}
  }
}

console.log('=== ALL FILES PATCHED & VERIFIED SUCCESSFULLY ===');
