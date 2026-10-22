const { app, session, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, '../scratch/flow_test_log.txt');
fs.mkdirSync(path.dirname(logFile), { recursive: true });
fs.writeFileSync(logFile, '=== START TEST ===\n');

function log(...args) {
  const line = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
  fs.appendFileSync(logFile, line + '\n');
  console.log(line);
}

const roaming = process.env.APPDATA || 'C:/Users/admin/AppData/Roaming';
app.setPath('userData', path.join(roaming, 'AI VIDEO LIBRARY'));

app.whenReady().then(async () => {
  try {
    const accountId = 'veo3-1788597242484';
    const partition = `persist:aivideo:${accountId}`;
    const sess = session.fromPartition(partition);
    
    log('Session partition:', partition);
    const cookies = await sess.cookies.get({});
    log('Total cookies count:', cookies.length);
    
    // Group cookies by domain
    const byDomain = {};
    for (const c of cookies) {
      if (!byDomain[c.domain]) byDomain[c.domain] = [];
      byDomain[c.domain].push(`${c.name}=${c.value.slice(0, 15)}...`);
    }
    log('Cookies by domain:', byDomain);

    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        partition,
        contextIsolation: false
      }
    });

    log('\nLoading https://flow.google.com ...');
    await win.loadURL('https://flow.google.com/');
    // Wait 3 seconds for scripts to run
    await new Promise(r => setTimeout(r, 3000));

    const flowUrl = win.webContents.getURL();
    const flowTitle = win.webContents.getTitle();
    log('Current URL:', flowUrl);
    log('Current Title:', flowTitle);

    // Check in-page globals, WIZ_global_data, localStorage, etc.
    const inPageData = await win.webContents.executeJavaScript(`(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        storage[k] = localStorage.getItem(k)?.slice(0, 150);
      }
      return {
        url: window.location.href,
        hasWiz: typeof window.WIZ_global_data !== 'undefined',
        wiz: window.WIZ_global_data,
        storage,
        bodySnippet: document.body.innerText?.slice(0, 500)
      };
    })()`);
    log('In-page data:', inPageData);

    // Let's also check all network requests that flow makes
    // Especially: can we call FlowService or VideoFxService from inside this page?
    log('\nTesting in-page fetch to VideoFxService or batchexecute from inside flow.google.com...');
    const rpcTest = await win.webContents.executeJavaScript(`(async () => {
      try {
        // Try VideoFxService.GetCredits
        const res = await fetch('/_/VideoFxService/GetCredits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '[]'
        });
        const text = await res.text();
        return { status: res.status, text: text.slice(0, 500) };
      } catch (e) {
        return { error: e.message };
      }
    })()`);
    log('In-page /_/VideoFxService/GetCredits:', rpcTest);

    // Try batchexecute
    const batchTest = await win.webContents.executeJavaScript(`(async () => {
      try {
        const res = await fetch('/_/FlowUi/data/batchexecute', {
          method: 'POST'
        });
        return { status: res.status };
      } catch (e) {
        return { error: e.message };
      }
    })()`);
    log('In-page /_/FlowUi/data/batchexecute:', batchTest);

  } catch (err) {
    log('Error in test:', err.stack || err.message);
  } finally {
    log('=== END TEST ===');
    app.quit();
  }
});
