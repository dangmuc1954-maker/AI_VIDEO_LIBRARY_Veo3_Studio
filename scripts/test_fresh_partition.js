const { app, session, WebContentsView } = require('electron');

app.whenReady().then(async () => {
  console.log('=== TESTING COOKIE CLEARING FOR ANONYMOUS LIMIT ===');
  
  // Use unique partition or clear cookies
  const partName = 'in-memory-test-' + Date.now();
  const ses = session.fromPartition(partName);
  
  const view = new WebContentsView({
    webPreferences: {
      partition: partName,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      offscreen: true
    }
  });

  const Gu = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__onHcaptchaLoaded";
  const qu = "https://example.com";
  const siteKey = "8e58fe8c-1a48-4f94-88ae-8e90b586a192";

  await view.webContents.loadURL(qu);
  await view.webContents.executeJavaScript(`
    window.__hcReady = false;
    window.__hcToken = null;
    window.__widgetId = null;

    window.__onHcaptchaLoaded = () => {
      const box = document.createElement('div');
      box.id = 'hc-box';
      document.body.appendChild(box);
      window.__widgetId = window.hcaptcha.render('hc-box', {
        sitekey: ${JSON.stringify(siteKey)},
        size: 'invisible',
        callback: token => { window.__hcToken = token; }
      });
      window.__hcReady = true;
    };

    const script = document.createElement('script');
    script.src = ${JSON.stringify(Gu)};
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  `);

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    if (await view.webContents.executeJavaScript('window.__hcReady === true')) break;
  }

  // Get token
  await view.webContents.executeJavaScript(`
    window.__hcToken = null;
    window.hcaptcha.reset(window.__widgetId);
    window.hcaptcha.execute(window.__widgetId);
  `);
  let tok = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    tok = await view.webContents.executeJavaScript('window.__hcToken');
    if (tok) break;
  }

  console.log('Got fresh token from clean session:', !!tok);

  if (tok) {
    // Test Bella
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({
        text: 'Xin chào, đây là giọng đọc thử nghiệm.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.85 },
        hcaptcha_token: tok
      })
    });
    console.log('Bella status with fresh session:', res.status);
    if (res.ok) {
      console.log('✅ BELLA SUCCESS!');
    } else {
      console.log('Bella response:', await res.text());
    }
  }

  app.quit();
});
