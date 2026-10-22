const { app, BrowserWindow, session } = require('electron');
const path = require('path');

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

    const details = await win.webContents.executeJavaScript(`(() => {
      const box = document.querySelector('flow-base-prompt-box');
      if (!box) return 'flow-base-prompt-box not found';
      return {
        inputs: Array.from(box.querySelectorAll('input, textarea, [contenteditable], div[role="textbox"]')).map(i => ({
          tag: i.tagName,
          contentEditable: i.isContentEditable,
          className: i.className,
          placeholder: i.placeholder,
          ariaLabel: i.getAttribute('aria-label'),
          id: i.id,
          outerHTML: i.outerHTML.slice(0, 300)
        })),
        buttons: Array.from(box.querySelectorAll('button')).map(b => ({
          text: b.innerText?.trim(),
          aria: b.getAttribute('aria-label'),
          classes: b.className,
          disabled: b.disabled
        }))
      };
    })()`);
    console.log('Box details:', JSON.stringify(details, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
