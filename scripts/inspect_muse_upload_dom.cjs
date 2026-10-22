const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
app.setPath('userData', appDataDir);

app.whenReady().then(async () => {
  // Use real partition
  const partition = "persist:aiforge:muse-1791770852638";
  const ses = session.fromPartition(partition);

  const win = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      partition: partition,
      nodeIntegration: false,
      contextIsolation: false
    }
  });

  console.log('Loading https://muse.ai/thread/new...');
  await win.loadURL('https://muse.ai/thread/new');
  await new Promise(r => setTimeout(r, 4000));

  const domReport = await win.webContents.executeJavaScript(`
    (async () => {
      const report = {};
      report.url = window.location.href;
      report.title = document.title;

      // 1. Check all inputs
      report.allInputs = Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        name: i.name,
        id: i.id,
        className: i.className,
        accept: i.accept,
        visible: i.offsetWidth > 0,
        rect: i.getBoundingClientRect()
      }));

      // 2. Check all buttons around bottom/chat
      report.buttons = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
        tag: b.tagName,
        text: (b.innerText || '').slice(0, 30),
        ariaLabel: b.getAttribute('aria-label'),
        title: b.title,
        className: b.className,
        hasSvg: !!b.querySelector('svg'),
        rect: b.getBoundingClientRect()
      })).filter(b => b.rect.bottom > 200);

      // 3. Check what happens if we click '+ Nhắn tin'
      const pills = Array.from(document.querySelectorAll('button, [role="button"], div, span, a')).filter(b => {
        if (b.offsetWidth <= 0 || b.offsetHeight <= 0) return false;
        const t = (b.innerText || '').toLowerCase().trim();
        return t === '+ nhắn tin' || t === 'nhắn tin' || t === '+ message' || t === 'message';
      });
      report.foundPills = pills.length;
      if (pills.length > 0) {
        pills[0].click();
        await new Promise(r => setTimeout(r, 1000));

        // Re-check inputs and buttons after click
        report.inputsAfterClick = Array.from(document.querySelectorAll('input')).map(i => ({
          type: i.type,
          name: i.name,
          id: i.id,
          accept: i.accept,
          visible: i.offsetWidth > 0,
          rect: i.getBoundingClientRect()
        }));

        report.textareasAfterClick = Array.from(document.querySelectorAll('textarea, div[contenteditable="true"], [role="textbox"]')).map(t => ({
          tag: t.tagName,
          isContentEditable: t.isContentEditable,
          placeholder: t.placeholder || t.getAttribute('placeholder'),
          visible: t.offsetWidth > 0,
          rect: t.getBoundingClientRect()
        }));

        report.buttonsAfterClick = Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
          text: (b.innerText || '').slice(0, 30),
          ariaLabel: b.getAttribute('aria-label'),
          title: b.title,
          hasSvg: !!b.querySelector('svg'),
          rect: b.getBoundingClientRect()
        })).filter(b => b.rect.top > 300);
      }

      return report;
    })()
  `);

  console.log('--- DOM REPORT ---');
  console.log(JSON.stringify(domReport, null, 2));

  fs.writeFileSync('scratch/muse_dom_report.json', JSON.stringify(domReport, null, 2));
  app.quit();
});
