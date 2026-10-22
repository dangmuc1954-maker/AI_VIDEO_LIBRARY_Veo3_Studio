const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// Replace the old sniffer block
const oldSnifferStart = `try {
  const _ses = A.webContents.session;
  if (!_ses.__museSnifferAttached) {`;

const oldSnifferEnd = `A.webContents.executeJavaScript(\`
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

const cleanSniffer = `try {
  const _ses = A.webContents.session;
  if (!_ses.__museSnifferAttached) {
    _ses.__museSnifferAttached = true;
    const _desk = nodePath.join(Jo(), "Desktop", "MUSE_API_SNIFFER.txt");
    
    _ses.webRequest.onBeforeRequest({ urls: ["*://*/*"] }, (details, callback) => {
      try {
        const u = details.url || "";
        if (u.includes("muse.ai") || u.includes("chat") || u.includes("message") || u.includes("video") || u.includes("conversation") || u.includes("graphql") || u.includes("generate")) {
          if (!u.match(/\\.(css|png|jpg|jpeg|svg|woff2?|ico|gif)($|\\?)/i)) {
            let body = "";
            if (details.uploadData) {
              details.uploadData.forEach(p => {
                if (p.bytes) {
                  try { body += p.bytes.toString("utf8"); } catch(err) {}
                }
              });
            }
            if (details.method === "POST" || details.method === "PUT" || body.length > 0 || u.includes("/api/")) {
              const entry = "\\n======================================================\\n" +
                            "[" + new Date().toLocaleTimeString() + "] " + details.method + " " + u + "\\n" +
                            (body ? "BODY:\\n" + body + "\\n" : "") +
                            "======================================================\\n";
              nodeFs.appendFileSync(_desk, entry, "utf8");
              console.log("[MUSE_SNIFFER_REQUEST]", details.method, u);
            }
          }
        }
      } catch(err) {}
      callback({});
    });

    _ses.webRequest.onBeforeSendHeaders({ urls: ["*://*/*"] }, (details, callback) => {
      try {
        const u = details.url || "";
        if (u.includes("muse.ai") && (details.method === "POST" || details.method === "PUT" || u.includes("/api/"))) {
          if (!u.match(/\\.(css|png|jpg|jpeg|svg|woff2?|ico|gif)($|\\?)/i)) {
            const h = JSON.stringify(details.requestHeaders, null, 2);
            nodeFs.appendFileSync(_desk, "HEADERS for [" + details.method + "] " + u + ":\\n" + h + "\\n\\n", "utf8");
          }
        }
      } catch(err) {}
      callback({ requestHeaders: details.requestHeaders });
    });
  }

  A.webContents.on("console-message", (evt, level, msg) => {
    if (typeof msg === "string" && msg.startsWith("[MUSE_FETCH_SNIFF]")) {
      const _desk = nodePath.join(Jo(), "Desktop", "MUSE_API_SNIFFER.txt");
      nodeFs.appendFileSync(_desk, "\\n>>> JS_FETCH: " + msg + "\\n", "utf8");
    }
  });

  A.webContents.on("dom-ready", () => {
    A.webContents.executeJavaScript(\`
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

const sIdx = content.indexOf(oldSnifferStart);
const eIdx = content.indexOf(oldSnifferEnd);
if (sIdx !== -1 && eIdx !== -1) {
  const fullOld = content.slice(sIdx, eIdx + oldSnifferEnd.length);
  content = content.replace(fullOld, cleanSniffer);
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('Successfully replaced old sniffer with ES module sniffer!');
} else {
  console.error('Could not find sniffer block: sIdx=' + sIdx + ', eIdx=' + eIdx);
}
