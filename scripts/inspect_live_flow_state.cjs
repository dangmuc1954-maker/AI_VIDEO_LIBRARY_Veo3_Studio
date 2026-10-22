const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const accId = 'veo3-1788597242484';
  const sess = session.fromPartition(`persist:aivideo:${accId}`);

  console.log('--- INSPECTING NETWORK REQUESTS ON FLOW.GOOGLE.COM ---');
  sess.webRequest.onBeforeSendHeaders((details, callback) => {
    const url = details.url;
    const auth = details.requestHeaders?.['Authorization'] || details.requestHeaders?.['authorization'];
    if (auth) {
      console.log(`[AUTH HEADER FOUND] ${url}`);
      console.log(`  Auth: ${auth.slice(0, 30)}... (length: ${auth.length})`);
    } else if (url.includes('aisandbox') || url.includes('flow') || url.includes('session') || url.includes('auth') || url.includes('token')) {
      console.log(`[REQUEST] ${details.method} ${url.slice(0, 100)}`);
    }
    callback({ requestHeaders: details.requestHeaders });
  });

  const win = new BrowserWindow({
    show: false,
    width: 1280,
    height: 800,
    webPreferences: {
      session: sess,
      contextIsolation: true,
      sandbox: false
    }
  });

  console.log('Loading https://flow.google.com/ ...');
  try {
    await win.loadURL('https://flow.google.com/');
    console.log('Initial load complete. URL:', win.webContents.getURL());

    // Wait 8 seconds for SPA to settle
    await new Promise(r => setTimeout(r, 8000));
    console.log('Settled URL:', win.webContents.getURL());

    // Capture screenshot
    const image = await win.webContents.capturePage();
    fs.writeFileSync('flow_page_screenshot.png', image.toPNG());
    console.log('Screenshot saved to flow_page_screenshot.png');

    // Inspect DOM / state
    const domState = await win.webContents.executeJavaScript(`
      (() => {
        return {
          title: document.title,
          url: window.location.href,
          text: document.body?.innerText?.slice(0, 500),
          localStorageKeys: Object.keys(localStorage),
          sessionStorageKeys: Object.keys(sessionStorage),
          hasWiz: Boolean(window.WIZ_global_data),
          wizKeys: window.WIZ_global_data ? Object.keys(window.WIZ_global_data) : [],
          buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText?.trim()).filter(Boolean).slice(0, 10)
        };
      })()
    `);
    console.log('DOM State:', JSON.stringify(domState, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
