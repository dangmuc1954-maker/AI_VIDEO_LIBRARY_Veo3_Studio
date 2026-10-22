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
    
    // Poll until video finishes
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 4000));
      const state = await win.webContents.executeJavaScript(`(() => {
        const text = document.body.innerText || '';
        const pct = text.match(/(\\d{1,3})%/g);
        const videos = Array.from(document.querySelectorAll('video, [data-media-id] video, .tile video, flow-media-tile video'));
        const sources = videos.map(v => v.src || v.querySelector('source')?.src).filter(Boolean);
        
        // Also check if clicking on the tile opens a video player or detail modal
        const tiles = Array.from(document.querySelectorAll('flow-media-tile, .media-item, [data-media-id]'));
        return {
          pct,
          videoSources: sources,
          tileCount: tiles.length
        };
      })()`);
      console.log(`[Wait ${i+1}] State:`, state);
      if (!state.pct || state.pct.length === 0) {
        console.log('No percentages active, checking tiles...');
        break;
      }
    }

    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_video_completed_screen.png', img.toPNG());
    console.log('Saved flow_video_completed_screen.png');

    // Click the first tile (the video) to inspect player/video details
    const clickTile = await win.webContents.executeJavaScript(`(() => {
      const tile = document.querySelector('flow-media-tile, [data-media-id], .media-tile');
      if (tile) {
        tile.click();
        return { clicked: true, tag: tile.tagName };
      }
      return { clicked: false };
    })()`);
    console.log('Clicked tile:', clickTile);
    await new Promise(r => setTimeout(r, 3000));

    const modalDetails = await win.webContents.executeJavaScript(`(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return {
        videos: videos.map(v => ({
          src: v.src,
          currentSrc: v.currentSrc,
          duration: v.duration
        })),
        downloadButtons: Array.from(document.querySelectorAll('button, a')).filter(b => (b.innerText || '').includes('Download') || (b.getAttribute('aria-label') || '').includes('Download')).map(b => ({
          text: b.innerText,
          href: b.href
        }))
      };
    })()`);
    console.log('Modal details:', JSON.stringify(modalDetails, null, 2));

    const img2 = await win.webContents.capturePage();
    fs.writeFileSync('flow_video_modal.png', img2.toPNG());
    console.log('Saved flow_video_modal.png');

  } catch (err) {
    console.error('Error in test:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
