const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

const targetOld = `    const logDebug = (msg, data = {}) => {
      try {
        const line = "[" + new Date().toISOString() + "] " + msg + " " + JSON.stringify(data) + "\\n";
        fs.appendFileSync(path.join(process.env.APPDATA, "AI_VIDEO_LIBRARY_DATA", "muse-debug.log"), line, "utf8");
      } catch(e) {}
    };

    logDebug("Starting Muse video job", { jobId: job.id, accountId: session.accountId });
    tracker.updateProgress(10, "Kết nối với trình duyệt Muse AI...");
    const viewInfo = this.browserViewManager.getOrCreateView(session);`;

const targetNew = `    const logDebug = (msg, data = {}) => {
      try {
        const line = "[" + new Date().toISOString() + "] " + msg + " " + JSON.stringify(data) + "\\n";
        nodeFs.appendFileSync(nodePath.join(Jo(), "Desktop", "MUSE_DEBUG.log"), line, "utf8");
      } catch(e) {}
    };

    logDebug("Starting Muse video job", { jobId: job.id, accountId: session.accountId });
    tracker.updateProgress(10, "Kết nối với trình duyệt Muse AI...");
    const viewInfo = this.browserViewManager.getOrCreateView(session);
    try {
      if (viewInfo?.view && typeof viewInfo.view.setBounds === "function") {
        const b = viewInfo.view.getBounds?.() || {};
        if (!b.width || b.width < 200) {
          viewInfo.view.setBounds({ x: 0, y: 0, width: 1280, height: 800 });
        }
      }
    } catch(e) {}`;

if (content.includes(targetOld)) {
  content = content.replace(targetOld, targetNew);
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('Successfully patched logDebug and setBounds for Muse AI!');
} else {
  console.error('Could not find targetOld snippet!');
}
