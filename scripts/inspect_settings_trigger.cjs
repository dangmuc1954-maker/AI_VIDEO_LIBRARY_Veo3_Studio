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

    // Click settings trigger button
    const clickResult = await win.webContents.executeJavaScript(`(() => {
      const btn = document.querySelector('button.settings-trigger-button');
      if (!btn) return { error: 'settings-trigger-button not found' };
      btn.click();
      return { clicked: true, text: btn.innerText };
    })()`);
    console.log('Click settings result:', clickResult);

    await new Promise(r => setTimeout(r, 1500));

    // Inspect menu / dialog that opened
    const menuDetails = await win.webContents.executeJavaScript(`(() => {
      const overlays = Array.from(document.querySelectorAll('.cdk-overlay-pane, [role="menu"], [role="dialog"], mat-dialog-container'));
      return {
        overlayCount: overlays.length,
        items: overlays.map(o => ({
          tag: o.tagName,
          classes: o.className,
          buttons: Array.from(o.querySelectorAll('button, [role="menuitem"], [role="option"], mat-option')).map(b => ({
            text: b.innerText?.trim(),
            aria: b.getAttribute('aria-label')
          }))
        }))
      };
    })()`);
    console.log('Menu details:', JSON.stringify(menuDetails, null, 2));

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_model_menu.png', img.toPNG());
    console.log('Screenshot saved to flow_model_menu.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
