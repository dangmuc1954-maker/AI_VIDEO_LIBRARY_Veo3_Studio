const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA'));

app.whenReady().then(async () => {
  const accId = 'veo3-1788597242484';
  const sess = session.fromPartition(`persist:aivideo:${accId}`);

  const genRequests = [];
  sess.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    if (url.includes('batchexecute') || url.includes('StreamGenerateContent') || url.includes('video') || url.includes('aisandbox')) {
      let body = null;
      if (details.uploadData && details.uploadData.length > 0) {
        try {
          body = details.uploadData[0].bytes ? details.uploadData[0].bytes.toString('utf8') : null;
        } catch(e) {}
      }
      genRequests.push({
        method: details.method,
        url,
        body: body ? body.slice(0, 1000) : null
      });
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
    const projUrl = 'https://flow.google.com/project/2494967d-5f94-4cd0-9fde-49e8f0dc3d87';
    console.log('Navigating directly to project:', projUrl);
    await win.loadURL(projUrl);
    await new Promise(r => setTimeout(r, 6000));

    // Type prompt into input box
    const typeResult = await win.webContents.executeJavaScript(`(() => {
      // Find input / textarea / contenteditable
      const input = document.querySelector('textarea, input[type="text"], [contenteditable="true"]');
      if (!input) return { error: 'No input element found' };
      
      input.focus();
      if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
        input.value = 'A cinematic drone shot of a futuristic neon city at sunset';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        input.innerText = 'A cinematic drone shot of a futuristic neon city at sunset';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      return {
        found: true,
        tag: input.tagName,
        val: input.value || input.innerText
      };
    })()`);
    console.log('Type result:', typeResult);

    await new Promise(r => setTimeout(r, 1000));

    // Find submit button and inspect its attributes
    const submitInspect = await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.map(b => ({
        tag: b.tagName,
        ariaLabel: b.getAttribute('aria-label'),
        text: b.innerText?.trim(),
        disabled: b.disabled,
        classes: b.className
      }));
    })()`);
    console.log('Available buttons:', JSON.stringify(submitInspect.slice(-10), null, 2));

    // Let's capture screenshot with typed prompt
    const img1 = await win.webContents.capturePage();
    fs.writeFileSync('flow_typed_prompt.png', img1.toPNG());
    console.log('Screenshot saved to flow_typed_prompt.png');

    // Click submit button (the arrow right button)
    const clickSubmit = await win.webContents.executeJavaScript(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      // Find button containing arrow icon or last button in prompt box
      const arrowBtn = btns.find(b => b.querySelector('mat-icon') || b.getAttribute('aria-label')?.includes('submit') || b.getAttribute('aria-label')?.includes('create') || b.getAttribute('aria-label')?.includes('send')) || btns[btns.length - 1];
      if (arrowBtn && !arrowBtn.disabled) {
        arrowBtn.click();
        return { clicked: true, text: arrowBtn.innerText, aria: arrowBtn.getAttribute('aria-label') };
      }
      return { clicked: false, btn: arrowBtn ? { text: arrowBtn.innerText, disabled: arrowBtn.disabled } : null };
    })()`);
    console.log('Click submit result:', clickSubmit);

    // Wait 10 seconds to see generation network calls
    await new Promise(r => setTimeout(r, 10000));

    const img2 = await win.webContents.capturePage();
    fs.writeFileSync('flow_after_submit.png', img2.toPNG());
    console.log('Screenshot saved to flow_after_submit.png');

    fs.writeFileSync('flow_submit_requests.json', JSON.stringify(genRequests, null, 2));
    console.log('Total intercepted requests:', genRequests.length);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    win.destroy();
    app.quit();
  }
});
