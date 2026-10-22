const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
const preloadPath = path.resolve(__dirname, '../app/out/preload/index.cjs');

// 1. PATCH PRELOAD
let preloadCode = fs.readFileSync(preloadPath, 'utf8');
if (!preloadCode.includes('importCookies:')) {
  preloadCode = preloadCode.replace(
    'attachSession:e=>r.ipcRenderer.invoke("browser:attachSession",e),',
    'attachSession:e=>r.ipcRenderer.invoke("browser:attachSession",e),importCookies:e=>r.ipcRenderer.invoke("browser:importCookies",e),'
  );
  fs.writeFileSync(preloadPath, preloadCode, 'utf8');
  console.log('✅ Đã cập nhật preload/index.cjs với API importCookies!');
} else {
  console.log('ℹ️ preload/index.cjs đã có importCookies.');
}

// 2. PATCH MAIN
let mainCode = fs.readFileSync(mainPath, 'utf8');

// A. Patch getJobConcurrencyLimit for Muse AI (5 threads, untouched for Veo3 & Grok)
if (!mainCode.includes('e?.payload?.model==="muse-video"||e?.provider==="muse"')) {
  mainCode = mainCode.replace(
    'getJobConcurrencyLimit(e){if(this.isDevBypassEnabled())return ko;',
    'getJobConcurrencyLimit(e){if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse")return 5;if(this.isDevBypassEnabled())return ko;'
  );
  console.log('✅ Đã cập nhật getJobConcurrencyLimit cho phép Muse AI chạy 5 luồng song song!');
}

// B. Patch IPC handler for browser:importCookies
if (!mainCode.includes('browser:importCookies')) {
  const attachHandlerAnchor = 'E.handle("browser:attachSession"';
  const importCookiesHandler = `E.handle("browser:importCookies", async (event, payload) => {
    try {
      const electron = require('electron');
      const accountId = payload?.accountId;
      const rawCookies = payload?.cookiesJson || payload?.cookies;
      if (!rawCookies) throw new Error("Chưa nhập nội dung Cookie JSON");

      // Find session
      let session = T.findSession(accountId);
      if (!session) {
        const allSessions = T.listSessions();
        session = allSessions.find(s => 
          (s.provider && s.provider.toLowerCase().includes("muse")) || 
          (s.startUrl && s.startUrl.includes("muse.ai"))
        );
      }
      if (!session) throw new Error("Không tìm thấy tài khoản Muse AI nào trong Browser Hub");

      let cookieList = [];
      if (typeof rawCookies === "string") {
        const trimmed = rawCookies.trim();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
          const parsed = JSON.parse(trimmed);
          cookieList = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          // Name=value format
          cookieList = trimmed.split(";").map(part => {
            const [name, ...val] = part.trim().split("=");
            return { name: name.trim(), value: val.join("=").trim(), domain: ".muse.ai", path: "/" };
          }).filter(c => c.name);
        }
      } else if (Array.isArray(rawCookies)) {
        cookieList = rawCookies;
      }

      const electronSess = electron.session.fromPartition(session.partition);
      let successCount = 0;
      for (const c of cookieList) {
        if (!c.name || !c.value) continue;
        const domain = (c.domain || ".muse.ai").replace(/^\\./, "");
        const url = "https://" + domain + (c.path || "/");
        try {
          await electronSess.cookies.set({
            url: url,
            name: c.name,
            value: c.value,
            domain: c.domain || ".muse.ai",
            path: c.path || "/",
            secure: c.secure !== false,
            httpOnly: !!c.httpOnly,
            expirationDate: c.expirationDate || (Math.floor(Date.now() / 1000) + 365 * 86400)
          });
          successCount++;
        } catch(e) {}
      }

      // Mark session as Logged In
      session.authStatus = "Logged In";
      session.diagnostics = { ...(session.diagnostics || {}), cookieImportedAt: new Date().toISOString() };
      $();

      return { success: true, count: successCount, message: "Đã nạp thành công " + successCount + " cookies vào tài khoản Muse AI!" };
    } catch(err) {
      return { success: false, error: err.message };
    }
  }),` + attachHandlerAnchor;

  mainCode = mainCode.replace(attachHandlerAnchor, importCookiesHandler);
  console.log('✅ Đã đăng ký IPC handler browser:importCookies!');
}

// C. Replace MuseVideoRuntime with Multi-threaded Background Window Engine
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
    const electron = require('electron');
    const fs = nodeFs;
    const path = nodePath;
    const os = { homedir: Jo, tmpdir: Aa };

    const logDebug = (msg, obj) => {
      try {
        const line = "[" + new Date().toISOString() + "] [Job " + job.id + "] " + msg + " " + (obj ? JSON.stringify(obj) : "") + "\\n";
        fs.appendFileSync(path.join(os.homedir(), "Desktop", "MUSE_DEBUG.log"), line);
      } catch (e) {}
    };

    logDebug("Starting Multi-threaded Muse video job", { jobId: job.id, accountId: job.accountId });
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
      throw new Error("Không tìm thấy tài khoản Muse AI trong Browser Hub. Vui lòng thêm hoặc mở tài khoản Muse AI.");
    }

    // 2. SPAWN DEDICATED INVISIBLE BACKGROUND WINDOW FOR THIS THREAD
    tracker.updateProgress(10, "Đang khởi tạo luồng xử lý độc lập...");
    logDebug("Spawning dedicated hidden window for partition", { partition: session.partition });

    const win = new electron.BrowserWindow({
      show: false,
      width: 1280,
      height: 800,
      webPreferences: {
        partition: session.partition,
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      const wc = win.webContents;
      tracker.updateProgress(15, "Đang tải trang Muse AI...");
      await win.loadURL("https://muse.ai/");
      await new Promise(r => setTimeout(r, 3500));

      // 3. Snapshot existing videos in this thread
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
      logDebug("Initial snapshot count", { count: initialVideoSet.size });

      // 4. Send prompt to the chat input
      const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
      tracker.updateProgress(25, "Đang gửi prompt vào ô chat Muse AI...");

      const sendRes = await wc.executeJavaScript(\`
        (async () => {
          try {
            const text = \${JSON.stringify(prompt)};

            function findChatInput() {
              // Pill "+ Nhắn tin" or "+ Message"
              const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
                if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
                const rect = b.getBoundingClientRect();
                if (rect.left < 250) return false;
                const t = (b.innerText || '').toLowerCase().trim();
                return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
              });
              if (pills.length > 0) {
                pills[0].click();
              }

              const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
                if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
                const rect = el.getBoundingClientRect();
                if (rect.left < 250) return false;
                const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                if (p.includes('search') || p.includes('tìm kiếm')) return false;
                if (el.type === 'search') return false;
                return true;
              });

              const msgEl = all.find(el => {
                const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                return p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('message') || p.includes('chat') || p.includes('ask');
              });
              if (msgEl) return msgEl;

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
              return { success: false, error: "Không tìm thấy khung chat (+ Nhắn tin) của Muse AI" };
            }

            el.focus();
            el.click();

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

            return { success: true, tagName: el.tagName };
          } catch(e) {
            return { success: false, error: e.message };
          }
        })()
      \`, true);

      logDebug("Send prompt result", sendRes);
      if (!sendRes?.success) {
        throw new Error("Không thể gửi prompt vào Muse AI: " + (sendRes?.error || "Lỗi giao diện"));
      }

      tracker.updateProgress(35, "Prompt đã gửi! Muse AI đang tạo video song song...");

      // 5. Polling for generated video in this thread
      const startTime = Date.now();
      const timeoutMs = 6 * 60 * 1000;
      let videoBytes = null;
      let finalVideoUrl = "";

      while (Date.now() - startTime < timeoutMs) {
        if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
        tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

        const videoProbe = await wc.executeJavaScript(\`
          (async () => {
            try {
              const initial = new Set(\${JSON.stringify(Array.from(initialVideoSet))});
              const videos = Array.from(document.querySelectorAll('video'));

              for (let i = videos.length - 1; i >= 0; i--) {
                const v = videos[i];
                const src = v.src || v.currentSrc || v.querySelector('source')?.src;
                if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                  return { found: true, src: src, duration: v.duration || 0 };
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

        if (videoProbe?.found && videoProbe.src) {
          logDebug("Candidate video found in thread", videoProbe);
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
              logDebug("Candidate size check", { byteLength: candidateBytes.length });

              // Strict Mascot Filter: ignore videos < 1,200,000 bytes
              if (candidateBytes.length < 1200000) {
                logDebug("Mascot avatar skipped (" + candidateBytes.length + " bytes), waiting for real video...");
                initialVideoSet.add(videoProbe.src);
              } else {
                videoBytes = candidateBytes;
                finalVideoUrl = videoProbe.src;
                logDebug("Captured real video successfully in thread!", { byteLength: videoBytes.length });
                break;
              }
            }
          } catch(e) {
            logDebug("Fetch candidate error in thread", { error: e.message });
          }
        }

        await new Promise(r => setTimeout(r, 2500));
      }

      if (!videoBytes || videoBytes.length < 1000000) {
        throw new Error("Quá thời gian chờ tạo video trên Muse AI (6 phút).");
      }

      tracker.updateProgress(98, "Đang lưu video vào Thư viện...");
      const assetService = this.assets || (typeof V !== 'undefined' ? V : null);
      if (!assetService || typeof assetService.cacheGeneratedVideoBytes !== 'function') {
        throw new Error("AssetService không khả dụng");
      }

      const savedAsset = await assetService.cacheGeneratedVideoBytes(job, {
        bytes: videoBytes,
        mimeType: "video/mp4",
        remoteUrl: finalVideoUrl || "https://muse.ai",
        providerAssetId: "muse-" + Date.now()
      });

      tracker.updateProgress(100, "Tạo video Muse AI hoàn tất!");
      logDebug("Successfully finished Muse AI job!", { assetId: savedAsset.id });

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
    } finally {
      // Clean up dedicated thread window
      try {
        if (!win.isDestroyed()) win.destroy();
      } catch(e) {}
    }
  }
}
`;

const start = mainCode.indexOf('class MuseVideoRuntime');
const end = mainCode.indexOf('class Ys');

if (start !== -1 && end !== -1) {
  mainCode = mainCode.slice(0, start) + newRuntimeCode + '\n' + mainCode.slice(end);
  fs.writeFileSync(mainPath, mainCode, 'utf8');
  console.log('✅ Đã cập nhật MuseVideoRuntime Multi-threaded Background Engine vào main/index.js!');
} else {
  console.error('❌ Không tìm thấy vị trí MuseVideoRuntime trong main/index.js');
  process.exit(1);
}
