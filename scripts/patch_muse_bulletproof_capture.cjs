const fs = require('fs');

const file = 'app/out/main/index.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Inject blob watcher before prompt is sent
const targetBeforePrompt = `const prompt = String(job.payload?.prompt || job.title || "").trim();`;
const replacementBeforePrompt = `// Install blob interception watcher before sending prompt
    try {
      await wc.executeJavaScript(\`
        (() => {
          window.__muse_prompt_time = Date.now();
          if (!window.__muse_blob_hook_installed) {
            window.__muse_blob_hook_installed = true;
            window.__captured_video_blobs = [];
            const origCreate = URL.createObjectURL;
            URL.createObjectURL = function(obj) {
              const url = origCreate.call(this, obj);
              try {
                if (obj && obj instanceof Blob) {
                  const isVideo = (obj.type && obj.type.includes('video')) || obj.size > 800000;
                  if (isVideo) {
                    window.__captured_video_blobs.push({
                      url: url,
                      size: obj.size,
                      type: obj.type || 'video/mp4',
                      time: Date.now()
                    });
                  }
                }
              } catch(e) {}
              return url;
            };
          }
        })()
      \`, true);
    } catch(e) {}

    const prompt = String(job.payload?.prompt || job.title || "").trim();`;

if (!content.includes(targetBeforePrompt)) {
  console.error('targetBeforePrompt not found!');
  process.exit(1);
}
content = content.replace(targetBeforePrompt, replacementBeforePrompt);
console.log('✓ Added URL.createObjectURL hook before prompt');

// 2. Replace the probe with multi-layered catcher
const oldProbeStart = `      // Don't even search for videos in the first 20 seconds to completely ignore any spinner or mascot animation
      if (elapsed < 20) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }`;

const oldProbeEnd = `            return { found: false };
          } catch(e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);`;

const startIdx = content.indexOf(oldProbeStart);
const endIdx = content.indexOf(oldProbeEnd, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not locate old probe range in main/index.js!');
  process.exit(1);
}

const targetOldProbe = content.substring(startIdx, endIdx + oldProbeEnd.length);

const newProbe = `      // Don't search for videos in first 15s to let render begin
      if (elapsed < 15) {
        await new Promise(r => setTimeout(r, 3000));
        continue;
      }

      const probe = await wc.executeJavaScript(\`
        (async () => {
          try {
            const initial = new Set(\${JSON.stringify(initialVideos)});
            const promptTime = window.__muse_prompt_time || 0;

            // 1. Auto scroll chat container to bottom so latest video message is mounted in DOM
            try {
              const scrollers = document.querySelectorAll('main, [class*="chat"], [class*="thread"], [class*="message"], [role="main"]');
              scrollers.forEach(s => { s.scrollTop = s.scrollHeight; });
              window.scrollTo(0, document.body.scrollHeight);
            } catch(e) {}

            // 2. Check URL.createObjectURL captured blobs (size > 800KB)
            const captured = window.__captured_video_blobs || [];
            for (let i = captured.length - 1; i >= 0; i--) {
              const b = captured[i];
              if (b.time >= promptTime - 3000 && b.size > 800000) {
                return { found: true, src: b.url, size: b.size, source: 'blob_hook' };
              }
            }

            // 3. Click play button on video cards if present (triggers video element mount)
            try {
              const playBtns = Array.from(document.querySelectorAll('button, [role="button"], [class*="play"], svg, [aria-label*="play" i], [aria-label*="phát" i]')).filter(b => {
                if (b.closest('aside, [class*="sidebar"], [class*="status"], header')) return false;
                const r = b.getBoundingClientRect();
                return r.width > 20 && r.height > 20 && r.top > 100;
              });
              if (playBtns.length > 0) {
                const lastPlay = playBtns[playBtns.length - 1];
                lastPlay.click();
              }
            } catch(e) {}

            // 4. Query HTML5 <video> elements excluding mascot
            const videos = Array.from(document.querySelectorAll('video'));
            for (let i = videos.length - 1; i >= 0; i--) {
              const v = videos[i];
              if (v.closest('aside, [class*="status"], [class*="sidebar"], [class*="profile"], header')) continue;
              const rect = v.getBoundingClientRect();
              if (rect.width > 0 && rect.width < 180) continue;
              if (rect.height > 0 && rect.height < 180) continue;

              const src = v.src || v.currentSrc || v.querySelector('source')?.src;
              if (src && !initial.has(src) && (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:'))) {
                return { found: true, src: src, duration: v.duration || 5, width: rect.width, height: rect.height, source: 'video_element' };
              }
            }

            // 5. Query download / mp4 links
            const mp4s = Array.from(document.querySelectorAll('a[href*=".mp4"], a[download], a[href*="blob:"]'));
            for (let i = mp4s.length - 1; i >= 0; i--) {
              const a = mp4s[i];
              if (a.closest('aside, [class*="sidebar"], [class*="status"]')) continue;
              if (a.href && !initial.has(a.href)) {
                return { found: true, src: a.href, duration: 5, source: 'link' };
              }
            }

            // 6. Check performance resource entries
            try {
              const resources = performance.getEntriesByType('resource');
              for (let i = resources.length - 1; i >= 0; i--) {
                const r = resources[i];
                if ((r.name.startsWith('blob:') || r.name.includes('.mp4')) && !initial.has(r.name)) {
                  if (r.startTime > 10000) {
                    return { found: true, src: r.name, source: 'performance' };
                  }
                }
              }
            } catch(e) {}

            return { found: false };
          } catch(e) {
            return { found: false, error: e.message };
          }
        })()
      \`, true);`;

content = content.replace(targetOldProbe, newProbe);
console.log('✓ Replaced probe with multi-layered catcher');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully applied patch_muse_bulletproof_capture!');
