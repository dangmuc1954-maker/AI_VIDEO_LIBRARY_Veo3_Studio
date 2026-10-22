const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// The replacement class for MuseVideoRuntime
const newRuntimeCode = `class MuseVideoRuntime {
  constructor(r, s) {
    this.browserViewManager = r;
    this.sessions = s;
    this.assets = r.assets;
    this.windows = r.windows;
  }

  isSupported(job) {
    const p = (job.provider || "").toLowerCase();
    const m = (job.payload?.model || "").toLowerCase();
    return p.includes("muse") || m.includes("muse");
  }

  async runJob(job, tracker) {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');

    const logDebug = (msg, obj) => {
      try {
        const line = "[" + new Date().toISOString() + "] " + msg + " " + (obj ? JSON.stringify(obj) : "") + "\\n";
        fs.appendFileSync(path.join(os.homedir(), "Desktop", "MUSE_DEBUG.log"), line);
      } catch (e) {}
    };

    logDebug("Starting Muse video job with Smart Download Hook", { jobId: job.id, accountId: job.accountId });
    tracker.updateProgress(5, "Đang kết nối tài khoản Muse AI...");

    let session = this.sessions.getSession(job.accountId);
    if (!session) {
      const allSessions = this.sessions.listSessions();
      session = allSessions.find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }

    if (!session) {
      throw new Error("Không tìm thấy phiên đăng nhập Muse AI trong Browser Hub. Vui lòng thêm tài khoản Muse AI.");
    }

    const viewWrap = this.browserViewManager.getOrCreateView(session);
    const wc = viewWrap.view.webContents;
    const currentUrl = wc.getURL() || "";
    logDebug("Current Muse WebContents URL", { url: currentUrl });

    if (!currentUrl.includes("muse.ai")) {
      tracker.updateProgress(10, "Đang mở trang Muse AI...");
      logDebug("Navigating Muse view to https://muse.ai/...");
      await wc.loadURL("https://muse.ai/");
      await new Promise(r => setTimeout(r, 4000));
    }

    tracker.updateProgress(18, "Đang định vị khung chat Muse AI...");

    // 1. SET UP ELECTRON DOWNLOAD INTERCEPTOR
    let downloadedFile = null;
    let capturedMediaUrl = null;

    const downloadHandler = (event, item, webContents) => {
      try {
        const filename = item.getFilename() || ("muse-" + Date.now() + ".mp4");
        const url = item.getURL();
        logDebug("Intercepted Electron will-download event!", { filename, url, size: item.getTotalBytes() });

        const tempFilePath = path.join(os.tmpdir(), "muse_" + Date.now() + "_" + filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
        item.setSavePath(tempFilePath);

        item.once('done', (e, state) => {
          if (state === 'completed') {
            const actualSize = fs.existsSync(tempFilePath) ? fs.statSync(tempFilePath).size : 0;
            logDebug("Download completed via will-download!", { tempFilePath, size: actualSize });
            downloadedFile = {
              filePath: tempFilePath,
              filename: filename,
              url: url,
              size: actualSize
            };
          } else {
            logDebug("Download ended with state: " + state);
          }
        });
      } catch (err) {
        logDebug("Error in will-download handler: " + err.message);
      }
    };

    try {
      wc.session.on('will-download', downloadHandler);
    } catch (e) {
      logDebug("Failed to attach will-download listener: " + e.message);
    }

    // 2. SET UP WEB REQUEST URL CAPTURE (Backup)
    const requestFilter = { urls: ['*://*/*'] };
    const responseListener = (details) => {
      try {
        const u = details.url;
        if (u && (u.includes('media-generation') || (u.includes('.mp4') && (u.includes('fbcdn') || u.includes('instagram') || u.includes('cdn'))))) {
          capturedMediaUrl = u;
          logDebug("Captured media URL via webRequest!", { url: u });
        }
      } catch (e) {}
    };

    try {
      wc.session.webRequest.onResponseStarted(requestFilter, responseListener);
    } catch (e) {
      logDebug("Failed to attach webRequest listener: " + e.message);
    }

    // Clean up listeners on finish or error
    const cleanupListeners = () => {
      try { wc.session.removeListener('will-download', downloadHandler); } catch (e) {}
      try { wc.session.webRequest.onResponseStarted(requestFilter, null); } catch (e) {}
    };

    // 3. ENTER PROMPT INTO CHATBOX
    const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
    tracker.updateProgress(25, "Đang gửi prompt vào Muse AI...");

    const sendRes = await wc.executeJavaScript(\`
      (async () => {
        try {
          function findChatInput() {
            // Find any valid input or textarea (search for 'Nhắn tin', 'Message', or any visible textarea)
            const allInputs = Array.from(document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')).filter(el => {
              if (el.disabled || el.readOnly) return false;
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return !p.includes('search') && !p.includes('tìm kiếm');
            });

            if (allInputs.length > 0) return allInputs[allInputs.length - 1];

            // If a pill like "+ Message" is visible, click it first
            const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
              const t = (b.innerText || '').toLowerCase().trim();
              return t === '+ message' || t === 'message' || t === '+ nhắn tin' || t === 'nhắn tin';
            });
            if (pills.length > 0) {
              pills[0].click();
            }
            return document.querySelector('textarea, [contenteditable="true"]');
          }

          let inputEl = findChatInput();
          if (!inputEl) {
            await new Promise(r => setTimeout(r, 1000));
            inputEl = findChatInput();
          }

          if (!inputEl) {
            return { success: false, error: "Không tìm thấy ô nhập tin nhắn trên Muse AI" };
          }

          inputEl.focus();
          const text = \${JSON.stringify(prompt)};

          if (inputEl.isContentEditable) {
            inputEl.innerText = text;
          } else {
            const proto = Object.getPrototypeOf(inputEl);
            const valSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set ||
                              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (valSetter) {
              valSetter.call(inputEl, text);
            } else {
              inputEl.value = text;
            }
          }

          inputEl.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          await new Promise(r => setTimeout(r, 500));

          // Look for send button or submit
          const formOrFooter = inputEl.closest('form, div, footer') || document;
          const sendBtns = Array.from(formOrFooter.querySelectorAll('button, [role="button"]')).filter(b => {
            if (b.disabled || b.offsetWidth <= 0) return false;
            const label = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
            return label.includes('send') || label.includes('gửi') || b.type === 'submit' || b.querySelector('svg');
          });

          if (sendBtns.length > 0) {
            sendBtns[sendBtns.length - 1].click();
          }

          // Always also trigger Enter key
          inputEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          inputEl.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
          inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));

          window.__muse_prompt_time = Date.now();
          return { success: true, tagName: inputEl.tagName, placeholder: inputEl.placeholder || 'none' };
        } catch (e) {
          return { success: false, error: e.message };
        }
      })()
    \`, true);

    logDebug("Send prompt result", sendRes);
    if (!sendRes?.success) {
      cleanupListeners();
      throw new Error("Không thể gửi prompt tới Muse AI: " + (sendRes?.error || "Lỗi giao diện"));
    }

    tracker.updateProgress(35, "Muse AI đã nhận lệnh, đang tạo video...");

    // 4. POLLING LOOP: WATCH FOR "Xong rồi nè" & CLICK "Tải xuống"
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

        // CHECK 1: Has Electron already intercepted the file via will-download?
        if (downloadedFile && downloadedFile.filePath && fs.existsSync(downloadedFile.filePath)) {
          const stats = fs.statSync(downloadedFile.filePath);
          if (stats.size > 200000) { // > 200 KB
            logDebug("Found completed download file on disk!", { path: downloadedFile.filePath, size: stats.size });
            videoBytes = fs.readFileSync(downloadedFile.filePath);
            finalVideoUrl = downloadedFile.url || "https://muse.ai";
            break;
          }
        }

        // CHECK 2: Trigger in-page scanner for "Tải xuống" button and hover video card
        const scanRes = await wc.executeJavaScript(\`
          (async () => {
            try {
              // 1. Hover on latest cards to reveal buttons
              const cards = Array.from(document.querySelectorAll('[class*="media"], [class*="message"], [class*="card"], img, video')).filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 120 && r.height > 120;
              });
              if (cards.length > 0) {
                const lastCard = cards[cards.length - 1];
                lastCard.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                lastCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
              }

              // 2. Find any button / element matching 'Tải xuống' or 'Download'
              const allEls = Array.from(document.querySelectorAll('button, a, [role="button"], [aria-label], [title], div, span'));
              const dlButtons = allEls.filter(el => {
                const t = (el.innerText || '').toLowerCase().trim();
                const l = (el.getAttribute('aria-label') || '').toLowerCase();
                const tit = (el.getAttribute('title') || '').toLowerCase();
                const isDl = (t === 'tải xuống' || t === 'download' || l.includes('tải xuống') || l.includes('download') || tit.includes('tải xuống') || tit.includes('download'));
                return isDl;
              });

              if (dlButtons.length > 0) {
                // Click the latest download button!
                const lastBtn = dlButtons[dlButtons.length - 1];
                lastBtn.click();
                return { action: 'clicked_download', count: dlButtons.length, text: lastBtn.innerText || lastBtn.getAttribute('aria-label') };
              }

              // 3. Check for any direct .mp4 anchor or video tag
              const anchors = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download], a[href*="media-generation"]'));
              if (anchors.length > 0) {
                const last = anchors[anchors.length - 1];
                return { action: 'found_anchor', url: last.href };
              }

              return { action: 'waiting' };
            } catch (e) {
              return { action: 'error', error: e.message };
            }
          })()
        \`, true);

        if (scanRes && scanRes.action === 'clicked_download') {
          logDebug("Clicked 'Tải xuống' button on page!", scanRes);
          tracker.updateProgress(95, "Đang tải video Muse AI về máy...");
          // Wait up to 8 seconds for the download to finish
          for (let wait = 0; wait < 8; wait++) {
            await new Promise(r => setTimeout(r, 1000));
            if (downloadedFile && downloadedFile.filePath && fs.existsSync(downloadedFile.filePath)) {
              const stats = fs.statSync(downloadedFile.filePath);
              if (stats.size > 200000) {
                videoBytes = fs.readFileSync(downloadedFile.filePath);
                finalVideoUrl = downloadedFile.url || "https://muse.ai";
                break;
              }
            }
          }
          if (videoBytes) break;
        }

        // CHECK 3: If capturedMediaUrl was recorded via webRequest
        if (capturedMediaUrl) {
          logDebug("Attempting to fetch captured media URL directly...", { url: capturedMediaUrl });
          tracker.updateProgress(96, "Đang lấy video từ máy chủ Muse AI...");
          try {
            const resp = await fetch(capturedMediaUrl);
            if (resp.ok) {
              const ab = await resp.arrayBuffer();
              if (ab.byteLength > 200000) {
                videoBytes = Buffer.from(ab);
                finalVideoUrl = capturedMediaUrl;
                logDebug("Fetched media URL successfully!", { byteLength: videoBytes.length });
                break;
              }
            }
          } catch (e) {
            logDebug("Direct fetch of captured URL failed: " + e.message);
          }
        }

        await new Promise(r => setTimeout(r, 2500));
      }
    } finally {
      cleanupListeners();
    }

    if (!videoBytes || videoBytes.length < 50000) {
      logDebug("Timed out or failed to capture Muse video");
      throw new Error("Không bắt được video từ Muse AI sau khi tạo xong. Vui lòng thử lại.");
    }

    tracker.updateProgress(98, "Đang lưu video vào thư viện...");
    logDebug("Caching generated video asset...", { bytesLength: videoBytes.length });

    const savedAsset = await this.assets.cacheGeneratedVideoBytes(job, {
      bytes: videoBytes,
      mimeType: "video/mp4",
      remoteUrl: finalVideoUrl || "https://muse.ai",
      providerAssetId: "muse-" + Date.now()
    });

    tracker.updateProgress(100, "Hoàn tất tạo video với Muse AI!");
    logDebug("Successfully saved Muse AI video asset!", { assetId: savedAsset.id, localPath: savedAsset.localPath });

    return {
      assets: [savedAsset],
      provider: {
        operationId: "muse-" + Date.now(),
        raw: {
          prompt: prompt,
          remoteUrl: finalVideoUrl,
          accountId: session.accountId
        }
      }
    };
  }
}`;

// Replace the MuseVideoRuntime class in app/out/main/index.js
const startMarker = 'class MuseVideoRuntime';
const startIndex = code.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Could not find 'class MuseVideoRuntime' in " + targetFile);
  process.exit(1);
}

// Find where class MuseVideoRuntime ends
let depth = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < code.length; i++) {
  if (code[i] === '{') {
    depth++;
    started = true;
  } else if (code[i] === '}') {
    depth--;
    if (started && depth === 0) {
      endIndex = i + 1;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error("Could not locate end of class MuseVideoRuntime");
  process.exit(1);
}

code = code.substring(0, startIndex) + newRuntimeCode + code.substring(endIndex);
fs.writeFileSync(targetFile, code, 'utf8');
console.log("✓ Successfully patched MuseVideoRuntime with Smart Download Hook!");
