const { app, WebContentsView } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

app.whenReady().then(async () => {
  console.log('=== TEST DUBBING PIPELINE ON REAL USER VIDEO ===');

  const ffmpeg = path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');
  const userVideo = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/assets/df6b4daf-b183-43be-b84d-1c91eb545efc.mp4');
  
  if (!fs.existsSync(userVideo)) {
    console.error('User video not found at:', userVideo);
    app.quit();
    return;
  }
  console.log('Found user video:', userVideo, 'Size:', fs.statSync(userVideo).size, 'bytes');

  // 1. Solve Captcha for ElevenLabs
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

  console.log('Got hCaptcha token:', !!tok);
  if (!tok) {
    console.error('Failed to get token');
    app.quit();
    return;
  }

  // 2. Synthesize dialogue with ElevenLabs
  const voiceId = 'aN7cv9yXNrfIR87bDmyD';
  const dialogueText = 'Xin chào các bạn, hôm nay mình sẽ review cho mọi người chiếc ba lô siêu xinh và tiện lợi này nhé.';

  console.log('[*] Calling ElevenLabs without language_code for eleven_multilingual_v2...');
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps/anonymous`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
    body: JSON.stringify({
      text: dialogueText,
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

  console.log('Status:', res.status, res.statusText);
  if (!res.ok) {
    console.error('ElevenLabs error:', await res.text());
    app.quit();
    return;
  }

  const txt = await res.text();
  const chunks = [];
  txt.split('\n').forEach(l => {
    try {
      const p = JSON.parse(l);
      if (p.audio_base64) chunks.push(Buffer.from(p.audio_base64, 'base64'));
    } catch (_) {}
  });

  const audioBuf = Buffer.concat(chunks);
  console.log('✅ Received audio buffer:', audioBuf.length, 'bytes');

  const testAudioPath = path.join(__dirname, '../scratch/test_dub_audio.mp3');
  const testDubbedVideo = path.join(__dirname, '../scratch/test_dubbed_balo.mp4');
  fs.writeFileSync(testAudioPath, audioBuf);

  // 3. Remux with FFmpeg
  console.log('[*] Remuxing with FFmpeg...');
  const ffRes = spawnSync(ffmpeg, [
    '-y',
    '-i', userVideo,
    '-i', testAudioPath,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',
    '-movflags', '+faststart',
    testDubbedVideo
  ], { encoding: 'utf8' });

  if (fs.existsSync(testDubbedVideo) && fs.statSync(testDubbedVideo).size > 1000) {
    console.log('🎉 SUCCESS! Dubbed video created:', testDubbedVideo, 'Size:', fs.statSync(testDubbedVideo).size, 'bytes');
  } else {
    console.error('❌ FFmpeg remux failed:', ffRes.stderr);
  }

  app.quit();
});
