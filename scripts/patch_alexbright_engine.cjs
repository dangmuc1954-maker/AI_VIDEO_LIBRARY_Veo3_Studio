const fs = require('fs');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// Replace MuseVideoRuntime with the exact AlexBright-engineered engine
const alexBrightEngine = `class MuseVideoRuntime {
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

    logDebug("Starting AlexBright-style Muse video job", { jobId: job.id, accountId: job.accountId });
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

    // 2. SPAWN DEDICATED INVISIBLE BACKGROUND WINDOW (One page per task)
    tracker.updateProgress(10, "Đang mở phiên chat Muse mới...");
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
      
      // 3. NAVIGATE DIRECTLY TO /thread/new (Crucial: prevents picking up old chats/videos!)
      tracker.updateProgress(15, "Đang tạo luồng hội thoại mới (thread/new)...");
      await win.loadURL("https://muse.ai/thread/new");
      await new Promise(r => setTimeout(r, 3500));

      const currentUrl = wc.getURL();
      logDebug("Opened URL", { url: currentUrl });

      // Check if redirected to login screen
      if (currentUrl.includes('/login') || currentUrl.includes('accounts.google.com') || currentUrl.includes('auth.muse.ai')) {
        throw new Error("Tài khoản Muse AI chưa đăng nhập hoặc cookie đã hết hạn. Vui lòng mở Browser Hub hoặc nạp Cookie JSON.");
      }

      // 4. Send prompt to the chat input in the new thread
      const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
      tracker.updateProgress(25, "Đang gửi prompt vào chatbox Muse AI...");

      const sendRes = await wc.executeJavaScript(\`
        (async () => {
          try {
            const text = \${JSON.stringify(prompt)};

            // Function to find chat input
            function findChatInput() {
              // Check "+ Nhắn tin" or "+ Message" button
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
              await new Promise(r => setTimeout(r, 1200));
              el = findChatInput();
            }

            if (!el) {
              return { success: false, error: "Không tìm thấy khung chat của Muse AI tại /thread/new" };
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

            // Find send button (exact selectors from AlexBright tool)
            const sendBtn = document.querySelector('button[aria-label="Gửi"], button[aria-label="Send"], button[title="Gửi"], button[title="Send"]') ||
                            Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
                              const l = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
                              return (l.includes('send') || l.includes('gửi')) && b.offsetWidth > 0;
                            });

            if (sendBtn) {
              sendBtn.click();
            }

            // Also fire Enter key
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

            return { success: true };
          } catch(e) {
            return { success: false, error: e.message };
          }
        })()
      \`, true);

      logDebug("Send prompt result", sendRes);
      if (!sendRes?.success) {
        throw new Error("Không thể gửi prompt: " + (sendRes?.error || "Lỗi giao diện"));
      }

      tracker.updateProgress(35, "Prompt đã gửi! Đang theo dõi tiến trình tạo video...");

      // 5. Polling for generated video INSIDE [role="log"] (Pure AlexBright logic)
      const startTime = Date.now();
      const timeoutMs = 6 * 60 * 1000;
      let videoBytes = null;
      let finalVideoUrl = "";

      while (Date.now() - startTime < timeoutMs) {
        if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
        tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

        // Scan for video inside [role="log"]
        const scanRes = await wc.executeJavaScript(\`
          (() => {
            try {
              // 1. Check inside [role="log"] (chat message log of this thread)
              const log = document.querySelector('[role="log"]') || document.body;
              
              // A. Check [data-hatch-video-src]
              const hatchVideos = Array.from(log.querySelectorAll('[data-hatch-video-src]'));
              for (let i = hatchVideos.length - 1; i >= 0; i--) {
                const e = hatchVideos[i];
                const u = e.getAttribute('data-hatch-video-src');
                if (u && (u.startsWith('http') || u.startsWith('blob:'))) {
                  return { found: true, url: u };
                }
              }

              // B. Check standard video elements in log
              const videos = Array.from(log.querySelectorAll('video'));
              for (let i = videos.length - 1; i >= 0; i--) {
                const v = videos[i];
                const u = v.currentSrc || v.src || v.querySelector('source')?.src;
                if (u && (u.startsWith('http') || u.startsWith('blob:'))) {
                  // If video has duration > 0 or loaded
                  return { found: true, url: u, duration: v.duration || 0 };
                }
              }

              // C. Check download links in log
              const links = Array.from(log.querySelectorAll('a[href*=".mp4"], a[download]'));
              for (let i = links.length - 1; i >= 0; i--) {
                const a = links[i];
                if (a.href) return { found: true, url: a.href };
              }

              return { found: false };
            } catch(e) {
              return { found: false, error: e.message };
            }
          })()
        \`, true);

        if (scanRes?.found && scanRes.url) {
          logDebug("Candidate video found in log", scanRes);

          // Download blob using in-page fetch + FileReader (Exact AlexBright extraction)
          try {
            const blobRes = await wc.executeJavaScript(\`
              (async () => {
                try {
                  const r = await fetch(\${JSON.stringify(scanRes.url)});
                  if (!r.ok) return { ok: false, error: 'HTTP ' + r.status };
                  const blob = await r.blob();
                  if (blob.size > 256 * 1024 * 1024) return { ok: false, error: 'File quá lớn' };
                  
                  const b64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = () => reject(Error('Cannot read blob'));
                    reader.readAsDataURL(blob);
                  });
                  return { ok: true, size: blob.size, b64: b64 };
                } catch(e) {
                  return { ok: false, error: e.message };
                }
              })()
            \`, true);

            if (blobRes?.ok && blobRes.b64) {
              const bytes = Buffer.from(blobRes.b64, 'base64');
              logDebug("Candidate blob size check", { byteLength: bytes.length });

              // Filter out mascot / intro animations (< 1,200,000 bytes)
              if (bytes.length < 1200000) {
                logDebug("Mascot avatar skipped (" + bytes.length + " bytes), waiting for real video...");
              } else {
                videoBytes = bytes;
                finalVideoUrl = scanRes.url;
                logDebug("Captured real high-res video successfully!", { byteLength: videoBytes.length });
                break;
              }
            }
          } catch(e) {
            logDebug("Error reading candidate video blob", { error: e.message });
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
  mainCode = mainCode.slice(0, start) + alexBrightEngine + '\n' + mainCode.slice(end);
  fs.writeFileSync(mainPath, mainCode, 'utf8');
  console.log('✅ Đã cập nhật MuseVideoRuntime chuẩn kiến trúc AlexBright (thread/new + [role=log]) vào main/index.js!');
} else {
  console.error('❌ Không tìm thấy vị trí MuseVideoRuntime trong main/index.js');
  process.exit(1);
}
