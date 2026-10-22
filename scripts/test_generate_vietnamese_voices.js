const { app, WebContentsView } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  console.log('=== TEST ELEVENLABS VIETNAMESE VOICES GENERATION ===');
  
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

  const voices = [
    { id: 'aN7cv9yXNrfIR87bDmyD', name: 'Ninh Don (Nam)' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Nu)' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Nu)' }
  ];

  const text = 'Xin chào các bạn, hôm nay mình sẽ giới thiệu và đánh giá chiếc ba lô thời trang cực kỳ tiện lợi này nhé.';

  for (const v of voices) {
    console.log(`\n[*] Generating voice: ${v.name} (${v.id})...`);
    const tok = await getToken();
    if (!tok) {
      console.log('Failed to get captcha token');
      continue;
    }

    // Try eleven_multilingual_v2
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.id}/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.85,
          style: 0.15,
          use_speaker_boost: true
        },
        hcaptcha_token: tok
      })
    });

    console.log(`Status for ${v.name}:`, res.status);
    if (res.ok) {
      const txt = await res.text();
      const lines = txt.split('\n').filter(l => l.trim().length > 0);
      const audioChunks = [];
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.audio_base64) {
            audioChunks.push(Buffer.from(parsed.audio_base64, 'base64'));
          }
        } catch (_) {}
      }
      const totalBuf = Buffer.concat(audioChunks);
      console.log(`✅ Received ${totalBuf.length} bytes for ${v.name}!`);
      const outPath = path.join(__dirname, `../scratch/voice_${v.id}.mp3`);
      fs.writeFileSync(outPath, totalBuf);
      console.log(`   Saved to ${outPath}`);
    } else {
      console.log('❌ Error body:', await res.text());
    }
  }

  app.quit();
});
