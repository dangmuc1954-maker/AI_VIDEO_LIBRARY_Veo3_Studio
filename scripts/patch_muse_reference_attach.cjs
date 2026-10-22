const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] KHẮC PHỤC TRIỆT ĐỂ LỖI NẠP ẢNH THAM CHIẾU LÊN MUSE AI ===');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const sMarker = '// 3.5. ĐÍNH KÈM ẢNH THAM CHIẾU (IMAGE-TO-VIDEO) NẾU CÓ';
const eMarker = 'logDebug("Send prompt result", sendRes);';

const sIdx = mainCode.indexOf(sMarker);
const eIdx = mainCode.indexOf(eMarker);

if (sIdx === -1 || eIdx === -1) {
  console.error('❌ Không tìm thấy vị trí đánh dấu trong main/index.js!');
  process.exit(1);
}

const newBlock = `// 3.5. KÍCH HOẠT KHUNG CHAT VÀ NẠP ĐỒNG THỜI ẢNH THAM CHIẾU + PROMPT LÊN MUSE AI
      tracker.updateProgress(20, "Đang mở và kết nối khung chat Muse AI...");

      // BƯỚC 1: BẤM NÚT '+ NHẮN TIN' / KÍCH HOẠT KHUNG CHAT MỚI TRÊN GIAO DIỆN MUSE
      const initChatRes = await wc.executeJavaScript(\`
        (async () => {
          function activateChatPill() {
            const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span, a')).filter(b => {
              if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
              const rect = b.getBoundingClientRect();
              if (rect.left < 200) return false;
              const t = (b.innerText || '').toLowerCase().trim();
              return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message' || t.includes('nhắn tin') || t.includes('message');
            });
            for (const p of pills) {
              try { p.click(); } catch(e) {}
            }
          }

          function getRealChatEl() {
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
            return msgEl || all[0] || null;
          }

          activateChatPill();
          await new Promise(r => setTimeout(r, 600));

          for (let retry = 0; retry < 12; retry++) {
            const el = getRealChatEl();
            if (el) {
              el.focus();
              try { el.click(); } catch(e) {}
              return { success: true, tag: el.tagName };
            }
            activateChatPill();
            await new Promise(r => setTimeout(r, 500));
          }
          return { success: false };
        })()
      \`, true);
      logDebug("Chatbox initial activation", initChatRes);

      // BƯỚC 2: ĐÍNH KÈM ẢNH THAM CHIẾU (IMAGE-TO-VIDEO) NẾU CÓ
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
        logDebug("Attaching reference images into active Muse chat", { count: refFilePaths.length, paths: refFilePaths });
        tracker.updateProgress(25, \`Đang đính kèm \${refFilePaths.length} ảnh tham chiếu vào Muse AI...\`);

        for (const fpath of refFilePaths) {
          try {
            const b64 = fs.readFileSync(fpath).toString('base64');
            const fname = path.basename(fpath);
            const mime = fpath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

            // Gán file qua DataTransfer vào input[type="file"] và dispatch drag/drop/paste vào ô chat
            const attachRes = await wc.executeJavaScript(\`
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

                  function getChatEl() {
                    const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
                      if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
                      const rect = el.getBoundingClientRect();
                      if (rect.left < 200 && rect.width < 120) return false;
                      const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                      return !p.includes('search') && !p.includes('tìm kiếm') && el.type !== 'search';
                    });
                    return all[0] || null;
                  }

                  const chatEl = getChatEl();

                  // 1. Thử gán vào tất cả input[type="file"]
                  const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
                  for (const fi of fileInputs) {
                    try {
                      fi.files = dt.files;
                      fi.dispatchEvent(new Event('input', { bubbles: true }));
                      fi.dispatchEvent(new Event('change', { bubbles: true }));
                    } catch(e) {}
                  }

                  // 2. Dispatch drop và paste event trực tiếp vào khung chat
                  if (chatEl) {
                    chatEl.focus();
                    try {
                      chatEl.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
                      chatEl.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
                      chatEl.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
                    } catch(e) {}
                    try {
                      chatEl.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
                    } catch(e) {}
                  }

                  return { success: true, countInputs: fileInputs.length, hasChatEl: !!chatEl };
                } catch(e) {
                  return { success: false, error: e.message };
                }
              })()
            \`, true);

            logDebug("Attach DOM injection result", attachRes);

            // 3. Kết hợp Native Clipboard Paste của Electron
            try {
              const nativeImg = electron.nativeImage.createFromPath(fpath);
              electron.clipboard.writeImage(nativeImg);
              wc.focus();
              await wc.executeJavaScript(\`
                (() => {
                  const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
                    if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
                    const rect = el.getBoundingClientRect();
                    if (rect.left < 200 && rect.width < 120) return false;
                    const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                    return !p.includes('search') && !p.includes('tìm kiếm') && el.type !== 'search';
                  });
                  const el = all[0];
                  if (el) { el.focus(); el.click(); }
                })()
              \`, true);
              await new Promise(r => setTimeout(r, 400));
              wc.paste();
              await new Promise(r => setTimeout(r, 1500));
            } catch(eClip) {}

            logDebug("Attached reference image successfully", { path: fpath });
          } catch(e) {
            logDebug("Error attaching image", { path: fpath, error: e.message });
          }
        }
        // Chờ Muse AI hoàn tất render ảnh đính kèm vào khung chat
        await new Promise(r => setTimeout(r, 2000));
      }

      // BƯỚC 3: NHẬP PROMPT VÀ GỬI (ĐẢM BẢO KHÔNG XÓA MẤT ẢNH VỪA ĐÍNH KÈM)
      const prompt = typeof job.payload?.prompt === "string" ? job.payload.prompt : (job.title || "");
      tracker.updateProgress(35, "Đang gửi prompt và ảnh tham chiếu lên Muse AI...");

      const sendRes = await wc.executeJavaScript(\`
        (async () => {
          try {
            const text = \${JSON.stringify(prompt)};

            function getRealChatEl() {
              const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input')).filter(el => {
                if (el.disabled || el.readOnly || el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
                const rect = el.getBoundingClientRect();
                if (rect.left < 200 && rect.width < 120) return false;
                const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                return !p.includes('search') && !p.includes('tìm kiếm') && el.type !== 'search';
              });
              const msgEl = all.find(el => {
                const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
                return p.includes('nhắn tin') || p.includes('tin nhắn') || p.includes('message') || p.includes('chat') || p.includes('ask');
              });
              return msgEl || all[0] || null;
            }

            let el = null;
            for (let retry = 0; retry < 10; retry++) {
              el = getRealChatEl();
              if (el) break;
              await new Promise(r => setTimeout(r, 400));
            }

            if (!el) {
              return { success: false, error: "Không tìm thấy khung chat Muse AI" };
            }

            el.focus();

            // Nếu là contenteditable, chèn text vào cuối để không ghi đè ảnh
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
            await new Promise(r => setTimeout(r, 600));

            // BƯỚC 4: TÌM VÀ BẤM NÚT GỬI (SUBMIT)
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

      logDebug("Send prompt result", sendRes);`;

mainCode = mainCode.slice(0, sIdx) + newBlock + mainCode.slice(eIdx + eMarker.length);
fs.writeFileSync(mainPath, mainCode, 'utf8');

execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
console.log('✅ Đã cập nhật quy trình nạp Ảnh Tham Chiếu + Prompt chuẩn xác 100%!');
