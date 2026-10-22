const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Replace the MuseVideoRuntime class in app/out/main/index.js
const startMarker = 'class MuseVideoRuntime';
const startIndex = code.indexOf(startMarker);

if (startIndex === -1) {
  console.error("Could not find 'class MuseVideoRuntime' in " + targetFile);
  process.exit(1);
}

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

    logDebug("Starting Muse video job (Wait for NEW video)", { jobId: job.id, accountId: job.accountId });
    tracker.updateProgress(5, "Đang kết nối tài khoản Muse AI...");

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
      throw new Error("Không tìm thấy phiên đăng nhập Muse AI trong Browser Hub. Vui lòng thêm tài khoản Muse AI.");
    }

    const bvm = this.browserViewManager || (typeof W !== 'undefined' ? W : null);
    if (!bvm || typeof bvm.getOrCreateView !== 'function') {
      throw new Error("BrowserViewManager không khả dụng để tải Muse AI");
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

    tracker.updateProgress(15, "Đang kiểm tra giao diện Muse AI...");

    // 1. SNAPSHOT EXISTING DOWNLOAD BUTTONS BEFORE SENDING PROMPT
    const initialSnapshot = await wc.executeJavaScript(\`
      (() => {
        try {
          const allEls = Array.from(document.querySelectorAll('button, a, [role="button"], [aria-label], [title], div, span'));
          const dlButtons = allEls.filter(el => {
            const t = (el.innerText || '').toLowerCase().trim();
            const l = (el.getAttribute('aria-label') || '').toLowerCase();
            const tit = (el.getAttribute('title') || '').toLowerCase();
            return (t.includes('tải xuống') || t.includes('download') || l.includes('tải xuống') || l.includes('download') || tit.includes('tải xuống') || tit.includes('download')) && (el.offsetWidth > 0 || el.offsetHeight > 0);
          });
          return { count: dlButtons.length };
        } catch (e) {
          return { count: 0 };
        }
      })()
    \`, true);

    const initialDlCount = initialSnapshot?.count || 0;
    logDebug("Initial download buttons snapshot before sending prompt", { initialDlCount });

    // 2. SET UP ELECTRON DOWNLOAD INTERCEPTOR
    let downloadedFile = null;
    let downloadTriggered = false;

    const downloadHandler = (event, item, webContents) => {
      try {
        if (!downloadTriggered) {
          logDebug("Ignored download event because new video was not ready yet");
          return;
        }

        const filename = item.getFilename() || ("muse-" + Date.now() + ".mp4");
        const url = item.getURL();
        logDebug("Intercepted NEW video download event!", { filename, url, size: item.getTotalBytes() });

        const tempFilePath = path.join(os.tmpdir(), "muse_" + Date.now() + "_" + filename.replace(/[^a-zA-Z0-9._-]/g, "_"));
        item.setSavePath(tempFilePath);

        item.once('done', (e, state) => {
          if (state === 'completed') {
            const actualSize = fs.existsSync(tempFilePath) ? fs.statSync(tempFilePath).size : 0;
            logDebug("Download of NEW video completed!", { tempFilePath, size: actualSize });
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

    const cleanupListeners = () => {
      try { wc.session.removeListener('will-download', downloadHandler); } catch (e) {}
    };

    // 3. ENTER PROMPT INTO CHATBOX & SEND
    const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
    tracker.updateProgress(25, "Đang gửi prompt vào Muse AI...");

    const sendRes = await wc.executeJavaScript(\`
      (async () => {
        try {
          function findChatInput() {
            const allInputs = Array.from(document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]')).filter(el => {
              if (el.disabled || el.readOnly) return false;
              const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
              return !p.includes('search') && !p.includes('tìm kiếm');
            });

            if (allInputs.length > 0) return allInputs[allInputs.length - 1];

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

          const formOrFooter = inputEl.closest('form, div, footer') || document;
          const sendBtns = Array.from(formOrFooter.querySelectorAll('button, [role="button"]')).filter(b => {
            if (b.disabled || b.offsetWidth <= 0) return false;
            const label = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
            return label.includes('send') || label.includes('gửi') || b.type === 'submit' || b.querySelector('svg');
          });

          if (sendBtns.length > 0) {
            sendBtns[sendBtns.length - 1].click();
          }

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

    tracker.updateProgress(35, "Muse AI đang tạo video mới...");

    // 4. POLLING LOOP: WAIT UNTIL A *NEW* VIDEO IS GENERATED
    const startTime = Date.now();
    const timeoutMs = 6 * 60 * 1000;
    let videoBytes = null;
    let finalVideoUrl = "";

    try {
      while (Date.now() - startTime < timeoutMs) {
        if (tracker.signal?.aborted) throw new Error("Tác vụ đã bị người dùng hủy");

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const curPct = Math.min(92, 35 + Math.floor(elapsed / 2.5));
        tracker.updateProgress(curPct, "Muse AI đang dựng video mới (" + elapsed + "s)...");

        // CHECK IN-PAGE: Has a NEW download button appeared?
        const scanRes = await wc.executeJavaScript(\`
          (async () => {
            try {
              const bodyText = (document.body.innerText || '').toLowerCase();
              const isGenerating = bodyText.includes('generating video') || 
                                   bodyText.includes('generating...') || 
                                   document.querySelector('[class*="spinner"], [class*="generating"], [class*="loading"]') !== null;

              // Hover on latest cards to reveal buttons
              const cards = Array.from(document.querySelectorAll('[class*="media"], [class*="message"], [class*="card"], img, video')).filter(el => {
                const r = el.getBoundingClientRect();
                return r.width > 120 && r.height > 120;
              });
              if (cards.length > 0) {
                const lastCard = cards[cards.length - 1];
                lastCard.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
                lastCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
              }

              // Scan download buttons
              const allEls = Array.from(document.querySelectorAll('button, a, [role="button"], [aria-label], [title], div, span'));
              const dlButtons = allEls.filter(el => {
                const t = (el.innerText || '').toLowerCase().trim();
                const l = (el.getAttribute('aria-label') || '').toLowerCase();
                const tit = (el.getAttribute('title') || '').toLowerCase();
                return (t.includes('tải xuống') || t.includes('download') || l.includes('tải xuống') || l.includes('download') || tit.includes('tải xuống') || tit.includes('download')) && (el.offsetWidth > 0 || el.offsetHeight > 0);
              });

              const currentCount = dlButtons.length;
              const initialCount = \${initialDlCount};

              // CRITICAL: We only click when currentCount > initialCount!
              // (Meaning a BRAND NEW video has finished generating and has a download button)
              if (currentCount > initialCount && !isGenerating) {
                const lastBtn = dlButtons[dlButtons.length - 1];
                lastBtn.click();
                return { action: 'clicked_download', currentCount, initialCount, text: lastBtn.innerText || lastBtn.getAttribute('aria-label') };
              }

              return { action: 'waiting', isGenerating, currentCount, initialCount };
            } catch (e) {
              return { action: 'error', error: e.message };
            }
          })()
        \`, true);

        if (scanRes && scanRes.action === 'clicked_download') {
          logDebug("NEW video is ready! Clicked download button!", scanRes);
          downloadTriggered = true;
          tracker.updateProgress(95, "Đang tải video mới từ Muse AI về máy...");

          // Wait up to 10 seconds for the new video file download to complete
          for (let wait = 0; wait < 10; wait++) {
            await new Promise(r => setTimeout(r, 1000));
            if (downloadedFile && downloadedFile.filePath && fs.existsSync(downloadedFile.filePath)) {
              const stats = fs.statSync(downloadedFile.filePath);
              if (stats.size > 200000) {
                videoBytes = fs.readFileSync(downloadedFile.filePath);
                finalVideoUrl = downloadedFile.url || "https://muse.ai";
                logDebug("Successfully captured NEW video bytes!", { size: stats.size });
                break;
              }
            }
          }
          if (videoBytes) break;
        }

        await new Promise(r => setTimeout(r, 2500));
      }
    } finally {
      cleanupListeners();
    }

    if (!videoBytes || videoBytes.length < 50000) {
      logDebug("Timed out or failed to capture NEW Muse video");
      throw new Error("Không bắt được video mới từ Muse AI sau khi tạo xong. Vui lòng thử lại.");
    }

    tracker.updateProgress(98, "Đang lưu video mới vào thư viện...");
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

    tracker.updateProgress(100, "Hoàn tất tạo video mới với Muse AI!");
    logDebug("Successfully saved NEW Muse AI video asset!", { assetId: savedAsset.id, localPath: savedAsset.localPath });

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

code = code.substring(0, startIndex) + newRuntimeCode + code.substring(endIndex);
fs.writeFileSync(targetFile, code, 'utf8');
console.log("✓ Successfully patched MuseVideoRuntime to wait strictly for the NEW video!");
