const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// 1. Replace the sniffer inside getOrCreateView
const targetOldSnifferStart = `try {
  const _ses = A.webContents.session;
  if (!_ses.__museSnifferAttached) {`;

const targetOldSnifferEnd = `A.webContents.executeJavaScript(\`
      (() => {
        if (window.__sniffInjected) return;
        window.__sniffInjected = true;
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          try {
            const url = typeof args[0] === "string" ? args[0] : (args[0]?.url || "");
            const opt = args[1] || {};
            if (url.includes("api") || url.includes("chat") || url.includes("message") || opt.method === "POST") {
              console.log("[MUSE_FETCH_SNIFF]", opt.method || "GET", url, opt.body ? (typeof opt.body === "string" ? opt.body : JSON.stringify(opt.body)) : "");
            }
          } catch(e) {}
          return origFetch.apply(this, args);
        };
      })()
    \`).catch(() => {});
  });
} catch(err) {
  console.error("Sniffer attach error:", err);
}`;

const safeSniffer = `try {
  A.webContents.on("console-message", (evt, level, msg) => {
    if (typeof msg === "string" && msg.startsWith("[MUSE_FETCH_SNIFF]")) {
      const _desk = nodePath.join(Jo(), "Desktop", "MUSE_API_SNIFFER.txt");
      nodeFs.appendFileSync(_desk, "\\n" + msg + "\\n", "utf8");
    }
  });

  const _injectHook = () => {
    A.webContents.executeJavaScript(\`
      (() => {
        if (window.__sniffInjected) return;
        window.__sniffInjected = true;
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
          try {
            const url = typeof args[0] === "string" ? args[0] : (args[0]?.url || "");
            const opt = args[1] || {};
            if (!url.match(/\\\\.(css|png|jpg|jpeg|svg|woff2?|ico|gif)($|\\\\?)/i)) {
              const bodyStr = opt.body ? (typeof opt.body === "string" ? opt.body : JSON.stringify(opt.body)) : "";
              if (url.includes("muse.ai") || opt.method === "POST" || bodyStr.length > 0) {
                console.log("[MUSE_FETCH_SNIFF] " + (opt.method || "GET") + " " + url + " BODY: " + bodyStr);
              }
            }
          } catch(e) {}
          return origFetch.apply(this, args);
        };

        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(m, u) {
          this.__m = m;
          this.__u = u;
          return origOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function(b) {
          try {
            if (this.__u && !this.__u.match(/\\\\.(css|png|jpg|jpeg|svg|woff2?|ico|gif)($|\\\\?)/i)) {
              const bodyStr = b ? (typeof b === "string" ? b : JSON.stringify(b)) : "";
              if (this.__u.includes("muse.ai") || this.__m === "POST" || bodyStr.length > 0) {
                console.log("[MUSE_FETCH_SNIFF] [XHR] " + this.__m + " " + this.__u + " BODY: " + bodyStr);
              }
            }
          } catch(e) {}
          return origSend.apply(this, arguments);
        };
      })()
    \`).catch(() => {});
  };

  A.webContents.on("dom-ready", _injectHook);
  A.webContents.on("did-finish-load", _injectHook);
} catch(err) {}`;

const sIdx = content.indexOf(targetOldSnifferStart);
const eIdx = content.indexOf(targetOldSnifferEnd);
if (sIdx !== -1 && eIdx !== -1) {
  const fullOld = content.slice(sIdx, eIdx + targetOldSnifferEnd.length);
  content = content.replace(fullOld, safeSniffer);
  console.log('Replaced old webRequest sniffer with safe JS sniffer!');
} else {
  console.log('Old sniffer block not found (may already be replaced).');
}

// 2. Now update findChatInput inside MuseVideoRuntime
const oldFindFn = `function findChatInput() {
          const all = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"], input[type="text"]'));
          const candidates = all.filter(el => {
            if (el.offsetWidth <= 0 || el.offsetHeight <= 0) return false;
            const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            if (p.includes('search') || p.includes('tìm kiếm')) return false;
            if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
            return true;
          });
          const match = candidates.find(el => {
            const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            return p.includes('message') || p.includes('hỏi') || p.includes('chat') || p.includes('prompt');
          });
          if (match) return match;
          if (candidates.length > 0) {
            candidates.sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
            return candidates[0];
          }
          return null;
        }`;

const newFindFn = `function findChatInput() {
          // Look for chat input elements
          const targets = Array.from(document.querySelectorAll('textarea, input[data-slot="input"], div[contenteditable="true"], [role="textbox"], input[type="text"], input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])'));
          const valid = targets.filter(el => {
            const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            if (p.includes('search') || p.includes('tìm kiếm')) return false;
            if (el.closest('aside, [class*="sidebar"], [class*="nav"], nav')) return false;
            return true;
          });
          const msgInput = valid.find(el => {
            const p = (el.placeholder || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').toLowerCase();
            return p.includes('message') || p.includes('hỏi') || p.includes('chat') || p.includes('prompt');
          });
          if (msgInput) return msgInput;
          if (valid.length > 0) return valid[valid.length - 1];

          // Check if there is a button/pill with text "+ Message"
          const pills = Array.from(document.querySelectorAll('*')).filter(e => e.innerText && e.innerText.trim().includes('Message') && e.children.length === 0);
          for (const pill of pills) {
            try {
              pill.click();
              const found = document.querySelector('textarea, div[contenteditable="true"], input[type="text"], input[data-slot="input"]');
              if (found) return found;
            } catch(e) {}
          }
          return null;
        }`;

if (content.includes(oldFindFn)) {
  content = content.replace(oldFindFn, newFindFn);
  console.log('Successfully updated findChatInput to robust selector without offsetWidth check!');
} else {
  console.log('Warning: oldFindFn not found exactly.');
}

fs.writeFileSync(mainPath, content, 'utf8');
console.log('Finished updating main index.js');
