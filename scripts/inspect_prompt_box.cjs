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

    const promptBox = await win.webContents.executeJavaScript(`(() => {
      const all = Array.from(document.querySelectorAll('*'));
      const matches = all.filter(el => {
        const ph = el.getAttribute && el.getAttribute('placeholder');
        const aria = el.getAttribute && el.getAttribute('aria-label');
        const text = el.innerText || '';
        return (ph && ph.includes('What do you want')) || (aria && aria.includes('What do you want')) || (text.includes('What do you want to create?'));
      });
      return matches.map(m => ({
        tag: m.tagName,
        className: m.className,
        placeholder: m.getAttribute && m.getAttribute('placeholder'),
        ariaLabel: m.getAttribute && m.getAttribute('aria-label'),
        contentEditable: m.isContentEditable,
        id: m.id,
        html: m.outerHTML.slice(0, 200)
      })).slice(0, 10);
    })()`);
    console.log('Prompt box candidates:', JSON.stringify(promptBox, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
