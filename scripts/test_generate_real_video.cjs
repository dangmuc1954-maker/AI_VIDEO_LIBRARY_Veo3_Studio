const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const accId = 'veo3-1788597242484';
  const sess = session.fromPartition(`persist:aivideo:${accId}`);

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
    const projUrl = 'https://flow.google.com/project/2494967d-5f94-4cd0-9fde-49e8f0dc3d87';
    console.log('Loading project:', projUrl);
    await win.loadURL(projUrl);
    await new Promise(r => setTimeout(r, 6000));

    // Step 1: Open Settings Menu
    console.log('Opening settings menu...');
    await win.webContents.executeJavaScript(`(() => {
      const btn = document.querySelector('button.settings-trigger-button');
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Step 2: Switch to Video mode
    console.log('Switching to Video mode...');
    const switchVideo = await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      const videoBtn = btns.find(b => (b.innerText || '').includes('Video'));
      if (videoBtn) {
        videoBtn.click();
        return true;
      }
      return false;
    })()`);
    console.log('Switched to video:', switchVideo);
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Select Veo 3.1 - Lite or Omni 1.1 Flash
    console.log('Selecting model...');
    await win.webContents.executeJavaScript(`(() => {
      // Click model dropdown
      const dd = document.querySelector('.cdk-overlay-pane button[aria-label="Select model family"]');
      if (dd) dd.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    const selectModel = await win.webContents.executeJavaScript(`(() => {
      const opts = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      // Prefer Veo 3.1 - Lite or Omni 1.1 Flash
      const liteOpt = opts.find(o => (o.innerText || '').includes('Veo 3.1 - Lite')) ||
                      opts.find(o => (o.innerText || '').includes('Omni 1.1 Flash'));
      if (liteOpt) {
        liteOpt.click();
        return liteOpt.innerText?.trim();
      }
      return 'not found';
    })()`);
    console.log('Selected model:', selectModel);
    await new Promise(r => setTimeout(r, 1000));

    // Step 4: Close settings menu by clicking outside or pressing Escape
    await win.webContents.executeJavaScript(`(() => {
      const backdrop = document.querySelector('.cdk-overlay-backdrop');
      if (backdrop) backdrop.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    // Step 5: Type prompt into ProseMirror
    console.log('Typing prompt into ProseMirror...');
    const promptText = 'A sleek silver sports car driving fast along a coastal highway at dusk, cinematic 4k';
    const typeResult = await win.webContents.executeJavaScript(`(() => {
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (!pm) return { error: 'ProseMirror not found' };
      pm.focus();
      // Clear existing content
      pm.innerHTML = '<p><br class="ProseMirror-trailingBreak"></p>';
      document.execCommand('insertText', false, ${JSON.stringify(promptText)});
      
      const genBtn = document.querySelector('button.generate-icon-button');
      return {
        typedText: pm.innerText?.trim(),
        btnDisabled: genBtn ? genBtn.disabled : null
      };
    })()`);
    console.log('Type result:', typeResult);
    await new Promise(r => setTimeout(r, 1000));

    // Step 6: Click generate button
    console.log('Clicking generate button...');
    const clickGen = await win.webContents.executeJavaScript(`(() => {
      const genBtn = document.querySelector('button.generate-icon-button');
      if (!genBtn) return { error: 'No genBtn' };
      genBtn.click();
      return { clicked: true };
    })()`);
    console.log('Click generate result:', clickGen);

    // Step 7: Poll progress every 3 seconds for up to 90 seconds
    console.log('Polling video generation progress...');
    let completedVideo = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 3000));
      const status = await win.webContents.executeJavaScript(`(() => {
        // Find progress or tiles
        const tiles = Array.from(document.querySelectorAll('flow-media-tile, [data-media-id], div.tile, .media-item'));
        const text = document.body.innerText || '';
        
        // Find any percentage in text
        const pctMatches = text.match(/(\\d{1,3})%/g);
        
        // Check for completed video elements
        const videos = Array.from(document.querySelectorAll('video'));
        const videoSources = videos.map(v => v.src || v.querySelector('source')?.src).filter(Boolean);

        return {
          percentages: pctMatches,
          videosFound: videoSources,
          tilesCount: tiles.length
        };
      })()`);

      console.log(`[Poll ${i+1}] Progress:`, status.percentages || 'rendering...', 'Videos:', status.videosFound);
      if (status.videosFound && status.videosFound.length > 0) {
        completedVideo = status.videosFound[0];
        console.log('VIDEO GENERATION COMPLETED! URL:', completedVideo);
        break;
      }
    }

    const finalImg = await win.webContents.capturePage();
    fs.writeFileSync('flow_video_result.png', finalImg.toPNG());
    console.log('Final screenshot saved to flow_video_result.png');

  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
