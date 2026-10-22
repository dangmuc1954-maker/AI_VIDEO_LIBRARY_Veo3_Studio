const fs = require('fs');
const path = require('path');

console.log('=== [PATCH] HOÀN THIỆN ĐÍNH KÈM ĐÚNG ẢNH TỪNG CẢNH CHO MUSE AI (MULTI-THREADING / HÀNG LOẠT) ===');

// 1. CẬP NHẬT VideoFactoryStudio.js
const vfPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let vfCode = fs.readFileSync(vfPath, 'utf8');

// Ensure referenceLocalPath & referenceUrl are in renderVideoForFrame payload
const singlePayloadTarget = `promptOrder: frameId,
          // 🎯 CHỈ NẠP DUY NHẤT ẢNH CẢNH NÀY ĐỂ MUSE AI BIẾN ĐÚNG ẢNH TĨNH THÀNH VIDEO
          referenceAssetIds: validAssetId ? [validAssetId] : [],`;

const singlePayloadReplacement = `promptOrder: frameId,
          // 🎯 CHỈ NẠP DUY NHẤT ẢNH CẢNH NÀY ĐỂ MUSE AI BIẾN ĐÚNG ẢNH TĨNH THÀNH VIDEO
          referenceAssetIds: validAssetId ? [validAssetId] : [],
          referenceLocalPath: frame?.imageAsset?.localPath || undefined,
          referenceUrl: frame?.imageAsset?.url || undefined,`;

if (vfCode.includes(singlePayloadTarget)) {
  vfCode = vfCode.replace(singlePayloadTarget, singlePayloadReplacement);
  console.log('✅ Đã cập nhật payload renderVideoForFrame trong VideoFactoryStudio.js');
}

// Ensure referenceLocalPath & referenceUrl are in renderAllVideos payload
const allPayloadTarget = `promptOrder: frame.id,
            batchIndex: idx,
            // 🎯 CHỈ NẠP ẢNH CỦA CẢNH ĐÓ ĐỂ ĐỒNG NHẤT NHÂN VẬT & TƯ THẾ
            referenceAssetIds: validAssetId ? [validAssetId] : [],`;

const allPayloadReplacement = `promptOrder: frame.id,
            batchIndex: idx,
            // 🎯 CHỈ NẠP ẢNH CỦA CẢNH ĐÓ ĐỂ ĐỒNG NHẤT NHÂN VẬT & TƯ THẾ
            referenceAssetIds: validAssetId ? [validAssetId] : [],
            referenceLocalPath: frame?.imageAsset?.localPath || undefined,
            referenceUrl: frame?.imageAsset?.url || undefined,`;

if (vfCode.includes(allPayloadTarget)) {
  vfCode = vfCode.replace(allPayloadTarget, allPayloadReplacement);
  console.log('✅ Đã cập nhật payload renderAllVideos trong VideoFactoryStudio.js');
}

fs.writeFileSync(vfPath, vfCode, 'utf8');

// 2. CẬP NHẬT app/out/main/index.js
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const sMarker = '// 3.5. KÍCH HOẠT KHUNG CHAT VÀ NẠP ĐỒNG THỜI ẢNH THAM CHIẾU + PROMPT LÊN MUSE AI';
const eMarker = 'tracker.updateProgress(35, "Prompt đã gửi thành công!';

const sIdx = mainCode.indexOf(sMarker);
const eIdx = mainCode.indexOf(eMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('❌ Không tìm thấy marker trong main/index.js! sIdx:', sIdx, 'eIdx:', eIdx);
  process.exit(1);
}

const replacementBlock = `// 3.5. KÍCH HOẠT KHUNG CHAT VÀ NẠP ĐỒNG THỜI ẢNH THAM CHIẾU CẢNH + PROMPT LÊN MUSE AI
      tracker.updateProgress(20, "Đang mở khung chat Muse AI...");

      // BƯỚC 1: MỞ KHUNG CHAT (NẾU ĐANG Ở NÚT '+ NHẮN TIN' / '+ MESSAGE')
      await wc.executeJavaScript(\`
        (() => {
          const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span, a')).filter(b => {
            if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
            const t = (b.innerText || '').toLowerCase().trim();
            return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
          });
          if (pills.length > 0) {
            try { pills[0].click(); } catch(e) {}
          }
        })()
      \`, true);
      await new Promise(r => setTimeout(r, 600));

      // BƯỚC 2: TÌM VÀ ĐÍNH KÈM ĐÚNG ẢNH THAM CHIẾU CỦA CẢNH VÀO MUSE AI
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
      if (job.payload?.referenceLocalPath && fs.existsSync(job.payload.referenceLocalPath)) {
        if (!refFilePaths.includes(job.payload.referenceLocalPath)) {
          refFilePaths.push(job.payload.referenceLocalPath);
        }
      }
      if (refFilePaths.length === 0 && job.payload?.inputImageAssetId) {
        let asset = this.assets?.getAsset ? this.assets.getAsset(job.payload.inputImageAssetId) : null;
        if (!asset && typeof T !== 'undefined' && T.getAsset) asset = T.getAsset(job.payload.inputImageAssetId);
        const p = asset?.localPath || asset?.path;
        if (p && fs.existsSync(p)) {
          refFilePaths.push(p);
        }
      }

      if (refFilePaths.length > 0) {
        logDebug("Attaching reference images into active Muse chat", { count: refFilePaths.length, paths: refFilePaths });
        tracker.updateProgress(25, \`Đang đính kèm \${refFilePaths.length} ảnh cảnh vào Muse AI...\`);

        // A. Phương thức 1: CDP Native setFileInputFiles (Chuẩn engine AlexBright)
        let cdpAttached = false;
        try {
          if (!wc.debugger.isAttached()) wc.debugger.attach('1.3');
          const doc = await wc.debugger.sendCommand('DOM.getDocument');
          const node = await wc.debugger.sendCommand('DOM.querySelector', {
            nodeId: doc.root.nodeId,
            selector: 'input[type="file"]'
          });
          if (node?.nodeId) {
            await wc.debugger.sendCommand('DOM.setFileInputFiles', {
              files: refFilePaths,
              nodeId: node.nodeId
            });
            cdpAttached = true;
            logDebug("CDP setFileInputFiles succeeded", { files: refFilePaths });
          }
        } catch(cdpErr) {
          logDebug("CDP fallback", { error: cdpErr.message });
        }

        // B. Phương thức 2: DataTransfer DOM Injection & Clipboard Paste
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

                  const fi = document.querySelector('input[type="file"]');
                  if (fi) {
                    fi.files = dt.files;
                    fi.dispatchEvent(new Event('input', { bubbles: true }));
                    fi.dispatchEvent(new Event('change', { bubbles: true }));
                  }

                  const chatEl = document.querySelector('textarea, div[contenteditable="true"], [role="textbox"], input');
                  if (chatEl) {
                    chatEl.focus();
                    chatEl.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    chatEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    chatEl.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    chatEl.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                  }
                } catch(e) {}
              })()
            \`, true);

            // Clipboard Native Image Paste
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
              await new Promise(r => setTimeout(r, 200));
              wc.paste();
              await new Promise(r => setTimeout(r, 800));
            } catch(eClip) {}

            logDebug("Attached reference image successfully", { path: fpath });
          } catch(e) {
            logDebug("Error attaching image", { path: fpath, error: e.message });
          }
        }

        // Bấm nút đính kèm nếu giao diện có nút riêng
        await wc.executeJavaScript(\`
          (() => {
            const attachBtn = document.querySelector('button[aria-label="Đính kèm file"], button[aria-label="Attach file"], button[aria-label*="Đính kèm"], button[aria-label*="Attach"], button[title="Đính kèm file"], button[title="Attach file"]');
            const items = document.querySelectorAll("img[alt], img[src^='blob:'], [data-attachment-item]");
            if (attachBtn && items.length === 0) {
              try { attachBtn.click(); } catch(e) {}
            }
          })()
        \`, true);

        // Chờ hiển thị thẻ ảnh đính kèm (như AlexBright wait_for_function)
        for (let waitCount = 0; waitCount < 10; waitCount++) {
          const hasAttachment = await wc.executeJavaScript(\`
            (() => {
              const items = document.querySelectorAll("img[alt], img[src^='blob:'], [data-attachment-item], [class*='attachment'], [class*='preview']");
              return items.length >= \${refFilePaths.length};
            })()
          \`, true);
          if (hasAttachment) {
            logDebug("Attachment card verified in Muse DOM", { count: refFilePaths.length });
            break;
          }
          await new Promise(r => setTimeout(r, 400));
        }
      }

      // BƯỚC 3: NHẬP PROMPT VÀ GỬI (GỬI ĐỒNG THỜI HÀNG LOẠT NHƯ TỐI QUA)
      const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
      tracker.updateProgress(30, "Đang gửi prompt và ảnh cảnh lên Muse AI...");

      const sendRes = await wc.executeJavaScript(\`
        (async () => {
          try {
            const text = \${JSON.stringify(prompt)};

            function findChatInput() {
              const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span')).filter(b => {
                if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
                const rect = b.getBoundingClientRect();
                if (rect.left < 200) return false;
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

            let el = findChatInput();
            if (!el) {
              await new Promise(r => setTimeout(r, 600));
              el = findChatInput();
            }

            if (!el) {
              return { success: false, error: "Không tìm thấy khung chat Muse AI tại /thread/new" };
            }

            el.focus();
            el.click();

            if (el.isContentEditable) {
              const range = document.createRange();
              range.selectNodeContents(el);
              range.collapse(false);
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(range);
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
            await new Promise(r => setTimeout(r, 400));

            // Tìm nút gửi chuẩn từ AlexBright
            const sendBtn = document.querySelector('button[aria-label="Gửi"], button[aria-label="Send"], button[title="Gửi"], button[title="Send"]') ||
                            Array.from(document.querySelectorAll('button, [role="button"]')).find(b => {
                              const l = (b.getAttribute('aria-label') || b.innerText || '').toLowerCase();
                              return (l.includes('send') || l.includes('gửi')) && b.offsetWidth > 0;
                            });

            if (sendBtn) {
              sendBtn.click();
              return { success: true };
            }

            const form = el.closest('form');
            if (form && typeof form.requestSubmit === 'function') {
              form.requestSubmit();
              return { success: true };
            }

            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
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

      await new Promise(r => setTimeout(r, 1800));

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

      `;

mainCode = mainCode.substring(0, sIdx) + replacementBlock + mainCode.substring(eIdx);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('✅ Đã cập nhật thành công main/index.js!');
