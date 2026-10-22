const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const sess = session.fromPartition('persist:aivideo:veo3-1788597242484');

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
    await win.loadURL('https://flow.google.com/project/2494967d-5f94-4cd0-9fde-49e8f0dc3d87');
    await new Promise(r => setTimeout(r, 6000));

    // Open settings menu
    await win.webContents.executeJavaScript(`(() => {
      const btn = document.querySelector('button.settings-trigger-button');
      if (btn) btn.click();
    })()`);
    await new Promise(r => setTimeout(r, 1000));

    // Click "Video" tab
    const clickVideoResult = await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('.cdk-overlay-pane button, [role="tab"]'));
      const videoBtn = btns.find(b => (b.innerText || '').includes('Video'));
      if (videoBtn) {
        videoBtn.click();
        return { clicked: true, text: videoBtn.innerText };
      }
      return { clicked: false, buttons: btns.map(b => b.innerText?.trim()) };
    })()`);
    console.log('Click video result:', clickVideoResult);

    await new Promise(r => setTimeout(r, 1500));

    // Click model dropdown to inspect available video models
    const clickDropdownResult = await win.webContents.executeJavaScript(`(() => {
      const dd = document.querySelector('.cdk-overlay-pane button[aria-label="Select model family"], .cdk-overlay-pane [aria-label*="model"]');
      if (dd) {
        dd.click();
        return { clicked: true, text: dd.innerText };
      }
      return { clicked: false };
    })()`);
    console.log('Click model dropdown result:', clickDropdownResult);

    await new Promise(r => setTimeout(r, 1500));

    // Inspect dropdown options
    const modelOptions = await win.webContents.executeJavaScript(`(() => {
      const opts = Array.from(document.querySelectorAll('[role="listbox"] mat-option, [role="menu"] [role="menuitem"], .cdk-overlay-pane button'));
      return opts.map(o => o.innerText?.trim()).filter(Boolean);
    })()`);
    console.log('Model options:', modelOptions);

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_video_options.png', img.toPNG());
    console.log('Screenshot saved to flow_video_options.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
