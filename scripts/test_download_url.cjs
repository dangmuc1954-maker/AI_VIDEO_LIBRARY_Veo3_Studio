const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const sess = session.fromPartition('persist:aivideo:veo3-1788597242484');

  const downloads = [];
  sess.on('will-download', (event, item, webContents) => {
    downloads.push({
      url: item.getURL(),
      filename: item.getFilename(),
      mimeType: item.getMimeType(),
      totalBytes: item.getTotalBytes()
    });
    console.log('[WILL DOWNLOAD]:', item.getURL(), item.getFilename());
    // Cancel download for now or let it download
    item.cancel();
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

    // Click on the video tile (Eagle)
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
    const clickDl = await win.webContents.executeJavaScript(`(() => {
      const dlBtn = document.querySelector('button[aria-label="Download media"], button[aria-label="Download"]');
      if (dlBtn) {
        dlBtn.click();
        return { clicked: true, text: dlBtn.innerText };
      }
      return { clicked: false };
    })()`);
    console.log('Click dl:', clickDl);
    await new Promise(r => setTimeout(r, 4000));

    console.log('Intercepted downloads:', JSON.stringify(downloads, null, 2));

  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
