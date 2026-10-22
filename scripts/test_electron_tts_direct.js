const { app, WebContentsView } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  console.log('=== TEST ELECTRON ELEVENLABS CAPTCHA & TTS ===');
  
  // Test Ju directly
  const Gu = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__onHcaptchaLoaded";
  const qu = "https://example.com";
  const siteKey = "8e58fe8c-1a48-4f94-88ae-8e90b586a192";

  console.log('[*] Creating WebContentsView for captcha...');
  const view = new WebContentsView({
    webPreferences: {
      partition: "persist:elevenlabs-hcaptcha",
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      offscreen: true
    }
  });

  try {
    console.log('[*] Loading URL:', qu);
    await view.webContents.loadURL(qu);
    console.log('[*] Injected page title:', await view.webContents.executeJavaScript('document.title'));

    console.log('[*] Injecting hCaptcha script...');
    await view.webContents.executeJavaScript(`
      window.__hcReady = false;
      window.__hcToken = null;
      window.__hcError = null;
      window.__widgetId = null;

      window.__onHcaptchaLoaded = () => {
        console.log('onHcaptchaLoaded called!');
        const existing = document.getElementById('hc-box');
        if (existing) existing.remove();

        const box = document.createElement('div');
        box.id = 'hc-box';
        document.body.appendChild(box);

        try {
          window.__widgetId = window.hcaptcha.render('hc-box', {
            sitekey: ${JSON.stringify(siteKey)},
            size: 'invisible',
            callback: token => {
              window.__hcToken = token;
            },
            'expired-callback': () => {
              window.__hcToken = null;
              window.__hcError = 'expired';
            },
            'chalexpired-callback': () => {
              window.__hcToken = null;
              window.__hcError = 'challenge expired';
            },
            'error-callback': err => {
              window.__hcError = String(err);
            },
          });
          window.__hcReady = true;
        } catch (e) {
          window.__hcError = 'render_err: ' + e.message;
        }
      };

      const script = document.createElement('script');
      script.src = ${JSON.stringify(Gu)};
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    `);

    // Poll for ready
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      const st = await view.webContents.executeJavaScript('({ ready: window.__hcReady, widgetId: window.__widgetId, error: window.__hcError })');
      console.log(`[Poll ${i}]`, st);
      if (st.ready) {
        ready = true;
        break;
      }
    }

    if (ready) {
      console.log('[*] Executing widget...');
      await view.webContents.executeJavaScript(`
        window.__hcToken = null;
        window.__hcError = null;
        window.hcaptcha.reset(window.__widgetId);
        window.hcaptcha.execute(window.__widgetId);
      `);

      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const st = await view.webContents.executeJavaScript('({ token: window.__hcToken, error: window.__hcError })');
        console.log(`[Token Poll ${i}]`, st);
        if (st.token) {
          console.log('🎉 GOT HCAPTCHA TOKEN! Length:', st.token.length);
          break;
        }
      }
    }
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    app.quit();
  }
});
