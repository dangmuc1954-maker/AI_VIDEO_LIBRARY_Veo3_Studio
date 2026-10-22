const { app, session } = require('electron');
const path = require('path');
const fs = require('fs');

const userDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
app.setPath('userData', userDataDir);

app.whenReady().then(async () => {
  try {
    const result = { accounts: [] };
    const accounts = ['veo3-1788597242484', 'veo3-1789186636412'];
    for (const acc of accounts) {
      const s = session.fromPartition('persist:aivideo:' + acc);
      const cookies = await s.cookies.get({});
      result.accounts.push({
        accountId: acc,
        cookieCount: cookies.length,
        domains: Array.from(new Set(cookies.map(c => c.domain))),
        hasGoogleAuth: cookies.some(c => c.name.includes('PSID') || c.name.includes('SAPISID') || c.name.includes('SSID')),
        cookieNames: cookies.map(c => c.name)
      });
    }
    fs.writeFileSync(path.join(process.env.TEMP, 'electron_diag.json'), JSON.stringify(result, null, 2));
  } catch (err) {
    fs.writeFileSync(path.join(process.env.TEMP, 'electron_diag.json'), JSON.stringify({ error: err.message, stack: err.stack }));
  } finally {
    app.quit();
  }
});
