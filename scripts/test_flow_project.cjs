const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const accId = 'veo3-1788597242484';
  const sess = session.fromPartition(`persist:aivideo:${accId}`);

  const networkLog = [];
  sess.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = details.url;
    const auth = details.requestHeaders?.['Authorization'] || details.requestHeaders?.['authorization'];
    if (url.includes('flow') || url.includes('batchexecute') || url.includes('aisandbox') || url.includes('video') || auth) {
      networkLog.push({
        method: details.method,
        url,
        hasAuth: Boolean(auth),
        authSnippet: auth ? auth.slice(0, 30) : null
      });
    }
    callback({ requestHeaders: details.requestHeaders });
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
    await win.loadURL('https://flow.google.com/');
    await new Promise(r => setTimeout(r, 6000));

    // Click on "New project" or find project buttons
    const clickResult = await win.webContents.executeJavaScript(`(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      const newProjBtn = buttons.find(b => (b.innerText || '').includes('New project'));
      if (newProjBtn) {
        newProjBtn.click();
        return { clicked: true, text: newProjBtn.innerText };
      }
      return { clicked: false, availableButtons: buttons.map(b => b.innerText?.trim()).filter(Boolean).slice(0, 15) };
    })()`);
    console.log('Click result:', clickResult);

    // Wait for project navigation
    await new Promise(r => setTimeout(r, 6000));
    console.log('Project page URL:', win.webContents.getURL());
    console.log('Project page Title:', win.webContents.getTitle());

    // Capture screenshot of inside the project
    const img = await win.webContents.capturePage();
    fs.writeFileSync('flow_inside_project.png', img.toPNG());
    console.log('Screenshot saved to flow_inside_project.png');

    fs.writeFileSync('flow_network_log.json', JSON.stringify(networkLog, null, 2));
    console.log('Network log saved with', networkLog.length, 'entries');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
