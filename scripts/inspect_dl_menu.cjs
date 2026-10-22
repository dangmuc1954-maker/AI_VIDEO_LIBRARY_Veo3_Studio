const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const sess = session.fromPartition('persist:aivideo:veo3-1788597242484');

  const dlNetLog = [];
  sess.webRequest.onBeforeRequest((details, callback) => {
    if (details.url.includes('download') || details.url.includes('video') || details.url.includes('batchexecute') || details.url.includes('.mp4')) {
      dlNetLog.push({ method: details.method, url: details.url });
      console.log('[NET]', details.method, details.url.slice(0, 100));
    }
    callback({});
  });

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
    await win.loadURL(projUrl);
    await new Promise(r => setTimeout(r, 6000));

    // Click eagle
    await win.webContents.executeJavaScript(`(() => {
      const tiles = Array.from(document.querySelectorAll('div')).filter(d => (d.innerText || '').includes('Eagle soaring'));
      let target = tiles[tiles.length - 1];
      while (target && target.parentElement && target.tagName !== 'FLOW-PROJECT-PAGE') {
        if (target.className && (target.className.includes('tile') || target.className.includes('item') || target.className.includes('card') || target.tagName.includes('TILE'))) break;
        target = target.parentElement;
      }
      if (target) target.click();
    })()`);
    await new Promise(r => setTimeout(r, 3000));

    // Click download button
    await win.webContents.executeJavaScript(`(() => {
      const dlBtn = document.querySelector('button[aria-label="Download media"], button[aria-label="Download"]');
      if (dlBtn) dlBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 2000));

    // Check if a download menu opened
    const overlayInfo = await win.webContents.executeJavaScript(`(() => {
      const overlays = Array.from(document.querySelectorAll('.cdk-overlay-pane, [role="menu"], [role="dialog"]'));
      return overlays.map(o => ({
        tag: o.tagName,
        classes: o.className,
        text: o.innerText?.trim(),
        buttons: Array.from(o.querySelectorAll('button, a')).map(b => ({
          text: b.innerText?.trim(),
          href: b.href
        }))
      }));
    })()`);
    console.log('Overlays after clicking download:', JSON.stringify(overlayInfo, null, 2));

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_after_dl_click.png', img.toPNG());
    console.log('Saved flow_after_dl_click.png');

    console.log('Net requests during download:', JSON.stringify(dlNetLog, null, 2));

  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
