const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainPath, 'utf8');

const newRuntimeCode = `class MuseVideoRuntime {
  providerId = "muse";

  constructor(sessions, assets, browserViewManager) {
    this.sessions = sessions;
    this.assets = assets;
    this.browserViewManager = browserViewManager;
  }

  supports(type) {
    return type === "Video" || type === "video";
  }

  async validateJob(job) {
    return true;
  }

  isSupported(job) {
    return true;
  }

  async runJob(job, tracker) {
    const fs = nodeFs;
    const path = nodePath;
    const os = { homedir: Jo, tmpdir: Aa };

    const logDebug = (msg, obj) => {
      try {
        const line = "[" + new Date().toISOString() + "] " + msg + " " + (obj ? JSON.stringify(obj) : "") + "\\n";
        fs.appendFileSync(path.join(os.homedir(), "Desktop", "MUSE_DEBUG.log"), line);
      } catch (e) {}
    };

    logDebug("Starting Muse video job with clean New Chat & Dual-Mode Capture", { jobId: job.id, accountId: job.accountId });
    tracker.updateProgress(5, "Đang kết nối tài khoản Muse AI...");

    // 1. Resolve Session
    let session = this.sessions?.getSession ? this.sessions.getSession(job.accountId) : null;
    if (!session && this.sessions?.listSessions) {
      const allSessions = this.sessions.listSessions();
      session = allSessions.find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }
    if (!session && typeof T !== 'undefined' && T.listSessions) {
      session = T.listSessions().find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }

    if (!session) {
      throw new Error("Không tìm thấy phiên đăng nhập Muse AI trong Browser Hub. Vui lòng thêm hoặc mở tài khoản Muse AI.");
    }

    const bvm = this.browserViewManager || (typeof W !== 'undefined' ? W : null);
    if (!bvm || typeof bvm.getOrCreateView !== 'function') {
      throw new Error("BrowserViewManager không khả dụng để điều khiển Muse AI");
    }

    const viewWrap = bvm.getOrCreateView(session);
    const wc = viewWrap.view.webContents;
    const currentUrl = wc.getURL() || "";
    logDebug("Current Muse WebContents URL", { url: currentUrl });

    if (!currentUrl.includes("muse.ai")) {
      tracker.updateProgress(10, "Đang mở trang Muse AI...");
      logDebug("Navigating Muse view to https://muse.ai/...");
      await wc.loadURL("https://muse.ai/");
      await new Promise(r => setTimeout(r, 4000));
    }

    // 2. TRIGGER NEW CHAT (ĐOẠN CHAT MỚI) SO EACH PROMPT RUNS IN ISOLATION
    tracker.updateProgress(15, "Đang mở đoạn chat mới sạch sẽ trên Muse AI...");
    const newChatRes = await wc.executeJavaScript(\`
      (async () => {
        try {
          // Look for "+" icon or New Chat buttons in sidebar or header
          const candidates = Array.from(document.querySelectorAll('button, a, div[role="button"], span')).filter(el => {
            if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
            const t = (el.innerText || '').trim();
            const tit = (el.getAttribute('title') || el.getAttribute('aria-label') || '').toLowerCase();
            return t === '+' || tit.includes('mới') || tit.includes('new') || tit.includes('chat') || tit.includes('cuộc trò chuyện');
          });

          // Prioritize sidebar "+" button
          const sidebarPlus = candidates.find(el => {
            const rect = el.getBoundingClientRect();
            return (rect.left < 320 && el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) || 
                   (rect.left < 320 && (el.innerText || '').trim() === '+');
          });

          if (sidebarPlus) {
            sidebarPlus.click();
            return { triggered: true, method: 'sidebar_plus' };
          }

          // If button with text "Đoạn chat mới" or "New chat"
          const textBtn = candidates.find(el => {
            const t = (el.innerText || '').toLowerCase();
            return t.includes('đoạn chat mới') || t.includes('new chat') || t.includes('cuộc trò chuyện mới');
          });
          if (textBtn) {
            textBtn.click();
            return { triggered: true, method: 'text_btn' };
          }

          if (candidates.length > 0) {
            candidates[0].click();
            return { triggered: true, method: 'candidate_first' };
          }

          return { triggered: false };
        } catch(e) {
          return { triggered: false, error: e.message };
        }
      })()
    \`, true);

    logDebug("New chat trigger result", newChatRes);
    await new Promise(r => setTimeout(r, 1500));

    // 3. SNAPSHOT INITIAL STATE (VIDEOS & DOWNLOAD LINKS)
    const initialSnapshot = await wc.executeJavaScript(\`
      (() => {
        try {
          const vList = [];
          document.querySelectorAll('video').forEach(v => {
            const s = v.src || v.currentSrc || v.querySelector('source')?.src;
            if (s) vList.push(s);
          });
          document.querySelectorAll('a[href*=".mp4"], a[download]').forEach(a => {
            if (a.href) vList.push(a.href);
          });
          return { videos: vList };
        } catch(e) {
          return { videos: [] };
        }
      })()
    \`, true);

    const initialVideoSet = new Set(initialSnapshot?.videos || []);
    logDebug("Initial video snapshot count", { count: initialVideoSet.size });

    // 4. PREPARE ELECTRON DOWNLOAD INTERCEPTOR AS A BACKUP
    let downloadedFile = null;
    let allowDownload = false;

    const downloadHandler = (event, item, webContents) => {
      try {
        if (!allowDownload) return;
        const filename = item.getFilename() || ("muse-" + Date.now() + ".mp4");
        const url = item.getURL();
        logDebug("will-download event intercepted!", { filename, url });
        const tempFilePath = path.join(os.tmpdir(), "muse_" + Date.now() + "_" + filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
        item.setSavePath(tempFilePath);
        item.once('done', (e, state) => {
          if (state === 'completed') {
            const sz = fs.existsSync(tempFilePath) ? fs.statSync(tempFilePath).size : 0;
            downloadedFile = { filePath: tempFilePath, filename, url, size: sz };
            logDebug("will-download completed", { filePath: tempFilePath, size: sz });
          }
        });
      } catch (err) {
        logDebug("will-download handler error: " + err.message);
      }
    };

    try {
      wc.session.on('will-download', downloadHandler);
    } catch (e) {}

    const cleanupListeners = () => {
      try { wc.session.removeListener('will-download', downloadHandler); } catch (e) {}
    };

    // 5. INPUT PROMPT INTO CHATBOX & SEND
    const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
    tracker.updateProgress(25, "Đang gửi prompt vào ô chat Muse AI...");

    const sendRes = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};

          function findChatInput() {
            // Find all input/textarea/contenteditable excluding sidebar/search
            const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]')).filter(el => {
              if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm')) return false;
              if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
              return true;
            });

            // Priority 1: Placeholder or aria-label matches chat tokens
            const msgEl = all.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('message') || p.includes('chat') || p.includes('ask');
            });
            if (msgEl) return msgEl;

            // Priority 2: Lowest element vertically on screen (chatbar is bottom-pinned)
            if (all.length > 0) {
              all.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
              return all[0];
            }

            // Priority 3: Pill button "+ Nhắn tin" or "+ Message"
            const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
              const t = (b.innerText || '').toLowerCase().trim();
              return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
            });
            if (pills.length > 0) {
              pills[0].click();
              const inp = document.querySelector('textarea, [contenteditable="true"], input[type="text"]');
              if (inp) return inp;
            }

            return null;
          }

          let el = findChatInput();
          if (!el) {
            await new Promise(r => setTimeout(r, 1000));
            el = findChatInput();
          }

          if (!el) {
            return { success: false, error: "Không tìm thấy khung chat (+ Nhắn tin) của Muse AI" };
          }

          el.focus();
          el.click();

          // Type text
          if (el.isContentEditable) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, text);
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
          }

          el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          await new Promise(r => setTimeout(r, 600));

          // Send
          const container = el.closest('form, div, footer') || document;
          const sendBtns = Array.from(container.querySelectorAll('button, [role="button"]')).filter(b => {
            if (b.disabled || b.offsetWidth <= 0) return false;
            const l = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
            return l.includes('send') || l.includes('gửi') || b.type === 'submit' || b.querySelector('svg');
          });

          if (sendBtns.length > 0) {
            sendBtns[sendBtns.length - 1].click();
          }

          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

          return { success: true, tagName: el.tagName, placeholder: el.placeholder || 'none' };
        } catch(e) {
          return { success: false, error: e.message };
        }
      })()
    \`, true);

    logDebug("Send prompt result", sendRes);
    if (!sendRes?.success) {
      cleanupListeners();
      throw new Error("Không thể gửi prompt vào Muse AI: " + (sendRes?.error || "Lỗi giao diện"));
    }

    tracker.updateProgress(35, "Prompt đã gửi! Muse AI đang tạo video...");
    allowDownload = true;

    // 6. POLLING LOOP: DUAL-MODE CAPTURE (DIRECT VIDEO BLOB + DOWNLOAD INTERCEPTOR)
    const startTime = Date.now();
    const timeoutMs = 6 * 60 * 1000;
    let videoBytes = null;
    let finalVideoUrl = "";

    try {
      while (Date.now() - startTime < timeoutMs) {
        if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
        tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

        // CHECK MODE 1: In-page <video> element with src not in initial snapshot
        const videoProbe = await wc.executeJavaScript(\`
          (async () => {
            try {
              const initial = new Set(\${JSON.stringify(Array.from(initialVideoSet))});
              const videos = Array.from(document.querySelectorAll('video'));

              for (let i = videos.length - 1; i >= 0; i--) {
                const v = videos[i];
                const src = v.src || v.currentSrc || v.querySelector('source')?.src;
                if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                  return { found: true, src: src, duration: v.duration || 0, readyState: v.readyState };
                }
              }

              // Also check anchor download links
              const mp4s = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download]'));
              for (let i = mp4s.length - 1; i >= 0; i--) {
                const a = mp4s[i];
                if (a.href && !initial.has(a.href)) {
                  return { found: true, src: a.href, duration: 5, readyState: 4 };
                }
              }

              // Check if Muse finished message indicates completion
              const bodyText = (document.body.innerText || '').toLowerCase();
              const isFinished = bodyText.includes('xong rồi') || bodyText.includes('đã xuất video') || bodyText.includes('here is your video');

              return { found: false, isFinished };
            } catch(e) {
              return { found: false, error: e.message };
            }
          })()
        \`, true);

        if (videoProbe?.found && videoProbe.src) {
          logDebug("Detected new video element!", videoProbe);
          tracker.updateProgress(94, "Đang trích xuất file video gốc từ Muse AI...");

          try {
            const fetchRes = await wc.executeJavaScript(\`
              (async () => {
                try {
                  const r = await fetch(\${JSON.stringify(videoProbe.src)});
                  const ab = await r.arrayBuffer();
                  let b = '';
                  const u8 = new Uint8Array(ab);
                  const l = u8.byteLength;
                  for (let i = 0; i < l; i++) {
                    b += String.fromCharCode(u8[i]);
                  }
                  return { ok: true, data: btoa(b), byteLength: l };
                } catch(e) {
                  return { ok: false, error: e.message };
                }
              })()
            \`, true);

            if (fetchRes?.ok && fetchRes.data) {
              videoBytes = Buffer.from(fetchRes.data, 'base64');
              finalVideoUrl = videoProbe.src;
              logDebug("Successfully downloaded video bytes in-page!", { byteLength: videoBytes.length });
              if (videoBytes.length > 50000) break;
            }
          } catch(e) {
            logDebug("In-page fetch error", { error: e.message });
          }
        }

        // CHECK MODE 2: Did will-download catch a file?
        if (downloadedFile && downloadedFile.filePath && fs.existsSync(downloadedFile.filePath)) {
          const stats = fs.statSync(downloadedFile.filePath);
          if (stats.size > 200000) {
            videoBytes = fs.readFileSync(downloadedFile.filePath);
            finalVideoUrl = downloadedFile.url || "https://muse.ai";
            logDebug("Successfully captured video via will-download!", { size: stats.size });
            break;
          }
        }

        await new Promise(r => setTimeout(r, 2500));
      }
    } finally {
      cleanupListeners();
    }

    if (!videoBytes || videoBytes.length < 50000) {
      logDebug("Timed out waiting for Muse video");
      throw new Error("Quá thời gian chờ tạo video trên Muse AI (6 phút). Vui lòng kiểm tra lại tiến trình trong Browser Hub.");
    }

    tracker.updateProgress(98, "Đang lưu video vào Thư viện...");
    logDebug("Caching generated video asset...", { bytesLength: videoBytes.length });

    const assetService = this.assets || (typeof V !== 'undefined' ? V : null);
    if (!assetService || typeof assetService.cacheGeneratedVideoBytes !== 'function') {
      throw new Error("AssetService không khả dụng để lưu video");
    }

    const savedAsset = await assetService.cacheGeneratedVideoBytes(job, {
      bytes: videoBytes,
      mimeType: "video/mp4",
      remoteUrl: finalVideoUrl || "https://muse.ai",
      providerAssetId: "muse-" + Date.now()
    });

    tracker.updateProgress(100, "Tạo video Muse AI hoàn tất!");
    logDebug("Successfully saved Muse AI video asset!", { assetId: savedAsset.id, localPath: savedAsset.localPath });

    return {
      assets: [savedAsset],
      provider: {
        operationId: "muse-" + Date.now(),
        raw: {
          model: "muse-video",
          prompt: prompt,
          remoteUrl: finalVideoUrl,
          accountId: session.accountId
        }
      }
    };
  }
}
`;

const start = code.indexOf('class MuseVideoRuntime');
const end = code.indexOf('class Ys');

if (start !== -1 && end !== -1) {
  code = code.slice(0, start) + newRuntimeCode + '\n' + code.slice(end);
  fs.writeFileSync(mainPath, code, 'utf8');
  console.log('✅ Đã cập nhật MuseVideoRuntime hoàn hảo vào main/index.js!');
} else {
  console.error('❌ Không tìm thấy vị trí MuseVideoRuntime trong main/index.js');
  process.exit(1);
}
