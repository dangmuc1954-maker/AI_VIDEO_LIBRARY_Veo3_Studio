const { app, BrowserWindow, session } = require('electron');
const path = require('path');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const accId = 'veo3-1789186636412';
  const sess = session.fromPartition(`persist:aivideo:${accId}`);
  const cookies = await sess.cookies.get({});
  console.log('Account 2 cookie count:', cookies.length);
  const googleCookies = cookies.filter(c => c.name.includes('PSID') || c.name.includes('SAPISID') || c.name.includes('SSID'));
  console.log('Account 2 has Google auth cookies:', googleCookies.length > 0);

  const win = new BrowserWindow({ show: false, width: 1400, height: 900, webPreferences: { session: sess, contextIsolation: false } });
  await win.loadURL('https://flow.google.com/');
  await new Promise(r => setTimeout(r, 4000));
  console.log('Account 2 URL:', win.webContents.getURL());
  console.log('Account 2 Title:', win.webContents.getTitle());
  win.destroy();
  app.quit();
});
