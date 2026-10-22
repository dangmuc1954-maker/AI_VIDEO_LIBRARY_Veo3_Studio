const fs = require('fs');

const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Update _B
const targetB = 'function _B(r,e){return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}';
const replaceB = 'function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||(r.providerId&&r.providerId.startsWith("custom-")))){if(r.accountId)return{accountId:r.accountId,account:r.account};const ms=T.listSessions().find(s=>s.providerId==="muse"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));if(ms)return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}';

if (!content.includes(targetB)) {
  console.error('targetB not found!');
  process.exit(1);
}
content = content.replace(targetB, replaceB);

// 2. Update dt.register(new MuseVideoRuntime...)
const targetReg = 'dt.register(new MuseVideoRuntime(d=>T.findSession(d),V,W))';
const replaceReg = 'dt.register(new MuseVideoRuntime(T,V,W))';
if (!content.includes(targetReg)) {
  console.error('targetReg not found!');
  process.exit(1);
}
content = content.replace(targetReg, replaceReg);

// 3. Update MuseVideoRuntime class definition
const startMarker = 'class MuseVideoRuntime {';
const endMarker = 'class Ys';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Cannot find MuseVideoRuntime boundaries!');
  process.exit(1);
}

const newClass = `class MuseVideoRuntime {
  constructor(sessions, assets, browserViewManager) {
    this.sessions = sessions;
    this.assets = assets;
    this.browserViewManager = browserViewManager;
  }
  providerId = "muse";
  supports(type) {
    return type === "Video";
  }
  async validateJob(job) {
    if (!this.supports(job.type)) throw new Error("Muse AI video runtime chỉ hỗ trợ Video jobs");
    const prompt = job.input?.payload?.prompt || job.payload?.prompt || job.title;
    if (!prompt || !prompt.trim()) throw new Error("Job video Muse AI cần có nội dung prompt");
  }
  findSession(job) {
    const accId = job.accountId || job.input?.accountId || job.payload?.accountId;
    if (accId) {
      const s = typeof this.sessions?.findSession === "function" ? this.sessions.findSession(accId) : (typeof this.sessions === "function" ? this.sessions(accId) : null);
      if (s) return s;
    }
    if (typeof this.sessions?.listSessions === "function") {
      const list = this.sessions.listSessions();
      return list.find(s => s.providerId === "muse" || (s.provider && s.provider.toLowerCase().includes("muse")) || (s.startUrl && s.startUrl.includes("muse.ai")) || (s.currentUrl && s.currentUrl.includes("muse.ai")) || s.providerId?.startsWith("custom-"));
    }
    return null;
  }
  async runJob(job, tracker) {
    await this.validateJob(job);
    const session = this.findSession(job);
    if (!session) throw new Error("Không tìm thấy phiên Muse AI trong Browser Hub. Vui lòng mở Browser Hub và thêm tài khoản Muse AI!");
    if (session.authStatus !== "Logged In") {
      throw new Error("Vui lòng đăng nhập tài khoản Muse AI trước trong Browser Hub");
    }

    const prompt = job.input?.payload?.prompt || job.payload?.prompt || job.title;
    tracker.updateProgress(10, "Đang kết nối phiên Muse AI trong Browser Hub...");

    const viewInfo = this.browserViewManager.getOrCreateView(session);
    const wc = viewInfo?.view?.webContents;
    if (!wc || wc.isDestroyed()) throw new Error("Trình duyệt Muse AI chưa sẵn sàng");

    let curUrl = wc.getURL();
    if (!curUrl || !curUrl.includes("muse.ai")) {
      tracker.updateProgress(15, "Đang truy cập trang Muse AI...");
      await this.browserViewManager.loadUrl(viewInfo, "https://muse.ai/");
      await new Promise(r => setTimeout(r, 2500));
    }

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

    tracker.updateProgress(25, "Đang gửi prompt vào chat Muse AI...");
    const sendResult = await wc.executeJavaScript(\`
      (async () => {
        try {
          const text = \${JSON.stringify(prompt)};
          
          const fireEvents = (el) => {
            el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          };
          
          let el = document.querySelector('[placeholder*="Message"], [data-placeholder*="Message"], [aria-label*="Message"], textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]');
          if (!el) {
            el = document.querySelector('[placeholder*="Chat"], [placeholder*="Ask"], [placeholder*="Tell"]');
          }
          if (!el) return { success: false, error: 'Không tìm thấy khung chat (+ Message) trên Muse AI' };
          
          el.focus();
          if (el.isContentEditable) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, text);
            fireEvents(el);
          } else {
            const proto = Object.getPrototypeOf(el);
            const valSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (valSetter) {
              valSetter.call(el, text);
            } else {
              el.value = text;
            }
            fireEvents(el);
          }
          
          await new Promise(r => setTimeout(r, 800));
          
          let btn = document.querySelector('button[aria-label*="Send"], button[aria-label*="Gửi"], button[type="submit"], [role="button"][aria-label*="Send"]');
          if (!btn) {
            const form = el.closest('form, div');
            if (form) {
              const allBtns = Array.from(form.querySelectorAll('button')).filter(b => !b.disabled && b.offsetWidth > 0);
              if (allBtns.length > 0) btn = allBtns[allBtns.length - 1];
            }
          }
          
          if (btn) {
            btn.click();
          } else {
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          }
          
          return { success: true, timestamp: Date.now() };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    \`, true);

    if (!sendResult?.success) {
      throw new Error(sendResult?.error || "Không thể gửi prompt vào Muse AI");
    }

    tracker.updateProgress(40, "Muse AI đang tạo video...");

    const startTime = Date.now();
    const timeoutMs = 5 * 60 * 1000;

    while (Date.now() - startTime < timeoutMs) {
      if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const curPct = Math.min(92, 40 + Math.floor(elapsed / 2.5));
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
            
            if (initial.size === 0 && videos.length > 0) {
              const last = videos[videos.length - 1];
              const src = last.src || last.currentSrc || last.querySelector('source')?.src;
              if (src && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: last.duration || 5 };
              }
            }

            return { found: false };
          } catch (e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);

      if (probe?.found && probe.src) {
        tracker.updateProgress(94, "Đang trích xuất video từ Muse AI...");
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
          console.warn("[MuseRuntime] in-page video fetch failed:", e);
        }

        if (!videoBytes && probe.src.startsWith('http')) {
          try {
            const resp = await fetch(probe.src);
            const ab = await resp.arrayBuffer();
            videoBytes = Buffer.from(ab);
          } catch (e) {}
        }

        if (videoBytes && videoBytes.length > 0) {
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

    throw new Error("Quá thời gian chờ tạo video trên Muse AI (5 phút). Vui lòng kiểm tra lại phiên Muse AI trong Browser Hub.");
  }
}
\n`;

content = content.slice(0, startIdx) + newClass + content.slice(endIdx);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched app/out/main/index.js');
