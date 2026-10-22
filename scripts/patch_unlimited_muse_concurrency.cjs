const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] MỞ ĐA LUỒNG KHÔNG GIỚI HẠN & TỰ ĐỘNG CHIA ĐỀU TÀI KHOẢN HOẠT ĐỘNG CHO MUSE AI ===');

// ---------------------------------------------------------
// 1. SỬA app/out/main/index.js
// ---------------------------------------------------------
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 1.1 Mở trần Concurrency Limit thành ko = 500 (Đa luồng không giới hạn, khách nạp bao nhiêu chạy bấy nhiêu)
mainCode = mainCode.replace(
  /if\(e\?\.payload\?\.model==="muse-video"\|\|e\?\.payload\?\.provider==="muse"\|\|e\?\.provider==="muse"\|\|e\?\.providerId==="muse"\|\|e\?\.provider==="Muse AI"\)return\s*[^;]+;/,
  'if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return ko;'
);
console.log('✅ 1.1 Category Concurrency Limit Muse AI = ko (500, Không giới hạn luồng)');

// 1.2 Mở Sc.getLimit cho Muse AI thành ko (500) để không giới hạn slot tài khoản
mainCode = mainCode.replace(
  /getLimit\(e\)\{return Math\.max\(1,Math\.floor\(this\.resolveLimit\(e\)\|\|1\)\)\}/,
  'getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return ko;return Math.max(1,Math.floor(this.resolveLimit(e)||1))}'
);
console.log('✅ 1.2 Slot Limit trong Scheduler Sc = ko (500, Không giới hạn slot)');

// 1.3 Cập nhật MuseVideoRuntime: Tự động chia đều cho các tài khoản đang hoạt động (có Cookie thật)
// 1 acc -> 100% lệnh vào acc đó; 2 acc -> chia đôi; 3 acc -> chia 3; không bao giờ bị văng vào acc chưa đăng nhập
const runtimeStart = mainCode.indexOf('class MuseVideoRuntime');
const runtimeEnd = mainCode.indexOf('class Ys', runtimeStart);

if (runtimeStart !== -1 && runtimeEnd !== -1) {
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

    // Stagger vi mô 0-800ms để nhiều cửa sổ mở đồng thời mượt mà không nghẽn socket
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 800)));

    logDebug("Starting Muse video job (Unlimited Concurrency)", { jobId: job.id, accountId: job.accountId });
    tracker.updateProgress(5, "Đang kết nối tài khoản Muse AI...");

    // 1. THU THẬP TẤT CẢ TÀI KHOẢN MUSE TRONG BROWSER HUB & XÁC ĐỊNH TÀI KHOẢN ĐANG HOẠT ĐỘNG (CÓ COOKIE)
    const allMuseSessions = (this.sessions?.listSessions ? this.sessions.listSessions() : (typeof T !== 'undefined' && T.listSessions ? T.listSessions() : [])).filter(s => 
      s.providerId === "muse" || 
      s.providerId === "muse-ai" ||
      (s.provider && s.provider.toLowerCase().includes("muse")) || 
      (s.startUrl && s.startUrl.includes("muse.ai")) ||
      s.providerId?.startsWith("custom-")
    );

    const activeMuseSessions = [];
    for (const s of allMuseSessions) {
      if (s.partition) {
        try {
          const ses = electron.session.fromPartition(s.partition);
          const c = await ses.cookies.get({ domain: 'muse.ai' }).catch(() => []);
          if (c && c.length > 0) {
            activeMuseSessions.push({ ...s, cookieCount: c.length });
          }
        } catch(ce) {}
      }
    }

    logDebug("Active Muse sessions check", { 
      totalFound: activeMuseSessions.length, 
      activeList: activeMuseSessions.map(a => ({ id: a.accountId, name: a.accountName || a.accountDisplayName, cookies: a.cookieCount })) 
    });

    let session = null;

    // Nếu người dùng chọn chỉ định tài khoản thủ công (manual)
    if (job.accountId && job.payload?.accountSelection === "manual") {
      session = activeMuseSessions.find(s => s.accountId === job.accountId) || 
                allMuseSessions.find(s => s.accountId === job.accountId);
    }

    // NẾU CHẾ ĐỘ TỰ ĐỘNG (AUTO):
    // - 1 account hoạt động -> Nạp 100% lệnh vào account đó
    // - 2 account hoạt động -> Chia đôi (50/50)
    // - 3 account hoạt động -> Chia 3 (33/33/33), v.v.
    if (!session || job.payload?.accountSelection !== "manual" || job.accountId === "auto" || job.account === "Auto") {
      if (activeMuseSessions.length > 0) {
        global.__muse_dispatch_counter = (global.__muse_dispatch_counter || 0) + 1;
        session = activeMuseSessions[(global.__muse_dispatch_counter - 1) % activeMuseSessions.length];
        logDebug("Dynamic load balancing selected session", { 
          chosenAccount: session.accountName || session.accountDisplayName || session.accountId,
          activeCount: activeMuseSessions.length,
          dispatchIndex: global.__muse_dispatch_counter
        });
      } else if (allMuseSessions.length > 0) {
        session = allMuseSessions[0];
      }
    }

    if (!session) {
      throw new Error("Không tìm thấy tài khoản Muse AI trong Browser Hub. Vui lòng vào mục 'Tài khoản' để thêm hoặc mở tài khoản Muse AI.");
    }

    // Kiểm tra Cookie tài khoản Muse AI trước khi chạy
    let cookies = [];
    try {
      const ses = electron.session.fromPartition(session.partition);
      cookies = await ses.cookies.get({ domain: 'muse.ai' }).catch(() => []);
      logDebug("Selected Muse session cookies", { accountId: session.accountId, count: cookies.length });
      if (cookies.length === 0) {
        // Fallback khẩn cấp nếu có bất kỳ account nào khác có cookie
        if (activeMuseSessions.length > 0) {
          session = activeMuseSessions[0];
          const fallbackSes = electron.session.fromPartition(session.partition);
          cookies = await fallbackSes.cookies.get({ domain: 'muse.ai' }).catch(() => []);
          logDebug("Emergency switched to session with cookies", { accountId: session.accountId, count: cookies.length });
        }
      }
      if (cookies.length === 0) {
        throw new Error("Tài khoản Muse AI chưa đăng nhập! Vui lòng vào mục 'Tài khoản' trên thanh menu để đăng nhập tài khoản Muse AI trước khi tạo video.");
      }
    } catch(err) {
      if (err.message.includes("chưa đăng nhập")) throw err;
    }

    // 2. TẠO CỬA SỔ DÀNH RIÊNG ĐỂ THỰC THI AUTOMATION
    tracker.updateProgress(10, "Đang mở trang tạo video Muse AI...");
    logDebug("Spawning dedicated automation window", { partition: session.partition });

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

      // 3. ĐIỀU HƯỚNG TỚI /thread/new
      tracker.updateProgress(15, "Đang mở luồng hội thoại mới (thread/new)...");
      await win.loadURL("https://muse.ai/thread/new");
      await new Promise(r => setTimeout(r, 3500));

      let currentUrl = wc.getURL();
      logDebug("Opened URL", { url: currentUrl });

      // Kiểm tra chuyển hướng đăng nhập
      if (currentUrl.includes('/login') || currentUrl.includes('accounts.google.com') || currentUrl.includes('auth.muse.ai')) {
        throw new Error("Phiên đăng nhập Muse AI đã hết hạn. Vui lòng mở Browser Hub để đăng nhập lại tài khoản Muse AI của bạn!");
      }

      // Kiểm tra trước nếu tài khoản hết credits / cần nâng cấp
      const preCheck = await wc.executeJavaScript(\`
        (() => {
          const text = (document.body?.innerText || '').toLowerCase();
          if (text.includes('upgrade to pro') || text.includes('upgrade your plan') || text.includes('out of credits') || text.includes('hết credit')) {
            return { blocked: true, reason: "Tài khoản Muse AI đã hết credits hoặc cần nâng cấp gói Pro để tiếp tục tạo video." };
          }
          return { blocked: false };
        })()
      \`, true);
      if (preCheck?.blocked) {
        throw new Error(preCheck.reason);
      }

      // 3.5. ĐÍNH KÈM ẢNH THAM CHIẾU (IMAGE-TO-VIDEO) NẾU CÓ
      const refIds = Array.isArray(job.payload?.referenceAssetIds) ? job.payload.referenceAssetIds : [];
      const refFilePaths = [];
      for (const rid of refIds) {
        let asset = this.assets?.getAsset ? this.assets.getAsset(rid) : null;
        if (!asset && typeof T !== 'undefined' && T.getAsset) asset = T.getAsset(rid);
        const p = asset?.localPath || asset?.path;
        if (p && fs.existsSync(p)) {
          refFilePaths.push(p);
        }
      }

      if (refFilePaths.length > 0) {
        logDebug("Attaching reference images", { count: refFilePaths.length, paths: refFilePaths });
        tracker.updateProgress(20, \`Đang đính kèm \${refFilePaths.length} ảnh tham chiếu vào Muse AI...\`);

        for (const fpath of refFilePaths) {
          try {
            const b64 = fs.readFileSync(fpath).toString('base64');
            const fname = path.basename(fpath);
            const mime = fpath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

            await wc.executeJavaScript(\`
              (async () => {
                try {
                  const b64 = "\${b64}";
                  const mime = "\${mime}";
                  const fname = "\${fname.replace(/"/g, '')}";
                  const bin = atob(b64);
                  const arr = new Uint8Array(bin.length);
                  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
                  const file = new File([arr], fname, { type: mime });
                  const dt = new DataTransfer();
                  dt.items.add(file);

                  const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
                  for (const fi of fileInputs) {
                    try {
                      fi.files = dt.files;
                      fi.dispatchEvent(new Event('input', { bubbles: true }));
                      fi.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch(e) {}
                  }

                  const chatEl = document.querySelector('textarea, div[contenteditable="true"], [role="textbox"], input');
                  if (chatEl) {
                    chatEl.focus();
                    chatEl.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    chatEl.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                  }
                } catch(e) {}
              })()
            \`, true);

            try {
              const nativeImg = electron.nativeImage.createFromPath(fpath);
              electron.clipboard.writeImage(nativeImg);
              wc.focus();
              await wc.executeJavaScript(\`
                (() => {
                  const el = document.querySelector('textarea, div[contenteditable="true"], [role="textbox"], input');
                  if (el) { el.focus(); el.click(); }
                })()
              \`, true);
              await new Promise(r => setTimeout(r, 300));
              wc.paste();
              await new Promise(r => setTimeout(r, 1200));
            } catch(e) {}

            logDebug("Attached reference image successfully", { path: fpath });
          } catch(e) {
            logDebug("Error attaching image", { path: fpath, error: e.message });
          }
        }
        await new Promise(r => setTimeout(r, 1500));
      }

      // 4. NHẬP PROMPT VÀ GỬI VÀO CHATBOX
      const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
      tracker.updateProgress(25, "Đang gửi prompt vào chatbox Muse AI...");

      const sendRes = await wc.executeJavaScript(\`
        (async () => {
          try {
            const text = \${JSON.stringify(prompt)};

            function findChatInput() {
              const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
                if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
                const rect = b.getBoundingClientRect();
                if (rect.left < 250) return false;
                const t = (b.innerText || '').toLowerCase().trim();
                return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
              });
              if (pills.length > 0) {
                try { pills[0].click(); } catch(e) {}
              }

              const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
                if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
                const rect = el.getBoundingClientRect();
                if (rect.left < 200 && rect.width < 120) return false;
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

            let el = null;
            for (let retry = 0; retry < 8; retry++) {
              el = findChatInput();
              if (el) break;
              await new Promise(r => setTimeout(r, 600));
            }

            if (!el) {
              const bodyText = (document.body?.innerText || '').toLowerCase();
              if (bodyText.includes('sign in') || bodyText.includes('log in') || bodyText.includes('đăng nhập')) {
                return { success: false, error: "Tài khoản Muse AI chưa đăng nhập. Vui lòng vào mục 'Tài khoản' để đăng nhập lại!" };
              }
              return { success: false, error: "Không tìm thấy khung chat Muse AI. Vui lòng kiểm tra lại tài khoản." };
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
            await new Promise(r => setTimeout(r, 500));

            // Tìm nút gửi
            const container = el.closest('form, div[class*="chat"], div[class*="prompt"]') || el.parentElement?.parentElement || document;
            const buttons = Array.from(container.querySelectorAll('button, [role="button"]')).filter(b => b.offsetWidth > 0 && !b.disabled);
            
            let sendBtn = buttons.find(b => b.type === 'submit') ||
                          buttons.find(b => {
                            const l = (b.getAttribute('aria-label') || b.title || b.innerText || '').toLowerCase();
                            return l.includes('send') || l.includes('gửi') || l.includes('submit');
                          }) ||
                          buttons.find(b => b.querySelector('svg'));

            let clicked = false;
            if (sendBtn) {
              sendBtn.click();
              clicked = true;
            }

            const form = el.closest('form');
            if (form && typeof form.requestSubmit === 'function') {
              try { form.requestSubmit(); clicked = true; } catch(e) {}
            }

            return { success: true, clickedBtn: clicked, hasForm: !!form };
          } catch(e) {
            return { success: false, error: e.message };
          }
        })()
      \`, true);

      logDebug("Send prompt result", sendRes);
      if (!sendRes?.success) {
        throw new Error("Không thể gửi prompt: " + (sendRes?.error || "Lỗi giao diện"));
      }

      // Gửi phím Enter chuẩn cấp OS từ Electron WebContents
      try {
        await wc.sendInputEvent({ type: 'keyDown', keyCode: 'Enter' });
        await wc.sendInputEvent({ type: 'char', keyCode: '\\r' });
        await wc.sendInputEvent({ type: 'keyUp', keyCode: 'Enter' });
      } catch(e) {}

      await new Promise(r => setTimeout(r, 2000));

      // 4.5. KIỂM TRA PHẢN HỒI TỨC THÌ (LỖI CREDITS / POPUP UPGRADE)
      const postCheck = await wc.executeJavaScript(\`
        (() => {
          const bodyText = (document.body?.innerText || '').toLowerCase();
          if (bodyText.includes('upgrade to pro') || bodyText.includes('upgrade your plan') || bodyText.includes('out of credits') || bodyText.includes('hết credit') || bodyText.includes('generation limit') || bodyText.includes('daily limit')) {
            return { error: "Tài khoản Muse AI đã hết lượt tạo video (hết credits hoặc chạm hạn mức ngày). Vui lòng đổi tài khoản khác hoặc nâng cấp Pro!" };
          }
          if (bodyText.includes('something went wrong') || bodyText.includes('failed to generate') || bodyText.includes('error generating')) {
            const errEl = document.querySelector('.error, [role="alert"], [class*="error"]');
            return { error: "Muse AI báo lỗi: " + (errEl?.innerText || "Không thể tạo video với prompt này") };
          }
          return { ok: true, url: window.location.href };
        })()
      \`, true);

      if (postCheck?.error) {
        logDebug("Immediate error detected from Muse AI", { error: postCheck.error });
        throw new Error(postCheck.error);
      }

      // ĐỒNG BỘ URL LUỒNG MỚI SANG BROWSER HUB ĐỂ NGƯỜI DÙNG CÓ THỂ XEM TRỰC TIẾP
      currentUrl = wc.getURL();
      logDebug("Active generation URL", { url: currentUrl });
      if (currentUrl && !currentUrl.includes('/thread/new')) {
        session.currentUrl = currentUrl;
        try {
          const viewObj = this.browserViewManager?.views?.get(session.accountId);
          if (viewObj?.view?.webContents && !viewObj.view.webContents.isDestroyed()) {
            viewObj.view.webContents.loadURL(currentUrl);
            logDebug("Synced active thread URL to Browser Hub view", { url: currentUrl });
          }
        } catch(e) {}
      }

      tracker.updateProgress(35, "Prompt đã gửi thành công! Đang theo dõi tiến trình tạo video...");

      // 5. POLLING VIDEO HOÀN THÀNH (TIMEOUT TỐI ĐA 4 PHÚT)
      const startTime = Date.now();
      const timeoutMs = 4 * 60 * 1000;
      let videoBytes = null;
      let finalVideoUrl = "";

      while (Date.now() - startTime < timeoutMs) {
        if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.2));
        tracker.updateProgress(curPct, "Muse AI đang dựng video (" + elapsed + "s)...");

        // Quét video và kiểm tra lỗi thời gian thực
        const scanRes = await wc.executeJavaScript(\`
          (() => {
            try {
              const bodyText = (document.body?.innerText || '').toLowerCase();
              if (bodyText.includes('upgrade to pro') || bodyText.includes('out of credits') || bodyText.includes('hết credit')) {
                return { hasError: true, error: "Tài khoản Muse AI đã hết credits tạo video." };
              }

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

              // B. Check video elements
              const videos = Array.from(log.querySelectorAll('video'));
              for (let i = videos.length - 1; i >= 0; i--) {
                const v = videos[i];
                const u = v.currentSrc || v.src || v.querySelector('source')?.src;
                if (u && (u.startsWith('http') || u.startsWith('blob:'))) {
                  return { found: true, url: u, duration: v.duration || 0 };
                }
              }

              // C. Check mp4 download links
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

        if (scanRes?.hasError) {
          throw new Error(scanRes.error);
        }

        if (scanRes?.found && scanRes.url) {
          logDebug("Candidate video found in log", scanRes);

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

              // Lọc bỏ mascot / video avatar mở đầu (< 1,000,000 bytes)
              if (bytes.length < 1000000) {
                logDebug("Mascot avatar skipped (" + bytes.length + " bytes), waiting for real video...");
              } else {
                videoBytes = bytes;
                finalVideoUrl = scanRes.url;
                logDebug("Captured real video successfully!", { byteLength: videoBytes.length });
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
        throw new Error("Quá thời gian chờ tạo video trên Muse AI (4 phút). Vui lòng thử lại với prompt ngắn hơn hoặc kiểm tra tài khoản Muse AI.");
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
      try {
        if (!win.isDestroyed()) win.destroy();
      } catch(e) {}
    }
  }
}
`;
  mainCode = mainCode.slice(0, runtimeStart) + newRuntimeCode + '\n' + mainCode.slice(runtimeEnd);
  console.log('✅ 1.3 Đã cập nhật MuseVideoRuntime thông minh: Tự động phát hiện acc có Cookie, chia đều N acc hoạt động, đa luồng siêu tốc!');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ---------------------------------------------------------
// 2. SỬA app/out/renderer/assets/VideoStudio-frcr8V6s.js
// ---------------------------------------------------------
const studioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let studioCode = fs.readFileSync(studioPath, 'utf8');

// Đảm bảo b.push trong VideoStudio gán accountId chuẩn để không bị prepareLicensedJob từ chối
const pushTarget = 'if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){';
const pushIdx = studioCode.indexOf(pushTarget);
if (pushIdx !== -1) {
  const nextIdx = studioCode.indexOf('if(v.provider==="Grok")', pushIdx);
  if (nextIdx !== -1) {
    const cleanPush = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v)||activeMuseAccounts[0]||museAccounts[0]||(X||[]).find(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")));if(!ot){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue;}`;
    studioCode = studioCode.slice(0, pushIdx) + cleanPush + studioCode.slice(nextIdx);
    console.log('✅ 2.1 VideoStudio b.push nhận đủ 100% prompt vào hàng đợi');
  }
}

fs.writeFileSync(studioPath, studioCode, 'utf8');

// ---------------------------------------------------------
// 3. KIỂM TRA CÚ PHÁP
// ---------------------------------------------------------
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
execSync('node -c app/out/renderer/assets/VideoStudio-frcr8V6s.js', { stdio: 'inherit' });
console.log('🎉 Cú pháp JavaScript cả 2 file đều 100% hợp lệ!');
