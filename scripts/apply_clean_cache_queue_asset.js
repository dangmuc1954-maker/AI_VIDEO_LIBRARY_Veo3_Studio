const fs = require('fs');
const vm = require('vm');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

const startMarker = 'async cacheQueueAsset(e,t,A){';
const endMarker = 'async downloadRemoteAsset(e,t,A=Hs){';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error("Markers not found!");
  process.exit(1);
}

const cleanMethod = `async cacheQueueAsset(e, t, A) {
  if (t.type !== "image" && t.type !== "video" && t.type !== "audio") return t;
  const o = t.url, n = o.startsWith("data:") ? Ws(o) : await this.downloadRemoteAsset(o, t.mimeType, t.type === "video" ? GP : Hs);
  if (t.type === "image" && !yo.has(n.mimeType)) throw new Error(\`Provider result is not a supported image: \${n.mimeType}\`);
  if (t.type === "video" && !Ks.has(n.mimeType)) throw new Error(\`Provider result is not a supported video: \${n.mimeType}\`);
  if (t.type === "audio" && !QP.has(n.mimeType)) throw new Error(\`Provider result is not a supported audio: \${n.mimeType}\`);
  
  let a = n.bytes, s = t.localVariantDiffersFromProvider, i = !1;
  const _shouldClean = Boolean(e.payload?.autoRemoveWatermark === !0 || e.payload?.removeWatermark === !0 || e.autoRemoveWatermark === !0 || e.removeWatermark === !0 || e.providerId === "banana" || e.providerId === "veo3" || e.provider === "Banana" || e.provider === "Veo3");
  
  if (_shouldClean) {
    try {
      if (t.type === "image") {
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
      } else if (t.type === "video") {
        let u = await Fs.removeVideoWatermarkFromBuffer(a, n.mimeType);
        if (u.modified && u.buffer && u.verified === !0) {
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
      const _pM = require("path"), _fM = require("fs");
      const _cPaths = [_pM.join(__dirname, "../../modules/media_watermark_cleaner.cjs"), _pM.join(__dirname, "../modules/media_watermark_cleaner.cjs"), _pM.join(process.cwd(), "app/modules/media_watermark_cleaner.cjs"), _pM.join(process.cwd(), "modules/media_watermark_cleaner.cjs"), process.resourcesPath ? _pM.join(process.resourcesPath, "app/modules/media_watermark_cleaner.cjs") : "", process.resourcesPath ? _pM.join(process.resourcesPath, "modules/media_watermark_cleaner.cjs") : "", "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/modules/media_watermark_cleaner.cjs"].filter(Boolean);
      const _mPath = _cPaths.find(p => _fM.existsSync(p));
      if (_mPath && _fM.existsSync(g.localPath)) {
        const _MC = require(_mPath);
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

  return {
    ...t,
    assetId: g.id,
    url: g.url,
    localPath: g.localPath,
    thumbnailPath: g.thumbnailPath,
    thumbnailUrl: g.thumbnailUrl,
    thumbnailMimeType: g.thumbnailMimeType,
    remoteUrl: g.remoteUrl,
    mimeType: g.mimeType,
    googleFlowBindings: g.googleFlowBindings,
    grokBindings: g.grokBindings,
    localVariantDiffersFromProvider: g.localVariantDiffersFromProvider,
    watermarkRemoved: i
  };
}`;

content = content.substring(0, startIdx) + cleanMethod + content.substring(endIdx);
fs.writeFileSync(mainPath, content, 'utf8');
console.log("Successfully replaced cacheQueueAsset with 100% clean and valid code!");
