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
    const projUrl = 'https://flow.google.com/project/2494967d-5f94-4cd0-9fde-49e8f0dc3d87';
    console.log('Loading project URL:', projUrl);
    await win.loadURL(projUrl);
    await new Promise(r => setTimeout(r, 6000));

    // Check media tiles in the project
    const mediaDetails = await win.webContents.executeJavaScript(`(() => {
      const tiles = Array.from(document.querySelectorAll('flow-media-tile, [data-media-id], img, video'));
      return {
        count: tiles.length,
        items: tiles.map(t => ({
          tag: t.tagName,
          src: t.src || t.getAttribute('src'),
          text: t.innerText?.slice(0, 100),
          classes: t.className
        })).slice(0, 15)
      };
    })()`);
    console.log('Media details:', JSON.stringify(mediaDetails, null, 2));

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_completed_render.png', img.toPNG());
    console.log('Screenshot saved to flow_completed_render.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
