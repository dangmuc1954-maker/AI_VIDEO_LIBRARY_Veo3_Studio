const { app, BrowserWindow, session } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  const partition = "persist:aiforge:custom-e618febb-6065-4662-a413-96d1aaa448bf-1791566975307";
  const ses = session.fromPartition(partition);
  
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      partition: partition,
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  console.log('Loading https://muse.ai/ with user partition...');
  await win.loadURL('https://muse.ai/');
  await new Promise(r => setTimeout(r, 4000));

  const domInfo = await win.webContents.executeJavaScript(`
    (() => {
      const inputs = [];
      document.querySelectorAll('input, textarea, div[contenteditable="true"], [role="textbox"]').forEach((el, i) => {
        inputs.push({
          index: i,
          tag: el.tagName,
          id: el.id,
          className: el.className,
          placeholder: el.placeholder || el.getAttribute('placeholder') || el.getAttribute('data-placeholder'),
          role: el.getAttribute('role'),
          contentEditable: el.isContentEditable,
          ariaLabel: el.getAttribute('aria-label'),
          visible: el.offsetWidth > 0 && el.offsetHeight > 0,
          rect: el.getBoundingClientRect()
        });
      });

      const buttons = [];
      document.querySelectorAll('button, [role="button"]').forEach((el, i) => {
        if (el.offsetWidth > 0) {
          buttons.push({
            index: i,
            text: el.innerText?.slice(0, 30),
            ariaLabel: el.getAttribute('aria-label'),
            className: el.className?.slice(0, 40)
          });
        }
      });

      return {
        title: document.title,
        url: window.location.href,
        inputs: inputs,
        buttonsCount: buttons.length,
        buttonsSample: buttons.slice(0, 15)
      };
    })()
  `);

  console.log('DOM Info:', JSON.stringify(domInfo, null, 2));
  app.quit();
});
