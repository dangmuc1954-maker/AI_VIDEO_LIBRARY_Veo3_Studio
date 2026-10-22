const fs = require('fs');

const mainFile = 'app/out/main/index.js';
let content = fs.readFileSync(mainFile, 'utf8');

const startTag = 'class MuseVideoRuntime';
const endTag = '\nclass Ys{';

const startIdx = content.indexOf(startTag);
const endIdx = content.indexOf(endTag, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find boundaries for class MuseVideoRuntime!');
  process.exit(1);
}

const newClassCode = `class MuseVideoRuntime {
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

    logDebug("Starting Muse video job with Ultra RAM Hook (Method 1)", { jobId: job.id, accountId: session.accountId });
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

    // =========================================================================
    // CÁCH 1: LƯỚI HỨNG RAM TỨC THÌ (URL.createObjectURL + MutationObserver Hook)
    // =========================================================================
    try {
      await wc.executeJavaScript(\`
        (() => {
          window.__muse_prompt_time = Date.now();
          window.__captured_video_blobs = window.__captured_video_blobs || [];

          // 1. Hook URL.createObjectURL để tóm ngay lập tức mọi blob video được sinh ra trong RAM
          if (!window.__muse_blob_hook_installed) {
            window.__muse_blob_hook_installed = true;
            const origCreate = URL.createObjectURL;
            URL.createObjectURL = function(obj) {
              const url = origCreate.call(this, obj);
              try {
                if (obj && (obj instanceof Blob || obj instanceof File || obj.size > 200000)) {
                  const isVideo = (obj.type && obj.type.includes('video')) || obj.size > 500000 || (!obj.type && obj.size > 200000);
                  if (isVideo) {
                    console.log("[MUSE_BLOB_HOOK_MATCH]", url, obj.size, obj.type);
                    window.__captured_video_blobs.push({
                      url: url,
                      size: obj.size,
                      type: obj.type || 'video/mp4',
                      time: Date.now(),
                      source: 'createObjectURL'
                    });
                  }
                }
              } catch(e) {}
              return url;
            };
          }

          // 2. Real-time DOM MutationObserver: Lập tức bắt mọi thẻ <video> được chèn vào DOM
          if (!window.__muse_observer_installed) {
            window.__muse_observer_installed = true;
            const obs = new MutationObserver((mutations) => {
              for (const m of mutations) {
                for (const node of m.addedNodes) {
                  if (node && node.nodeType === 1) {
                    if (node.tagName === 'VIDEO') {
                      const src = node.src || node.currentSrc;
                      if (src && (src.startsWith('blob:') || src.startsWith('http'))) {
                        window.__captured_video_blobs.push({ url: src, size: 2000000, time: Date.now(), source: 'mutation_video' });
                      }
                    } else if (node.querySelectorAll) {
                      node.querySelectorAll('video').forEach(v => {
                        const src = v.src || v.currentSrc;
                        if (src && (src.startsWith('blob:') || src.startsWith('http'))) {
                          window.__captured_video_blobs.push({ url: src, size: 2000000, time: Date.now(), source: 'mutation_video_child' });
                        }
                      });
                    }
                  }
                }
              }
            });
            obs.observe(document.body, { childList: true, subtree: true });
          }
        })()
      \`, true);
      logDebug("Installed Ultra RAM Hook (Method 1) successfully into WebContents!");
    } catch(e) {
      logDebug("Error installing Ultra RAM Hook", { error: e.message });
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

    // 1. Snapshot initial videos
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

    // 2. Direct chat input finder & sender
    const sendResult = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};

          function findChatInputDirectly() {
            // Priority 1: Check ANY textarea first (Muse chat is always a TEXTAREA)
            const textareas = Array.from(document.querySelectorAll('textarea')).filter(t => {
              if (t.disabled || t.readOnly) return false;
              const p = (t.placeholder || t.getAttribute('placeholder') || t.getAttribute('aria-label') || '').toLowerCase();
              return !p.includes('search') && !p.includes('tìm kiếm');
            });
            if (textareas.length > 0) return textareas[textareas.length - 1];

            // Priority 2: Check input elements
            const inputs = Array.from(document.querySelectorAll('input[data-slot="input"], input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="file"])')).filter(i => {
              if (i.disabled || i.readOnly) return false;
              const p = (i.placeholder || i.getAttribute('placeholder') || i.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm') || p.includes('email') || p.includes('phone') || p.includes('password')) return false;
              return true;
            });
            const chatInp = inputs.find(i => {
              const p = (i.placeholder || i.getAttribute('placeholder') || i.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('message') || p.includes('chat') || p.includes('nhắn tin') || p.includes('tin nhắn');
            });
            if (chatInp) return chatInp;
            if (inputs.length > 0) return inputs[inputs.length - 1];

            // Priority 3: Check contenteditable
            const editables = Array.from(document.querySelectorAll('div[contenteditable="true"], [role="textbox"]')).filter(e => {
              const p = (e.getAttribute('placeholder') || e.getAttribute('aria-label') || '').toLowerCase();
              return !p.includes('search');
            });
            if (editables.length > 0) return editables[editables.length - 1];

            return null;
          }

          async function findOrOpenInput() {
            let el = findChatInputDirectly();
            if (el) return el;

            // Click '+ Message' or 'Nhắn tin' button/pill
            const allElements = Array.from(document.querySelectorAll('button, [role="button"], div, span, a, p, label'));
            const plusBtn = allElements.find(el => {
              if (el.closest('aside, [class*="sidebar"], nav, header')) return false;
              const txt = (el.innerText || '').trim().toLowerCase();
              return txt === '+ message' || txt === 'message' || txt === '+ tin nhắn' || txt === 'nhắn tin' || txt === '+ nhắn tin' || txt.includes('+ message') || txt.includes('nhắn tin');
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

              for (let i = 0; i < 10; i++) {
                await new Promise(r => setTimeout(r, 400));
                el = findChatInputDirectly();
                if (el) return el;
              }
            }

            // Fallback click at bottom
            const bottomEl = document.elementFromPoint(Math.floor(window.innerWidth / 2), window.innerHeight - 50);
            if (bottomEl) {
              try { bottomEl.click(); } catch(e) {}
              await new Promise(r => setTimeout(r, 500));
              el = findChatInputDirectly();
              if (el) return el;
            }

            return null;
          }

          const el = await findOrOpenInput();
          if (!el) {
            return {
              success: false,
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

          await new Promise(r => setTimeout(r, 500));

          // Look for send button or dispatch Enter
          const container = el.closest('form, div, footer') || document;
          let btn = Array.from(container.querySelectorAll('button, [role="button"]')).find(b => {
            if (b.offsetWidth <= 0 || b.disabled) return false;
            const label = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
            return label.includes('send') || label.includes('gửi') || b.type === 'submit';
          });

          if (btn) {
            try { btn.click(); } catch(e) {}
          }

          // Always also dispatch Enter key
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

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
      throw new Error(sendResult?.error || "Không thể gửi prompt vào Muse AI");
    }

    tracker.updateProgress(35, "Prompt đã gửi! Muse AI đang tạo video...");

    // 3. Poll for the newly created video (Method 1 Super Fast Polling)
    const startTime = Date.now();
    const timeoutMs = 6 * 60 * 1000;
    const initialSet = new Set(initialVideos);

    while (Date.now() - startTime < timeoutMs) {
      if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
      tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

      // CÁCH 1: KIỂM TRA LƯỚI HỨNG RAM TỨC THÌ
      const probe = await wc.executeJavaScript(\`
        (async () => {
          try {
            const initial = new Set(\${JSON.stringify(initialVideos)});
            const promptTime = window.__muse_prompt_time || 0;

            // TẦNG 1: Kiểm tra danh sách blobs được tóm dính trong RAM (Lưới hứng tức thì)
            const captured = window.__captured_video_blobs || [];
            for (let i = captured.length - 1; i >= 0; i--) {
              const b = captured[i];
              if (b && b.url && !initial.has(b.url)) {
                if (b.time >= promptTime - 2000 && (b.size > 500000 || b.source?.includes('mutation'))) {
                  return { found: true, src: b.url, size: b.size, source: 'ram_hook' };
                }
              }
            }

            // TỰ ĐỘNG CUỘN ĐÁY & BẤM PLAY TRÊN VIDEO CARD MỚI NHẤT
            try {
              const scrollers = document.querySelectorAll('main, [class*="chat"], [class*="thread"], [class*="message"], [role="main"]');
              scrollers.forEach(s => { s.scrollTop = s.scrollHeight; });
              window.scrollTo(0, document.body.scrollHeight);
            } catch(e) {}

            try {
              const playBtns = Array.from(document.querySelectorAll('button, [role="button"], [class*="play"], svg, [aria-label*="play" i], [aria-label*="phát" i]')).filter(b => {
                if (b.closest('aside, [class*="sidebar"], [class*="status"], header')) return false;
                const r = b.getBoundingClientRect();
                return r.width > 20 && r.height > 20;
              });
              if (playBtns.length > 0) {
                const lastPlay = playBtns[playBtns.length - 1];
                lastPlay.click();
              }
            } catch(e) {}

            // TẦNG 2: Quét trực tiếp thẻ <video> trong DOM
            const videos = Array.from(document.querySelectorAll('video'));
            for (let i = videos.length - 1; i >= 0; i--) {
              const v = videos[i];
              if (v.closest('aside, [class*="status"], [class*="sidebar"], [class*="profile"], header')) continue;
              const rect = v.getBoundingClientRect();
              if (rect.width > 0 && rect.width < 180) continue;
              if (rect.height > 0 && rect.height < 180) continue;

              const src = v.src || v.currentSrc || v.querySelector('source')?.src;
              const isAccepted = (!initial.has(src)) || (Date.now() - promptTime > 35000);
              if (src && isAccepted && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: v.duration || 5, width: rect.width, height: rect.height, source: 'video_element' };
              }
            }

            // TẦNG 3: Quét link mp4 / download
            const mp4s = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download], a[href*="blob:"]'));
            for (let i = mp4s.length - 1; i >= 0; i--) {
              const a = mp4s[i];
              if (a.closest('aside, [class*="sidebar"], [class*="status"]')) continue;
              if (a.href && !initial.has(a.href)) {
                return { found: true, src: a.href, duration: 5, source: 'link' };
              }
            }

            return { found: false };
          } catch(e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);

      if (probe?.found && probe.src) {
        logDebug("Ultra RAM Hook caught generated video!", probe);
        tracker.updateProgress(94, "Đã tóm được video Muse AI! Đang bốc về máy...");

        let videoBytes = null;
        try {
          const fetchRes = await wc.executeJavaScript(\`
            (async () => {
              try {
                const r = await fetch(\${JSON.stringify(probe.src)});
                const blob = await r.blob();
                const b64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const res = String(reader.result || '');
                    const commaIdx = res.indexOf(',');
                    resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : res);
                  };
                  reader.onerror = () => reject(new Error('FileReader failed'));
                  reader.readAsDataURL(blob);
                });
                return { ok: true, data: b64, size: blob.size };
              } catch (e) {
                return { ok: false, error: e.message };
              }
            })()
          \`, true);
          if (fetchRes?.ok && fetchRes.data) {
            videoBytes = Buffer.from(fetchRes.data, 'base64');
            logDebug("Converted video blob via native FileReader successfully", { byteLength: videoBytes.length });
          } else {
            logDebug("FileReader fetchRes not ok", fetchRes);
          }
        } catch (e) {
          logDebug("In-page fetch error", { error: e.message });
        }

        if (videoBytes && videoBytes.length > 50000) {
          tracker.updateProgress(98, "Đang lưu video vào thư viện...");
          const savedAsset = await this.assets.cacheGeneratedVideoBytes(job, {
            bytes: videoBytes,
            mimeType: "video/mp4",
            remoteUrl: probe.src,
            providerAssetId: \`muse-\${Date.now()}\`
          });

          tracker.updateProgress(100, "Hoàn tất tạo video với Muse AI!");
          logDebug("Successfully saved Muse AI video asset", { assetId: savedAsset.id, localPath: savedAsset.localPath });
          return {
            assets: [savedAsset],
            provider: {
              operationId: \`muse-\${Date.now()}\`,
              raw: {
                prompt: prompt,
                remoteUrl: probe.src,
                accountId: session.accountId,
                width: probe.width || 1280,
                height: probe.height || 720,
                duration: probe.duration || 5
              }
            }
          };
        }
      }

      await new Promise(r => setTimeout(r, 2500));
    }

    logDebug("Timed out waiting for Muse video");
    throw new Error("Quá thời gian chờ tạo video trên Muse AI (6 phút). Vui lòng kiểm tra lại tiến trình trong Browser Hub.");
  }
}`;

content = content.substring(0, startIdx) + newClassCode + content.substring(endIdx);
fs.writeFileSync(mainFile, content, 'utf8');
console.log('✓ Successfully patched MuseVideoRuntime with Method 1 Ultra RAM Hook!');
