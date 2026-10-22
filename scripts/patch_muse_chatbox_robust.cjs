const fs = require('fs');

const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

const startMarker = 'class MuseVideoRuntime {';
const startIdx = content.indexOf(startMarker);
if (startIdx === -1) {
  console.error('startMarker not found!');
  process.exit(1);
}

const endMarker = 'class Ys{constructor(e){';
const endIdx = content.indexOf(endMarker, startIdx);
if (endIdx === -1) {
  console.error('endMarker not found!');
  process.exit(1);
}

console.log('Patching MuseVideoRuntime between', startIdx, 'and', endIdx);

const newMuseCode = `class MuseVideoRuntime {
  constructor(sessions, assets, browserViewManager) {
    this.sessions = sessions;
    this.assets = assets;
    this.browserViewManager = browserViewManager;
  }
  providerId = "muse";
  supports(type) { return type === "Video"; }
  async validateJob(job) {
    if (job.type !== "Video") throw new p("UNSUPPORTED_MODEL", "Muse video runtime can only run video jobs");
    const prompt = String(job.payload?.prompt || job.title || "").trim();
    if (!prompt) throw new p("PROVIDER_REJECTED", "Muse AI yêu cầu phải có prompt");
  }
  async runJob(job, tracker) {
    await this.validateJob(job);
    let session = job.accountId ? this.sessions.findSession(job.accountId) : null;
    if (!session) {
      session = this.sessions.listSessions().find(s => 
        (job.accountId && (s.accountId === job.accountId || String(s.accountName) === String(job.account) || String(s.accountDisplayName) === String(job.account))) ||
        (s.provider && s.provider.toLowerCase().includes("muse")) ||
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }
    if (!session) throw new p("AUTH_REQUIRED", "Không tìm thấy phiên trình duyệt của tài khoản Muse AI. Vui lòng thêm hoặc đăng nhập Muse AI trong Browser Hub trước", true);
    if (session.authStatus === "Logged Out") {
      throw new p("AUTH_REQUIRED", "Vui lòng đăng nhập vào Muse AI trong Browser Hub trước", true);
    }

    const logDebug = (msg, data = {}) => {
      try {
        const desktopDir = typeof Jo === "function" ? Jo() : (process.env.USERPROFILE || process.env.HOME || ".");
        const line = "[" + new Date().toISOString() + "] " + msg + " " + JSON.stringify(data) + "\\n";
        nodeFs.appendFileSync(nodePath.join(desktopDir, "Desktop", "MUSE_DEBUG.log"), line, "utf8");
      } catch(e) {}
    };

    logDebug("Starting Muse video job", { jobId: job.id, accountId: session.accountId });
    tracker.updateProgress(10, "Kết nối với trình duyệt Muse AI...");
    const viewInfo = this.browserViewManager.getOrCreateView(session);
    try {
      if (viewInfo?.view && typeof viewInfo.view.setBounds === "function") {
        const b = viewInfo.view.getBounds?.() || {};
        if (!b.width || b.width < 200) {
          viewInfo.view.setBounds({ x: 0, y: 0, width: 1280, height: 800 });
        }
      }
    } catch(e) {}
    const wc = viewInfo?.view?.webContents;
    if (!wc || wc.isDestroyed()) throw new Error("Trình duyệt Muse AI chưa sẵn sàng");

    // Ensure we are on https://muse.ai/
    const curUrl = wc.getURL() || '';
    logDebug("Current Muse WebContents URL", { url: curUrl });
    if (!curUrl || curUrl === 'about:blank' || curUrl.includes('verification') || curUrl.includes('access')) {
      logDebug("Navigating Muse view to https://muse.ai/...");
      await wc.loadURL('https://muse.ai/');
      await new Promise(r => setTimeout(r, 2500));
    }

    const prompt = String(job.payload?.prompt || job.title || "").trim();

    // 0. Handle Reference Image upload if provided
    const refIds = Array.isArray(job.payload?.referenceAssetIds) ? job.payload.referenceAssetIds : [];
    if (refIds.length > 0) {
      try {
        const refAsset = this.assets.getAsset(refIds[0]);
        if (refAsset?.localPath && nodeFs.existsSync(refAsset.localPath)) {
          const imgBase64 = nodeFs.readFileSync(refAsset.localPath).toString('base64');
          const mime = refAsset.mimeType || 'image/png';
          const fileName = nodePath.basename(refAsset.localPath) || 'reference.png';
          tracker.updateProgress(15, "Đang đính kèm ảnh tham chiếu...");
          
          await wc.executeJavaScript(\`
            (async () => {
              try {
                const b64 = \${JSON.stringify(imgBase64)};
                const mime = \${JSON.stringify(mime)};
                const fileName = \${JSON.stringify(fileName)};
                
                const binStr = atob(b64);
                const len = binStr.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binStr.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: mime });
                const file = new File([blob], fileName, { type: mime });
                
                let fileInput = document.querySelector('input[type="file"]');
                if (!fileInput) {
                  const attachBtn = Array.from(document.querySelectorAll('button, [role="button"], label, svg')).find(el => {
                    const l = (el.getAttribute('aria-label') || el.innerText || el.className || '').toLowerCase();
                    return l.includes('attach') || l.includes('upload') || l.includes('image') || l.includes('file') || l.includes('tải lên') || l.includes('đính kèm');
                  });
                  if (attachBtn) {
                    try { attachBtn.click(); } catch(e) {}
                    await new Promise(r => setTimeout(r, 400));
                    fileInput = document.querySelector('input[type="file"]');
                  }
                }
                
                if (fileInput) {
                  const dt = new DataTransfer();
                  dt.items.add(file);
                  fileInput.files = dt.files;
                  fileInput.dispatchEvent(new Event('change', { bubbles: true }));
                  fileInput.dispatchEvent(new Event('input', { bubbles: true }));
                  await new Promise(r => setTimeout(r, 1000));
                  return { success: true };
                }
                return { success: false, reason: "No file input found" };
              } catch(e) {
                return { success: false, error: e.message };
              }
            })()
          \`, true);
        }
      } catch(e) {
        logDebug("Reference image upload non-fatal error", { error: e.message });
      }
    }

    // 1. Snapshot initial videos to strictly avoid picking up old videos or mascots
    const initialVideos = await wc.executeJavaScript(\`
      (() => {
        try {
          const list = [];
          document.querySelectorAll('video').forEach(v => {
            const s = v.src || v.currentSrc || v.querySelector('source')?.src;
            if (s) list.push(s);
          });
          document.querySelectorAll('a[href*=".mp4"], a[download]').forEach(a => {
            if (a.href) list.push(a.href);
          });
          return list;
        } catch(e) { return []; }
      })()
    \`, true) || [];

    logDebug("Initial videos snapshot", { count: initialVideos.length, urls: initialVideos });

    tracker.updateProgress(25, "Đang mở khung chat và gửi prompt...");

    // 2. Ultra-robust async chat input finder, pill clicker, and sender
    const sendResult = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};

          function isChatInput(el) {
            if (!el || el.disabled || el.readOnly) return false;
            const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            if (p.includes('search') || p.includes('tìm kiếm') || p.includes('email') || p.includes('phone') || p.includes('password')) return false;
            if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
            return true;
          }

          async function findOrOpenInput() {
            // 2.1 First direct check: is an input or textarea already mounted?
            const allDirect = Array.from(document.querySelectorAll('textarea, input[data-slot="input"], div[contenteditable="true"], [role="textbox"], input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])')).filter(isChatInput);
            
            let directMatch = allDirect.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('message') || p.includes('chat') || p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('ask') || p.includes('tell') || p.includes('prompt');
            });
            if (directMatch) return directMatch;
            if (allDirect.length > 0) return allDirect[allDirect.length - 1];

            // 2.2 If not mounted, click the "+ Message" / "Nhắn tin" pill button
            const allElements = Array.from(document.querySelectorAll('button, [role="button"], div, span, a, p, label'));
            const plusBtn = allElements.find(el => {
              if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav, header')) return false;
              const txt = (el.innerText || '').trim().toLowerCase();
              return txt === '+ message' || txt === 'message' || txt === '+ tin nhắn' || txt === 'nhắn tin' || txt === '+ nhắn tin' || txt.includes('+ message');
            });

            if (plusBtn) {
              const triggerClick = (target) => {
                try {
                  target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                  target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
                  target.click();
                } catch(e) {}
              };

              triggerClick(plusBtn);
              if (plusBtn.parentElement) triggerClick(plusBtn.parentElement);
              if (plusBtn.closest('button, [role="button"]')) triggerClick(plusBtn.closest('button, [role="button"]'));

              // Poll for newly rendered input (React render cycle)
              for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 400));
                const recheck = Array.from(document.querySelectorAll('textarea, input[data-slot="input"], div[contenteditable="true"], [role="textbox"], input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])')).filter(isChatInput);
                const reMatch = recheck.find(el => {
                  const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                  return p.includes('message') || p.includes('chat') || p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('ask') || p.includes('tell') || p.includes('prompt');
                });
                if (reMatch) return reMatch;
                if (recheck.length > 0) return recheck[recheck.length - 1];
              }
            }

            // 2.3 Fallback: Click bottom middle of page/chat container to activate input
            const bottomEl = document.elementFromPoint(Math.floor(window.innerWidth / 2), window.innerHeight - 50);
            if (bottomEl) {
              try { bottomEl.click(); } catch(e) {}
              await new Promise(r => setTimeout(r, 500));
              const finalCheck = Array.from(document.querySelectorAll('textarea, input[data-slot="input"], div[contenteditable="true"], [role="textbox"], input[type="text"]')).filter(isChatInput);
              if (finalCheck.length > 0) return finalCheck[finalCheck.length - 1];
            }

            return null;
          }

          const el = await findOrOpenInput();
          if (!el) {
            // Collect diagnostic snapshot for debugging
            const debugInfo = {
              url: location.href,
              title: document.title,
              buttons: Array.from(document.querySelectorAll('button, [role="button"]')).map(b => (b.innerText || b.getAttribute('aria-label') || '').trim()).filter(Boolean).slice(0, 15),
              inputs: Array.from(document.querySelectorAll('input, textarea, [contenteditable="true"]')).map(i => ({
                tag: i.tagName,
                type: i.type,
                placeholder: i.placeholder || i.getAttribute('placeholder'),
                ariaLabel: i.getAttribute('aria-label')
              }))
            };
            return {
              success: false,
              debugInfo: debugInfo,
              error: 'Không tìm thấy khung chat (+ Message) của Muse AI. Vui lòng mở đúng màn hình Chat.'
            };
          }

          el.focus();
          el.click();

          // Type prompt text
          if (el.isContentEditable) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, text);
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          } else {
            const proto = Object.getPrototypeOf(el);
            const valSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (valSetter) {
              valSetter.call(el, text);
            } else {
              el.value = text;
            }
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          }

          await new Promise(r => setTimeout(r, 600));

          // Look for send button or dispatch Enter
          const container = el.closest('form, div') || document;
          let btn = Array.from(container.querySelectorAll('button, [role="button"]')).find(b => {
            if (b.offsetWidth <= 0 || b.disabled) return false;
            const label = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
            return label.includes('send') || label.includes('gửi') || b.type === 'submit';
          });

          if (btn) {
            btn.click();
          } else {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }

          return {
            success: true,
            tagName: el.tagName,
            placeholder: el.placeholder || el.getAttribute('placeholder'),
            timestamp: Date.now()
          };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    \`, true);

    logDebug("Send prompt result", sendResult);
    if (!sendResult?.success) {
      if (sendResult?.debugInfo) {
        logDebug("DOM Diagnostics upon failure", sendResult.debugInfo);
      }
      throw new Error(sendResult?.error || "Không thể gửi prompt vào Muse AI");
    }

    tracker.updateProgress(35, "Prompt đã gửi! Muse AI đang tạo video...");

    // 3. Poll for the newly created video (strictly ignore initial videos)
    const startTime = Date.now();
    const timeoutMs = 6 * 60 * 1000;
    const initialSet = new Set(initialVideos);

    while (Date.now() - startTime < timeoutMs) {
      if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
      tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

      const probe = await wc.executeJavaScript(\`
        (async () => {
          try {
            const initial = new Set(\${JSON.stringify(initialVideos)});
            const videos = Array.from(document.querySelectorAll('video'));
            
            for (let i = videos.length - 1; i >= 0; i--) {
              const v = videos[i];
              const src = v.src || v.currentSrc || v.querySelector('source')?.src;
              if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: v.duration || 5 };
              }
            }

            const mp4s = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download]'));
            for (let i = mp4s.length - 1; i >= 0; i--) {
              const a = mp4s[i];
              if (a.href && !initial.has(a.href)) {
                return { found: true, src: a.href, duration: 5 };
              }
            }

            return { found: false };
          } catch(e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);

      if (probe?.found && probe.src) {
        logDebug("Found generated video!", probe);
        tracker.updateProgress(94, "Đang tải video Muse AI về máy...");

        let videoBytes = null;
        try {
          const fetchRes = await wc.executeJavaScript(\`
            (async () => {
              try {
                const r = await fetch(\${JSON.stringify(probe.src)});
                const ab = await r.arrayBuffer();
                let b = '';
                const u8 = new Uint8Array(ab);
                const l = u8.byteLength;
                for (let i = 0; i < l; i++) {
                  b += String.fromCharCode(u8[i]);
                }
                return { ok: true, data: btoa(b) };
              } catch (e) {
                return { ok: false, error: e.message };
              }
            })()
          \`, true);
          if (fetchRes?.ok && fetchRes.data) {
            videoBytes = Buffer.from(fetchRes.data, 'base64');
          }
        } catch (e) {
          logDebug("In-page fetch error", { error: e.message });
        }

        if (!videoBytes && probe.src.startsWith('http')) {
          try {
            const resp = await fetch(probe.src);
            const ab = await resp.arrayBuffer();
            videoBytes = Buffer.from(ab);
          } catch (e) {}
        }

        if (videoBytes && videoBytes.length > 0) {
          logDebug("Video bytes downloaded successfully", { byteLength: videoBytes.length });
          tracker.updateProgress(97, "Đang lưu video vào Thư viện...");
          const cachedAsset = await this.assets.cacheGeneratedVideoBytes(job, {
            bytes: videoBytes,
            mimeType: "video/mp4",
            remoteUrl: probe.src,
            providerAssetId: "muse-" + Date.now()
          });
          tracker.updateProgress(100, "Tạo video Muse AI hoàn tất!");
          return {
            assets: [cachedAsset],
            provider: {
              operationId: "muse-" + Date.now(),
              raw: {
                model: "muse-video",
                prompt: prompt,
                remoteUrl: probe.src,
                accountId: session.accountId
              }
            }
          };
        }
      }

      await new Promise(r => setTimeout(r, 3000));
    }

    logDebug("Timed out waiting for Muse video");
    throw new Error("Quá thời gian chờ tạo video trên Muse AI (6 phút). Vui lòng kiểm tra lại tiến trình trong Browser Hub.");
  }
}
`;

content = content.substring(0, startIdx) + newMuseCode + content.substring(endIdx);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated app/out/main/index.js with robust chatbox opener');
