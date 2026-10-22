const { BrowserWindow, session, app, net } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

/**
 * Google Flow Web In-Page RPC Runner for AI VIDEO LIBRARY
 * Direct browser execution inside authenticated Google Flow session.
 * Replaces fragile DOM button clicks and dead REST APIs with native In-Page Batchexecute RPCs.
 */

function getAssetsDir() {
  const base = (app && typeof app.getPath === 'function') 
    ? app.getPath('userData') 
    : path.join(process.env.APPDATA || '', 'AI_VIDEO_LIBRARY_DATA');
  const dir = path.join(base, 'assets');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function downloadUrlToFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadUrlToFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        fileStream.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`Download HTTP error: ${res.statusCode}`));
      }
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(destPath));
      });
    });
    req.on('error', (err) => {
      fileStream.close();
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

const RECAPTCHA_SITEKEY = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const BATCH_EXECUTE_PATH = "/_/AiSandboxAngularFrontend/data/batchexecute";

async function ensureWindowReady(sess) {
  // Strip CSP headers
  sess.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = { ...details.responseHeaders };
    for (const k of Object.keys(responseHeaders)) {
      if (k.toLowerCase().includes('content-security-policy')) {
        delete responseHeaders[k];
      }
    }
    callback({ responseHeaders });
  });

  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      session: sess,
      contextIsolation: false
    }
  });

  await win.loadURL('https://flow.google.com/');
  await new Promise(r => setTimeout(r, 4000));
  return win;
}

/**
 * Run Video Job via In-Page RPC
 */
async function runGoogleFlowWebVideoJob(job, context, sessionRecord, runtimeInstance) {
  const accId = job.accountId || sessionRecord.accountId;
  const partition = sessionRecord.partition || `persist:aivideo:${accId}`;
  const sess = session.fromPartition(partition);
  const assetsDir = getAssetsDir();

  const prompt = String(job.payload?.prompt || job.title || '').trim();
  const rawModel = String(job.payload?.model || '').toLowerCase();
  const ratio = String(job.payload?.ratio || '16:9').trim();

  let targetModelKey = 'VEO_3_1_LITE';
  if (rawModel.includes('flash') || rawModel.includes('omni')) {
    targetModelKey = 'OMNI_1_1_FLASH';
  } else if (rawModel.includes('fast')) {
    targetModelKey = 'VEO_3_1_FAST';
  } else if (rawModel.includes('quality')) {
    targetModelKey = 'VEO_3_1_QUALITY';
  } else {
    targetModelKey = 'VEO_3_1_LITE';
  }

  const ratioEnum = ratio.includes('9:16') ? 1 : 2; // 1 = 9:16, 2 = 16:9

  context.updateProgress?.(10, 'Kết nối phiên Google Flow...');
  const win = await ensureWindowReady(sess);

  try {
    if (context.signal?.aborted) throw new Error('Job cancelled');

    const currentUrl = win.webContents.getURL();
    if (currentUrl.includes('accounts.google.com') || currentUrl.includes('signin')) {
      throw new Error('AUTH_REQUIRED: Vui lòng đăng nhập Google Flow trong Browser Hub');
    }

    // Extract or generate projectId
    let projectId = currentUrl.match(/\/project\/([a-f0-9-]+)/i)?.[1];
    if (!projectId) {
      // Try to read from page or generate UUID
      const pId = await win.webContents.executeJavaScript(`(() => {
        const m = window.location.pathname.match(/\\/project\\/([a-f0-9-]+)/i);
        return m ? m[1] : null;
      })()`).catch(() => null);
      projectId = pId || require('crypto').randomUUID();
    }

    context.updateProgress?.(25, 'Gửi lệnh tạo video tới Google Flow...');

    // 1. Submit Video Generation via In-Page RPC YhhmEf
    const submitCode = `
      (async () => {
        try {
          const siteKey = ${JSON.stringify(RECAPTCHA_SITEKEY)};
          let recaptchaToken = '';
          if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
            try {
              recaptchaToken = await window.grecaptcha.enterprise.execute(siteKey, { action: 'VIDEO_GENERATION' });
            } catch (_) {}
          }

          const wiz = window.WIZ_global_data || {};
          const at = wiz.SNlM0e || '';
          const fsid = wiz.FdrFJe || '';
          const bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20260910.13_p0';
          const reqId = Math.floor(Math.random() * 900000 + 1000000);

          const clientUuid1 = crypto.randomUUID().toUpperCase();
          const clientUuid2 = crypto.randomUUID().toUpperCase();
          const clientSessionUuid = crypto.randomUUID().toUpperCase();
          const promptStructure = [null, null, [[[${JSON.stringify(prompt)}]]]];
          const ratioEnum = ${ratioEnum};
          const modelKey = ${JSON.stringify(targetModelKey)};
          const resolutionCode = 1;

          const modePayload = [
            promptStructure,
            modelKey,
            ratioEnum,
            null,
            [null, null, null, null, clientUuid1, clientUuid2],
            null,
            null,
            [resolutionCode]
          ];

          const projectId = ${JSON.stringify(projectId)};
          const innerPayload = [
            [modePayload],
            [
              null,
              null,
              null,
              null,
              null,
              projectId,
              null,
              null,
              null,
              null,
              [recaptchaToken || '', 1]
            ],
            [clientSessionUuid, 2]
          ];

          const rpcId = 'YhhmEf';
          const sourcePath = '/project/' + projectId;
          const queryParams = new URLSearchParams({
            rpcids: rpcId,
            'source-path': sourcePath,
            bl: bl,
            'f.sid': fsid,
            hl: 'en-US',
            _reqid: String(reqId),
            rt: 'c'
          });

          const url = ${JSON.stringify(BATCH_EXECUTE_PATH)} + '?' + queryParams.toString();
          const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
          const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: bodyData,
            credentials: 'include'
          });

          const text = await res.text();
          return { success: res.ok, status: res.status, responseText: text };
        } catch (err) {
          return { success: false, error: err.message };
        }
      })()
    `;

    const submitRes = await win.webContents.executeJavaScript(submitCode, true);
    if (!submitRes?.success) {
      throw new Error(`Google Flow Video Submit thất bại: ${submitRes?.error || submitRes?.status || 'Unknown error'}`);
    }

    // Extract mediaId from response
    const rawText = submitRes.responseText || '';
    const uuidMatches = rawText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi) || [];
    // mediaId is typically the first or second UUID different from projectId
    const mediaId = uuidMatches.find(u => u.toLowerCase() !== projectId.toLowerCase()) || uuidMatches[0];

    if (!mediaId) {
      throw new Error(`Không thể tìm thấy mediaId trong phản hồi Google Flow: ${rawText.slice(0, 300)}`);
    }

    context.updateProgress?.(35, `Đang xử lý video (ID: ${mediaId.slice(0, 8)})...`);

    // 2. Poll Status via In-Page RPC jwpduf
    let isCompleted = false;
    let pollCount = 0;
    const maxPolls = 120; // 4 minutes max

    while (!isCompleted && pollCount < maxPolls) {
      if (context.signal?.aborted) throw new Error('Job cancelled');
      await new Promise(r => setTimeout(r, 3000));
      pollCount++;

      const pollCode = `
        (async () => {
          try {
            const wiz = window.WIZ_global_data || {};
            const at = wiz.SNlM0e || '';
            const fsid = wiz.FdrFJe || '';
            const bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20260910.13_p0';
            const rpcId = 'jwpduf';
            const innerPayload = [null, null, [[${JSON.stringify(mediaId)}]]];
            const sourcePath = '/project/' + ${JSON.stringify(projectId)};
            const queryParams = new URLSearchParams({
              rpcids: rpcId,
              'source-path': sourcePath,
              bl: bl,
              'f.sid': fsid,
              hl: 'en-US',
              _reqid: String(Math.floor(Math.random() * 900000 + 1000000)),
              rt: 'c'
            });
            const url = ${JSON.stringify(BATCH_EXECUTE_PATH)} + '?' + queryParams.toString();
            const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
            const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

            const res = await fetch(url, {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
              body: bodyData,
              credentials: 'include'
            });
            const text = await res.text();
            return { success: res.ok, responseText: text };
          } catch (e) {
            return { success: false, error: e.message };
          }
        })()
      `;

      const pollRes = await win.webContents.executeJavaScript(pollCode, true);
      if (pollRes?.success && pollRes.responseText) {
        const pText = pollRes.responseText;
        // Check for completion status codes (STATUS_COMPLETE = 2 or 3)
        if (pText.includes('MEDIA_STATUS_COMPLETE') || pText.includes('"COMPLETE"') || pText.includes('COMPLETE') || pText.includes('https://')) {
          isCompleted = true;
          break;
        }
        // Progress update based on poll count
        const pct = Math.min(88, 35 + Math.round(pollCount * 0.5));
        context.updateProgress?.(pct, `Đang render video Veo 3 (${pct}%)...`);
      }
    }

    context.updateProgress?.(90, 'Lấy liên kết tải video chất lượng cao...');

    // 3. Fetch Direct Download URL via In-Page RPC as29s
    const getMediaCode = `
      (async () => {
        try {
          const wiz = window.WIZ_global_data || {};
          const at = wiz.SNlM0e || '';
          const fsid = wiz.FdrFJe || '';
          const bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20260910.13_p0';
          const rpcId = 'as29s';
          const innerPayload = [${JSON.stringify(mediaId)}];
          const sourcePath = '/project/' + ${JSON.stringify(projectId)};
          const queryParams = new URLSearchParams({
            rpcids: rpcId,
            'source-path': sourcePath,
            bl: bl,
            'f.sid': fsid,
            hl: 'en-US',
            _reqid: String(Math.floor(Math.random() * 900000 + 1000000)),
            rt: 'c'
          });
          const url = ${JSON.stringify(BATCH_EXECUTE_PATH)} + '?' + queryParams.toString();
          const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
          const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: bodyData,
            credentials: 'include'
          });
          const text = await res.text();
          return { success: res.ok, responseText: text };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    `;

    const mediaRes = await win.webContents.executeJavaScript(getMediaCode, true);
    let videoDownloadUrl = null;
    if (mediaRes?.success && mediaRes.responseText) {
      const urlMatch = mediaRes.responseText.match(/https:\/\/[^\s"',\\]+googlevideo\.com[^\s"',\\]+/i) ||
                       mediaRes.responseText.match(/https:\/\/[^\s"',\\]+\.mp4[^\s"',\\]*/i) ||
                       mediaRes.responseText.match(/https:\/\/flow-content\.google\/[^\s"',\\]+/i);
      if (urlMatch) {
        videoDownloadUrl = urlMatch[0].replace(/\\u0026/g, '&');
      }
    }

    if (!videoDownloadUrl) {
      // Fallback: try searching anywhere in the page DOM
      videoDownloadUrl = await win.webContents.executeJavaScript(`(() => {
        const v = document.querySelector('video[src*="http"]');
        return v ? v.src : null;
      })()`).catch(() => null);
    }

    if (!videoDownloadUrl) {
      throw new Error(`Không lấy được đường dẫn tải video từ Google Flow: ${mediaRes?.responseText?.slice(0, 300)}`);
    }

    context.updateProgress?.(95, 'Đang lưu video vào thư viện máy tính...');
    const targetFile = path.join(assetsDir, `veo3_${job.id}_${Date.now()}.mp4`);
    await downloadUrlToFile(videoDownloadUrl, targetFile);

    // 🛡️ TÙY CHỌN XÓA WATERMARK & UPSCALE VIDEO
    const shouldRemoveWatermark = job.payload?.removeWatermark === true || job.payload?.autoRemoveWatermark === true;
    const shouldUpscale = job.payload?.upscale1080p === true || job.payload?.upsampleResolution === '1080p' || job.payload?.resolution === '1080p';

    if (shouldRemoveWatermark || shouldUpscale) {
      try {
        context.updateProgress?.(97, shouldUpscale ? 'Đang nâng nét 1080p và xóa logo...' : 'Đang xóa Watermark logo video...');
        const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');
        const cleaner = new MediaWatermarkCleaner();
        await cleaner.cleanMediaWatermark(targetFile, null, {
          upscale1080p: shouldUpscale
        });
      } catch (postErr) {
        console.warn('[PostProcessing Video] Lỗi xử lý watermark/upscale:', postErr);
      }
    }

    const stats = fs.statSync(targetFile);

    return {
      assets: [{
        type: 'video',
        url: targetFile,
        localPath: targetFile,
        providerAssetId: mediaId,
        bytes: stats.size,
        mimeType: 'video/mp4'
      }],
      provider: {
        projectId: projectId,
        operationId: mediaId
      }
    };

  } finally {
    try { win.destroy(); } catch (_) {}
  }
}

/**
 * Run Image Job via In-Page RPC
 */
async function runGoogleFlowWebImageJob(job, context, sessionRecord, runtimeInstance) {
  const accId = job.accountId || sessionRecord.accountId;
  const partition = sessionRecord.partition || `persist:aivideo:${accId}`;
  const sess = session.fromPartition(partition);
  const assetsDir = getAssetsDir();

  const prompt = String(job.payload?.prompt || job.title || '').trim();
  const ratio = String(job.payload?.ratio || '16:9').trim();
  const ratioEnum = ratio.includes('9:16') ? 2 : ratio.includes('1:1') ? 1 : 3;

  context.updateProgress?.(15, 'Kết nối phiên Google Flow Image...');
  const win = await ensureWindowReady(sess);

  try {
    if (context.signal?.aborted) throw new Error('Job cancelled');

    const currentUrl = win.webContents.getURL();
    if (currentUrl.includes('accounts.google.com') || currentUrl.includes('signin')) {
      throw new Error('AUTH_REQUIRED: Vui lòng đăng nhập Google Flow trong Browser Hub');
    }

    let projectId = currentUrl.match(/\/project\/([a-f0-9-]+)/i)?.[1] || require('crypto').randomUUID();

    context.updateProgress?.(35, 'Gửi lệnh vẽ ảnh qua Google Flow RPC...');

    const submitCode = `
      (async () => {
        try {
          const siteKey = ${JSON.stringify(RECAPTCHA_SITEKEY)};
          let recaptchaToken = '';
          if (typeof window.grecaptcha?.enterprise?.execute === 'function') {
            try {
              recaptchaToken = await window.grecaptcha.enterprise.execute(siteKey, { action: 'IMAGE_GENERATION' });
            } catch (_) {}
          }

          const wiz = window.WIZ_global_data || {};
          const at = wiz.SNlM0e || '';
          const fsid = wiz.FdrFJe || '';
          const bl = wiz.cfb2h || 'boq_labs-ai-sandbox-frontend_20260910.13_p0';
          const reqId = Math.floor(Math.random() * 900000 + 1000000);

          const rpcId = 'ogiZ0b';
          const innerPayload = [
            null,
            null,
            null,
            null,
            [${JSON.stringify(prompt)}, ${ratioEnum}, "NARWHAL"],
            null,
            ${JSON.stringify(projectId)},
            null,
            null,
            null,
            [recaptchaToken || '', 1]
          ];

          const sourcePath = '/project/' + ${JSON.stringify(projectId)};
          const queryParams = new URLSearchParams({
            rpcids: rpcId,
            'source-path': sourcePath,
            bl: bl,
            'f.sid': fsid,
            hl: 'en-US',
            _reqid: String(reqId),
            rt: 'c'
          });

          const url = ${JSON.stringify(BATCH_EXECUTE_PATH)} + '?' + queryParams.toString();
          const fReq = JSON.stringify([[[rpcId, JSON.stringify(innerPayload), null, 'generic']]]);
          const bodyData = 'f.req=' + encodeURIComponent(fReq) + '&at=' + encodeURIComponent(at) + '&';

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
            body: bodyData,
            credentials: 'include'
          });

          const text = await res.text();
          return { success: res.ok, responseText: text };
        } catch (err) {
          return { success: false, error: err.message };
        }
      })()
    `;

    const res = await win.webContents.executeJavaScript(submitCode, true);
    if (!res?.success) {
      throw new Error(`Google Flow Image Submit thất bại: ${res?.error || 'Unknown error'}`);
    }

    const rawText = res.responseText || '';
    const imgUrlMatch = rawText.match(/https:\/\/flow-content\.google\/image\/[^\s"',\\]+/i) ||
                        rawText.match(/https:\/\/[^\s"',\\]+\.(png|jpg|jpeg|webp)[^\s"',\\]*/i);

    if (!imgUrlMatch) {
      throw new Error(`Không tìm thấy ảnh kết quả trong phản hồi Google Flow: ${rawText.slice(0, 300)}`);
    }

    const imgUrl = imgUrlMatch[0].replace(/\\u0026/g, '&');
    context.updateProgress?.(85, 'Đang tải ảnh về máy...');

    const targetFile = path.join(assetsDir, `banana_${job.id}_${Date.now()}.png`);
    await downloadUrlToFile(imgUrl, targetFile);

    // 🛡️ TÙY CHỌN XÓA WATERMARK & UPSCALE 2K ẢNH SHOWROOM
    const shouldRemoveWatermark = job.payload?.removeWatermark === true || job.payload?.autoRemoveWatermark === true;
    const shouldUpscale2k = job.payload?.upscale2k === true || job.payload?.imageResolution === '2k' || job.payload?.upsampleResolution === '2K' || job.payload?.resolution === '2K';

    if (shouldRemoveWatermark || shouldUpscale2k) {
      try {
        context.updateProgress?.(92, shouldUpscale2k ? 'Đang nâng nét 2K và xóa logo ảnh...' : 'Đang xóa logo ảnh Showroom...');
        const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');
        const cleaner = new MediaWatermarkCleaner();
        await cleaner.cleanMediaWatermark(targetFile, null, {
          removeWatermark: false, // Tuyệt đối không dùng Delogo làm nhám/mờ ảnh tĩnh
          upscale2k: shouldUpscale2k
        });
      } catch (imgErr) {
        console.warn('[PostProcessing Image] Lỗi xử lý ảnh:', imgErr);
      }
    }

    const stats = fs.statSync(targetFile);

    return {
      assets: [{
        type: 'image',
        url: targetFile,
        localPath: targetFile,
        providerAssetId: `flow-img-${Date.now()}`,
        bytes: stats.size,
        mimeType: 'image/png',
        resolution: shouldUpscale2k ? '2K' : 'Standard'
      }],
      provider: {
        projectId: projectId,
        operationId: `flow-img-${Date.now()}`
      }
    };

  } finally {
    try { win.destroy(); } catch (_) {}
  }
}

module.exports = {
  runGoogleFlowWebVideoJob,
  runGoogleFlowWebImageJob
};
