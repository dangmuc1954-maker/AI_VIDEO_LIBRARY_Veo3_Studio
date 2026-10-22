const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

async function generateFlowVideo({ accId, prompt, modelName = 'Veo 3.1 - Lite', ratio = '16:9', onProgress }) {
  const sess = session.fromPartition(`persist:aivideo:${accId}`);
  const assetsDir = path.join(app.getPath('userData'), 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      session: sess,
      contextIsolation: false
    }
  });

  try {
    onProgress?.(10, 'Connecting to Google Flow...');
    await win.loadURL('https://flow.google.com/');
    await new Promise(r => setTimeout(r, 5000));

    // Open existing project or click New Project
    onProgress?.(18, 'Opening project workspace...');
    const hasProject = win.webContents.getURL().includes('/project/');
    if (!hasProject) {
      await win.webContents.executeJavaScript(`(() => {
        const btns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
        const newBtn = btns.find(b => (b.innerText || '').includes('New project'));
        if (newBtn) newBtn.click();
      })()`);
      await new Promise(r => setTimeout(r, 6000));
    }

    onProgress?.(25, 'Configuring video settings...');
    // Open settings menu
    await win.webContents.executeJavaScript(`(() => {
      const btn = document.querySelector('button.settings-trigger-button');
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Switch to Video mode
    await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      const videoBtn = btns.find(b => (b.innerText || '').includes('Video'));
      if (videoBtn) videoBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));

    // Select Ratio if available
    if (ratio === '9:16') {
      await win.webContents.executeJavaScript(`(() => {
        const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
        const rBtn = btns.find(b => (b.innerText || '').includes('9:16'));
        if (rBtn) rBtn.click();
      })()`);
      await new Promise(r => setTimeout(r, 500));
    } else {
      await win.webContents.executeJavaScript(`(() => {
        const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
        const rBtn = btns.find(b => (b.innerText || '').includes('16:9'));
        if (rBtn) rBtn.click();
      })()`);
      await new Promise(r => setTimeout(r, 500));
    }

    // Select Model
    await win.webContents.executeJavaScript(`(() => {
      const dd = document.querySelector('.cdk-overlay-pane button[aria-label="Select model family"]');
      if (dd) dd.click();
    })()`);
    await new Promise(r => setTimeout(r, 800));

    await win.webContents.executeJavaScript(`((targetModel) => {
      const opts = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      const found = opts.find(o => (o.innerText || '').toLowerCase().includes(targetModel.toLowerCase())) ||
                    opts.find(o => (o.innerText || '').includes('Veo 3.1 - Lite')) ||
                    opts.find(o => (o.innerText || '').includes('Omni 1.1 Flash'));
      if (found) found.click();
    })(${JSON.stringify(modelName)})`);
    await new Promise(r => setTimeout(r, 800));

    // Close settings popup
    await win.webContents.executeJavaScript(`(() => {
      const backdrop = document.querySelector('.cdk-overlay-backdrop');
      if (backdrop) backdrop.click();
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (pm) pm.focus();
    })()`);
    await new Promise(r => setTimeout(r, 600));

    // Count existing video tiles before generating
    const prevTileCount = await win.webContents.executeJavaScript(`(() => {
      return document.querySelectorAll('flow-tile-hover-footer, .project-tile-hover-footer, flow-media-tile').length;
    })()`);

    // Type prompt
    onProgress?.(35, 'Entering prompt...');
    await win.webContents.executeJavaScript(`((text) => {
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (!pm) throw new Error('Prompt box not found in Google Flow');
      pm.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
    })(${JSON.stringify(prompt)})`);
    await new Promise(r => setTimeout(r, 800));

    // Click generate button
    onProgress?.(40, 'Starting Google Flow generation...');
    const clicked = await win.webContents.executeJavaScript(`(() => {
      const genBtn = document.querySelector('button.generate-icon-button');
      if (!genBtn) throw new Error('Generate button not found');
      genBtn.click();
      return true;
    })()`);

    // Monitor progress until completion (up to 120s)
    let lastPct = 0;
    let finished = false;
    for (let sec = 0; sec < 40; sec++) {
      await new Promise(r => setTimeout(r, 3000));
      const status = await win.webContents.executeJavaScript(`(() => {
        const text = document.body.innerText || '';
        const pctMatches = text.match(/(\\d{1,3})%/g);
        const tileCount = document.querySelectorAll('flow-tile-hover-footer, .project-tile-hover-footer, flow-media-tile').length;
        return {
          pct: pctMatches ? parseInt(pctMatches[0].replace('%','')) : null,
          tileCount
        };
      })()`);

      if (status.pct !== null) {
        lastPct = status.pct;
        const mapped = Math.min(92, Math.round(40 + (lastPct * 0.52)));
        onProgress?.(mapped, 'Rendering video in Google Flow (' + lastPct + '%)');
      } else if (lastPct > 15 || status.tileCount > prevTileCount) {
        // Percentage disappeared or tile count increased -> finished!
        finished = true;
        break;
      }
    }

    onProgress?.(94, 'Downloading generated video...');
    // Setup download interceptor
    const targetFile = path.join(assetsDir, 'flow_video_' + Date.now() + '.mp4');
    const downloadPromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Download timed out')), 25000);
      sess.once('will-download', (event, item) => {
        item.setSavePath(targetFile);
        item.once('done', (e, state) => {
          clearTimeout(timer);
          if (state === 'completed') resolve(targetFile);
          else reject(new Error('Download failed: ' + state));
        });
      });
    });

    // Click the first tile (newest video)
    await win.webContents.executeJavaScript(`(() => {
      const tiles = Array.from(document.querySelectorAll('flow-tile-hover-footer, .project-tile-hover-footer, flow-media-tile'));
      const newest = tiles[0];
      if (newest) newest.click();
    })()`);
    await new Promise(r => setTimeout(r, 2500));

    // Click Download button
    await win.webContents.executeJavaScript(`(() => {
      const dlBtn = document.querySelector('button[aria-label="Download media"], button[aria-label="Download"]');
      if (dlBtn) dlBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1200));

    // Click 720p option in download menu
    await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      const btn720 = btns.find(b => (b.innerText || '').includes('720p')) || btns[0];
      if (btn720) btn720.click();
    })()`);

    const downloadedPath = await downloadPromise;
    onProgress?.(100, 'Video generation complete');
    return {
      filePath: downloadedPath,
      fileSize: fs.statSync(downloadedPath).size
    };

  } finally {
    win.destroy();
  }
}

app.whenReady().then(async () => {
  try {
    console.log('--- TESTING FULL AUTOMATION FLOW ---');
    const res = await generateFlowVideo({
      accId: 'veo3-1788597242484',
      prompt: 'A futuristic electric motorcycle speeding across a neon bridge at night, highly detailed 4k',
      modelName: 'Veo 3.1 - Lite',
      ratio: '16:9',
      onProgress: (pct, msg) => console.log(`[PROGRESS ${pct}%] ${msg}`)
    });
    console.log('\n🎉 SUCCESS! Generated video result:', res);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    app.quit();
  }
});
