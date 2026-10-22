const { app, session, WebContentsView } = require('electron');

app.whenReady().then(async () => {
  console.log('=== TESTING REFERER & ORIGIN FOR ELEVENLABS ANONYMOUS ===');
  
  const view = new WebContentsView({
    webPreferences: {
      partition: 'persist:elevenlabs-hcaptcha',
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

  console.log('Got token:', !!tok);

  if (tok) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/aN7cv9yXNrfIR87bDmyD/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Origin': 'https://elevenlabs.io',
        'Referer': 'https://elevenlabs.io/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        text: 'Xin chào, đây là giọng đọc nữ từ ElevenLabs.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.85 },
        hcaptcha_token: tok
      })
    });
    console.log('Status with Origin/Referer:', res.status);
    const txt = await res.text();
    console.log('Response:', txt.slice(0, 300));
  }

  app.quit();
});
