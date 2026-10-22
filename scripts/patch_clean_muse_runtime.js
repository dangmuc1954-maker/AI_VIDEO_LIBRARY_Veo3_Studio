const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainPath, 'utf8');

const newRuntimeCode = `class MuseVideoRuntime {
  constructor(sessions, assets, browserViewManager) {
    this.sessions = sessions;
    this.assets = assets;
    this.browserViewManager = browserViewManager;
  }
  providerId = "muse";
  supports(type) { return type === "Video"; }
  async validateJob(job) {
    if (job.type !== "Video") throw new p("UNSUPPORTED_MODEL", "Muse video runtime can only run video jobs");
    if (!job.accountId) throw new p("AUTH_REQUIRED", "Chọn tài khoản Muse AI để tiếp tục", true);
    const prompt = String(job.payload?.prompt || job.title || "").trim();
    if (!prompt) throw new p("PROVIDER_REJECTED", "Muse AI yêu cầu phải có prompt");
  }
  async runJob(job, tracker) {
    await this.validateJob(job);
    const session = this.sessions.findSession(job.accountId);
    if (!session) throw new p("AUTH_REQUIRED", "Không tìm thấy phiên trình duyệt của tài khoản Muse AI", true);
    if (session.authStatus !== "Logged In" && session.authStatus !== "Attached") {
      throw new p("AUTH_REQUIRED", "Vui lòng đăng nhập vào Muse AI trong Browser Hub trước", true);
    }

    const logDebug = (msg, data = {}) => {
      try {
        const line = "[" + new Date().toISOString() + "] " + msg + " " + JSON.stringify(data) + "\\n";
        fs.appendFileSync(path.join(process.env.APPDATA, "AI_VIDEO_LIBRARY_DATA", "muse-debug.log"), line, "utf8");
      } catch(e) {}
    };

    logDebug("Starting Muse video job", { jobId: job.id, accountId: session.accountId });
    tracker.updateProgress(10, "Kết nối với trình duyệt Muse AI...");
    const viewInfo = this.browserViewManager.getOrCreateView(session);
    const wc = viewInfo?.view?.webContents;
    if (!wc || wc.isDestroyed()) throw new Error("Trình duyệt Muse AI chưa sẵn sàng");

    const prompt = String(job.payload?.prompt || job.title || "").trim();

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

    tracker.updateProgress(25, "Đang gửi prompt vào ô chat (+ Message)...");

    // 2. Robust chat input finder and sender
    const sendResult = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};

          // Helper to find chat input, strictly excluding the sidebar search input
          function findChatInput() {
            // First check all editable elements
            const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]'));
            const candidates = all.filter(el => {
              if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              if (p.includes('search') || p.includes('tìm kiếm')) return false;
              if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
              return true;
            });

            // Priority 1: Has 'message' in placeholder or aria-label
            const msgInput = candidates.find(el => {
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return p.includes('message') || p.includes('chat') || p.includes('ask') || p.includes('tell');
            });
            if (msgInput) return msgInput;

            // Priority 2: Lowest candidate vertically on screen (chat input is at the bottom)
            if (candidates.length > 0) {
              candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
              return candidates[0];
            }

            // Priority 3: Search for element with text '+ Message'
            const plusText = Array.from(document.querySelectorAll('*')).find(el => {
              return el.children.length === 0 && (el.innerText || '').trim() === '+ Message';
            });
            if (plusText) {
              plusText.click();
              const parent = plusText.closest('form, div, footer');
              if (parent) {
                const inp = parent.querySelector('textarea, div[contenteditable="true"], input');
                if (inp) return inp;
              }
            }

            return null;
          }

          const el = findChatInput();
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
            
            // Look for any video with src NOT in initial snapshot
            for (let i = videos.length - 1; i >= 0; i--) {
              const v = videos[i];
              const src = v.src || v.currentSrc || v.querySelector('source')?.src;
              if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: v.duration || 5 };
              }
            }

            // Also check anchor download links for newly rendered mp4
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
}`;

const start = code.indexOf('class MuseVideoRuntime');
const end = code.indexOf('class Ys');

if (start !== -1 && end !== -1) {
  code = code.slice(0, start) + newRuntimeCode + '\n' + code.slice(end);
  fs.writeFileSync(mainPath, code, 'utf8');
  console.log('✅ Đã cập nhật MuseVideoRuntime chuẩn xác vào main/index.js!');
} else {
  console.error('❌ Không tìm thấy vị trí MuseVideoRuntime trong main/index.js');
}
