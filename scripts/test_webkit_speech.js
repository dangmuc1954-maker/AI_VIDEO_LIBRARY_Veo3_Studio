const { app, BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false });
  try {
    const supported = await win.webContents.executeJavaScript(`
      typeof window.webkitSpeechRecognition !== 'undefined' || typeof window.SpeechRecognition !== 'undefined'
    `);
    console.log('webkitSpeechRecognition supported in Electron?', supported);
  } catch (e) {
    console.log('Error:', e.message);
  }
  app.quit();
});
