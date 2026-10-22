// Test if webkitSpeechRecognition exists and functions in Electron
const { app, BrowserWindow } = require('electron');

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false } });
  
  const result = await win.webContents.executeJavaScript(`
    (() => {
      const hasSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      return { hasSpeech, speechClass: window.webkitSpeechRecognition ? 'webkitSpeechRecognition' : (window.SpeechRecognition ? 'SpeechRecognition' : null) };
    })()
  `);
  
  console.log('SpeechRecognition in Electron:', result);
  app.quit();
});
