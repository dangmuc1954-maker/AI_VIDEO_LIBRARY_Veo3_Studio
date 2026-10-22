const { app, WebContentsView } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
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
  const text = 'Xin chào tất cả các bạn, chào mừng các bạn đã đến với video đánh giá ba lô ngày hôm nay.';

  // 1. Generate with eleven_multilingual_v2
  console.log('[*] Generating with eleven_multilingual_v2...');
  const t1 = await getToken();
  const res1 = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps/anonymous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.85 },
      hcaptcha_token: t1
    })
  });
  if (res1.ok) {
    const txt = await res1.text();
    const chunks = [];
    txt.split('\n').forEach(l => {
      try {
        const j = JSON.parse(l);
        if (j.audio_base64) chunks.push(Buffer.from(j.audio_base64, 'base64'));
      } catch (_) {}
    });
    fs.writeFileSync('scratch/sample_multilingual_v2.mp3', Buffer.concat(chunks));
    console.log('✅ Saved sample_multilingual_v2.mp3, size:', fs.statSync('scratch/sample_multilingual_v2.mp3').size);
  }

  // 2. Generate with eleven_turbo_v2_5 (language_code: vi)
  console.log('[*] Generating with eleven_turbo_v2_5 (vi)...');
  const t2 = await getToken();
  const res2 = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps/anonymous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_turbo_v2_5',
      language_code: 'vi',
      voice_settings: { stability: 0.5, similarity_boost: 0.85 },
      hcaptcha_token: t2
    })
  });
  if (res2.ok) {
    const txt = await res2.text();
    const chunks = [];
    txt.split('\n').forEach(l => {
      try {
        const j = JSON.parse(l);
        if (j.audio_base64) chunks.push(Buffer.from(j.audio_base64, 'base64'));
      } catch (_) {}
    });
    fs.writeFileSync('scratch/sample_turbo_v2_5.mp3', Buffer.concat(chunks));
    console.log('✅ Saved sample_turbo_v2_5.mp3, size:', fs.statSync('scratch/sample_turbo_v2_5.mp3').size);
  }

  app.quit();
});
