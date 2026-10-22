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

    logDebug("Starting Muse video job with Mascot Filter & Bottom Chatbar Target", { jobId: job.id, accountId: job.accountId });
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

    // 2. SNAPSHOT ALL EXISTING VIDEOS BEFORE SENDING PROMPT
    tracker.updateProgress(15, "Đang kiểm tra giao diện Muse AI...");
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
    logDebug("Initial video snapshot count before prompt", { count: initialVideoSet.size, urls: Array.from(initialVideoSet) });

    // 3. TARGET THE BOTTOM CHATBAR (+ NHẮN TIN) AND SEND PROMPT
    const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
    tracker.updateProgress(25, "Đang gửi prompt vào ô chat Muse AI...");

    const sendRes = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};

          function findChatInput() {
            // STEP A: If pill "+ Nhắn tin" or "+ Message" is visible at the bottom, click it
            const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
              if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
              const rect = b.getBoundingClientRect();
              if (rect.left < 250) return false; // Ignore sidebar
              const t = (b.innerText || '').toLowerCase().trim();
              return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
            });
            if (pills.length > 0) {
              pills[0].click();
            }

            // STEP B: Find input/textarea in main content area (rect.left > 250), strictly excluding search
            const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
              if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
              const rect = el.getBoundingClientRect();
              if (rect.left < 250) return false; // Ignore sidebar elements completely
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm')) return false;
              if (el.type === 'search') return false;
              return true;
            });

            // Priority 1: Has chat placeholder tokens
            const msgEl = all.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('message') || p.includes('chat') || p.includes('ask');
            });
            if (msgEl) return msgEl;

            // Priority 2: Lowest element on screen (chatbar is bottom-pinned)
            if (all.length > 0) {
              all.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
              return all[0];
            }

            return null;
          }

          let el = findChatInput();
          if (!el) {
            await new Promise(r => setTimeout(r, 1000));
            el = findChatInput();
          }

          if (!el) {
            return { success: false, error: "Không tìm thấy khung chat (+ Nhắn tin) ở phía dưới màn hình" };
          }

          el.focus();
          el.click();

          // Type prompt text
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

          // Look for send button or dispatch Enter
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
      throw new Error("Không thể gửi prompt vào Muse AI: " + (sendRes?.error || "Lỗi giao diện"));
    }

    tracker.updateProgress(35, "Prompt đã gửi! Muse AI đang tạo video...");

    // 4. POLLING LOOP WITH STRICT MASCOT FILTER (> 1.2 MB)
    const startTime = Date.now();
    const timeoutMs = 6 * 60 * 1000;
    let videoBytes = null;
    let finalVideoUrl = "";

    while (Date.now() - startTime < timeoutMs) {
      if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
      tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

      // Check in-page for new video elements
      const videoProbe = await wc.executeJavaScript(\`
        (async () => {
          try {
            const initial = new Set(\${JSON.stringify(Array.from(initialVideoSet))});
            const videos = Array.from(document.querySelectorAll('video'));

            // Look for any video with src NOT in initial snapshot
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

            return { found: false };
          } catch(e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);

      if (videoProbe?.found && videoProbe.src) {
        logDebug("Detected candidate video element!", videoProbe);
        tracker.updateProgress(94, "Đang kiểm tra và trích xuất file video từ Muse AI...");

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
            const candidateBytes = Buffer.from(fetchRes.data, 'base64');
            logDebug("Candidate video size check", { byteLength: candidateBytes.length });

            // CRITICAL MASCOT FILTER:
            // Mascot avatar is ~350KB. Real generated Muse videos are ALWAYS >= 1,200,000 bytes (typically 4.5MB - 8.2MB)!
            if (candidateBytes.length < 1200000) {
              logDebug("Ignored mascot/avatar video placeholder (size: " + candidateBytes.length + " bytes), waiting for real video...");
              // Add this mascot url to initialVideoSet so we never check it again
              initialVideoSet.add(videoProbe.src);
            } else {
              videoBytes = candidateBytes;
              finalVideoUrl = videoProbe.src;
              logDebug("Successfully captured REAL video bytes!", { byteLength: videoBytes.length });
              break;
            }
          }
        } catch(e) {
          logDebug("In-page fetch candidate error", { error: e.message });
        }
      }

      await new Promise(r => setTimeout(r, 2500));
    }

    if (!videoBytes || videoBytes.length < 1000000) {
      logDebug("Timed out waiting for real Muse video");
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
  console.log('✅ Đã cập nhật MuseVideoRuntime với bộ lọc Mascot siêu chuẩn vào main/index.js!');
} else {
  console.error('❌ Không tìm thấy vị trí MuseVideoRuntime trong main/index.js');
  process.exit(1);
}
