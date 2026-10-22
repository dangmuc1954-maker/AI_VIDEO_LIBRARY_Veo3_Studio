const { app, BrowserWindow, session } = require('electron');
const path = require('path');

// Set userData to AI_VIDEO_LIBRARY_DATA so it uses the REAL logged in session!
const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
app.setPath('userData', appDataDir);

app.whenReady().then(async () => {
  const partition = "persist:aiforge:custom-e618febb-6065-4662-a413-96d1aaa448bf-1791566975307";
  const ses = session.fromPartition(partition);
  
  const cookies = await ses.cookies.get({});
  console.log('Total cookies in partition:', cookies.length);
  console.log('Domains:', Array.from(new Set(cookies.map(c => c.domain))));

  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      partition: partition,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  console.log('Loading https://muse.ai/ with REAL user session...');
  await win.loadURL('https://muse.ai/');
  await new Promise(r => setTimeout(r, 5000));

  const pageInfo = await win.webContents.executeJavaScript(`
    (() => {
      const inputs = [];
      document.querySelectorAll('input, textarea, div[contenteditable="true"], [role="textbox"]').forEach((el, i) => {
        inputs.push({
          index: i,
          tag: el.tagName,
          id: el.id,
          placeholder: el.placeholder || el.getAttribute('placeholder') || el.getAttribute('data-placeholder'),
          contentEditable: el.isContentEditable,
          ariaLabel: el.getAttribute('aria-label'),
          visible: el.offsetWidth > 0 && el.offsetHeight > 0,
          rect: { width: el.offsetWidth, height: el.offsetHeight }
        });
      });

      return {
        title: document.title,
        url: window.location.href,
        inputs: inputs
      };
    })()
  `);

  console.log('REAL Page Info:', JSON.stringify(pageInfo, null, 2));
  app.quit();
});
