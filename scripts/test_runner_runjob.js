const { app, WebContentsView } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  console.log('=== TESTING ELEVENLABS MODELS AND LANGUAGE_CODE ===');

  try {
    const Gu = "https://js.hcaptcha.com/1/api.js?render=explicit&onload=__onHcaptchaLoaded";
    const qu = "https://example.com";
    const siteKey = "8e58fe8c-1a48-4f94-88ae-8e90b586a192";

    const view = new WebContentsView({
      webPreferences: {
        partition: "persist:elevenlabs-hcaptcha",
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        offscreen: true
      }
    });

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

    async function getToken() {
      await view.webContents.executeJavaScript(`
        window.__hcToken = null;
        window.hcaptcha.reset(window.__widgetId);
        window.hcaptcha.execute(window.__widgetId);
      `);
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const token = await view.webContents.executeJavaScript('window.__hcToken');
        if (token) return token;
      }
      return null;
    }

    const voiceId = 'aN7cv9yXNrfIR87bDmyD'; // Ninh Don
    const text = 'Xin chào tất cả các bạn, chào mừng các bạn đã đến với buổi đánh giá sản phẩm ba lô ngày hôm nay.';

    const configs = [
      { name: 'Multilingual v2 WITHOUT language_code', model: 'eleven_multilingual_v2', lang: undefined },
      { name: 'Turbo v2.5 WITH language_code: vi', model: 'eleven_turbo_v2_5', lang: 'vi' },
      { name: 'Turbo v2.5 WITHOUT language_code', model: 'eleven_turbo_v2_5', lang: undefined },
      { name: 'Flash v2.5 WITH language_code: vi', model: 'eleven_flash_v2_5', lang: 'vi' },
      { name: 'Multilingual v1 WITH language_code: vi', model: 'eleven_multilingual_v1', lang: 'vi' }
    ];

    for (const cfg of configs) {
      console.log(`\n[*] Testing: ${cfg.name}`);
      const tok = await getToken();
      if (!tok) {
        console.log('Failed to get token for', cfg.name);
        continue;
      }

      const body = {
        text: text,
        model_id: cfg.model,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85
        },
        hcaptcha_token: tok
      };
      if (cfg.lang) body.language_code = cfg.lang;

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps/anonymous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
        body: JSON.stringify(body)
      });

      console.log(`Status: ${res.status} ${res.statusText}`);
      const resText = await res.text();
      if (res.ok) {
        console.log(`✅ SUCCESS! Response length: ${resText.length}`);
        // Check if there are audio chunks
        const chunks = resText.split('\n').filter(l => l.includes('audio_base64'));
        console.log(`   Audio chunks count: ${chunks.length}`);
      } else {
        console.log(`❌ FAILED: ${resText.slice(0, 300)}`);
      }
    }

  } catch (err) {
    console.error('Fatal:', err);
  } finally {
    app.quit();
  }
});
