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

    // Open settings menu
    console.log('Opening settings menu...');
    await win.webContents.executeJavaScript(`(() => {
      const btn = document.querySelector('button.settings-trigger-button');
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Switch to Video mode
    console.log('Switching to Video mode...');
    await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button'));
      const videoBtn = btns.find(b => (b.innerText || '').includes('Video'));
      if (videoBtn) videoBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Close settings popup by clicking prompt box
    await win.webContents.executeJavaScript(`(() => {
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (pm) pm.focus();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Type prompt
    console.log('Typing prompt into ProseMirror...');
    const promptText = 'A majestic eagle soaring over snow-capped mountains at sunrise, cinematic 4k';
    const typeResult = await win.webContents.executeJavaScript(`(() => {
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (!pm) return { error: 'ProseMirror not found' };
      pm.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      const ok = document.execCommand('insertText', false, ${JSON.stringify(promptText)});
      
      const genBtn = document.querySelector('button.generate-icon-button');
      return {
        ok,
        text: pm.innerText?.trim(),
        btnDisabled: genBtn ? genBtn.disabled : null
      };
    })()`);
    console.log('Type result:', typeResult);
    await new Promise(r => setTimeout(r, 1000));

    // Click generate button
    console.log('Clicking generate...');
    const clickGen = await win.webContents.executeJavaScript(`(() => {
      const genBtn = document.querySelector('button.generate-icon-button');
      if (!genBtn) return { error: 'No genBtn' };
      genBtn.click();
      return { clicked: true };
    })()`);
    console.log('Click generate:', clickGen);

    // Track rendering progress
    console.log('Tracking video render...');
    for (let sec = 0; sec < 40; sec += 4) {
      await new Promise(r => setTimeout(r, 4000));
      const state = await win.webContents.executeJavaScript(`(() => {
        const text = document.body.innerText || '';
        const pct = text.match(/(\\d{1,3})%/g);
        const videos = Array.from(document.querySelectorAll('video, [data-media-id] video, .tile video')).map(v => v.src).filter(Boolean);
        return { pct, videos };
      })()`);
      console.log(`[+${sec+4}s] Status:`, state.pct || 'processing', 'Videos:', state.videos);
    }

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_veo3_video_render.png', img.toPNG());
    console.log('Screenshot saved to flow_veo3_video_render.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
