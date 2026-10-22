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
    await win.loadURL(projUrl);
    await new Promise(r => setTimeout(r, 6000));

    // Click on the video tile (Eagle)
    const clickEagle = await win.webContents.executeJavaScript(`(() => {
      const tiles = Array.from(document.querySelectorAll('div')).filter(d => (d.innerText || '').includes('Eagle soaring'));
      // Find the outermost clickable tile container
      let target = tiles[tiles.length - 1];
      while (target && target.parentElement && target.tagName !== 'FLOW-PROJECT-PAGE') {
        if (target.className && (target.className.includes('tile') || target.className.includes('item') || target.className.includes('card') || target.tagName.includes('TILE'))) {
          break;
        }
        target = target.parentElement;
      }
      if (target) {
        target.click();
        return { clicked: true, tag: target.tagName, className: target.className };
      }
      return { clicked: false };
    })()`);
    console.log('Click eagle:', clickEagle);
    await new Promise(r => setTimeout(r, 3000));

    // Inspect open modal
    const videoData = await win.webContents.executeJavaScript(`(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      const buttons = Array.from(document.querySelectorAll('button, a')).map(b => ({
        tag: b.tagName,
        text: b.innerText?.trim(),
        aria: b.getAttribute('aria-label'),
        href: b.href
      }));
      return {
        videos: videos.map(v => ({
          src: v.src,
          currentSrc: v.currentSrc,
          duration: v.duration,
          videoWidth: v.videoWidth,
          videoHeight: v.videoHeight
        })),
        buttons: buttons.filter(b => b.text || b.aria)
      };
    })()`);
    console.log('Video modal data:', JSON.stringify(videoData, null, 2));

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_eagle_video_modal.png', img.toPNG());
    console.log('Saved flow_eagle_video_modal.png');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
