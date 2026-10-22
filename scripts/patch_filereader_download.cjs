const fs = require('fs');

const file = 'app/out/main/index.js';
let s = fs.readFileSync(file, 'utf8');

const oldFetchBlock = `        try {
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
          logDebug("In-page fetch error", { error: e.message });
        }`;

const newFetchBlock = `        try {
          const fetchRes = await wc.executeJavaScript(\`
            (async () => {
              try {
                const r = await fetch(\${JSON.stringify(probe.src)});
                const blob = await r.blob();
                const b64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const res = String(reader.result || '');
                    const commaIdx = res.indexOf(',');
                    resolve(commaIdx !== -1 ? res.substring(commaIdx + 1) : res);
                  };
                  reader.onerror = () => reject(new Error('FileReader failed'));
                  reader.readAsDataURL(blob);
                });
                return { ok: true, data: b64, size: blob.size };
              } catch (e) {
                return { ok: false, error: e.message };
              }
            })()
          \`, true);
          if (fetchRes?.ok && fetchRes.data) {
            videoBytes = Buffer.from(fetchRes.data, 'base64');
            logDebug("Converted video blob via native FileReader successfully", { byteLength: videoBytes.length });
          } else {
            logDebug("FileReader fetchRes not ok", fetchRes);
          }
        } catch (e) {
          logDebug("In-page fetch error", { error: e.message });
        }`;

if (!s.includes(oldFetchBlock)) {
  console.error('Could not find oldFetchBlock in app/out/main/index.js!');
  process.exit(1);
}

s = s.replace(oldFetchBlock, newFetchBlock);
fs.writeFileSync(file, s, 'utf8');
console.log('✓ Successfully replaced slow arrayBuffer loop with native C++ FileReader!');
