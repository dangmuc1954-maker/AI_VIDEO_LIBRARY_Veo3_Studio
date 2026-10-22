const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const sess = session.fromPartition('persist:aivideo:veo3-1788597242484');

  const netLog = [];
  sess.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    if (url.includes('batchexecute') || url.includes('StreamGenerateContent') || url.includes('video') || url.includes('aisandbox') || url.includes('FlowService')) {
      let body = null;
      if (details.uploadData && details.uploadData.length > 0) {
        try {
          body = details.uploadData[0].bytes ? details.uploadData[0].bytes.toString('utf8') : null;
        } catch(e) {}
      }
      netLog.push({ method: details.method, url, body: body ? body.slice(0, 500) : null });
      console.log(`[NET REQ] ${details.method} ${url.slice(0, 80)}`);
      if (body) console.log(`  Body: ${body.slice(0, 200)}...`);
    }
    callback({});
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
    await win.loadURL('https://flow.google.com/project/2494967d-5f94-4cd0-9fde-49e8f0dc3d87');
    await new Promise(r => setTimeout(r, 6000));

    // Type into ProseMirror
    const inputResult = await win.webContents.executeJavaScript(`(() => {
      const pm = document.querySelector('flow-base-prompt-box div.ProseMirror');
      if (!pm) return { error: 'ProseMirror not found' };

      pm.focus();
      const ok = document.execCommand('insertText', false, 'A cute golden retriever puppy running in the park at sunset');
      
      const genBtn = document.querySelector('button.generate-icon-button');
      return {
        execCommandSuccess: ok,
        textInside: pm.innerText,
        genBtnDisabled: genBtn ? genBtn.disabled : null,
        genBtnClasses: genBtn ? genBtn.className : null
      };
    })()`);
    console.log('Input result:', inputResult);

    await new Promise(r => setTimeout(r, 1000));

    // Capture screenshot after typing
    const img1 = await win.webContents.capturePage();
    fs.writeFileSync('flow_prosemirror_typed.png', img1.toPNG());

    // Click generate button!
    const clickResult = await win.webContents.executeJavaScript(`(() => {
      const genBtn = document.querySelector('button.generate-icon-button');
      if (!genBtn) return { error: 'No genBtn' };
      if (genBtn.disabled) return { error: 'Gen button is disabled!' };

      genBtn.click();
      return { success: true, text: genBtn.innerText };
    })()`);
    console.log('Click result:', clickResult);

    // Wait 12 seconds to observe the generation process and network calls
    await new Promise(r => setTimeout(r, 12000));

    const img2 = await win.webContents.capturePage();
    fs.writeFileSync('flow_after_generation.png', img2.toPNG());

    fs.writeFileSync('flow_gen_net_log.json', JSON.stringify(netLog, null, 2));
    console.log('Total gen network requests:', netLog.length);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
