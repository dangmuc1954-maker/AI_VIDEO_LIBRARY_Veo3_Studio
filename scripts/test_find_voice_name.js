const fs = require('fs');

async function testVoice(voiceId) {
  console.log(`\n=== SEARCHING FOR REAL NAME OF VOICE: ${voiceId} ===`);

  // 1. Check all premade / standard voices
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices');
    if (res.ok) {
      const data = await res.json();
      const match = (data.voices || []).find(v => v.voice_id === voiceId);
      if (match) {
        console.log('[FOUND in Premade Voices]', match.name);
        return match;
      }
    }
  } catch (e) {
    console.log('Premade fetch err:', e.message);
  }

  // 2. Try ElevenLabs public shared voices API with query params or different variations
  const testEndpoints = [
    `https://api.elevenlabs.io/v1/shared-voices?search=${encodeURIComponent(voiceId)}`,
    `https://api.elevenlabs.io/v1/voices/premade`,
    `https://api.elevenlabs.io/v1/voices/published`,
    `https://api.elevenlabs.io/v1/models`
  ];

  for (const ep of testEndpoints) {
    try {
      const r = await fetch(ep);
      console.log(`Endpoint ${ep} -> Status: ${r.status}`);
      if (r.ok) {
        const text = await r.text();
        console.log('  Data sample:', text.slice(0, 200));
      }
    } catch(e) {}
  }

  // 3. Inspect HTML of ElevenLabs sharing / community pages
  const pageUrls = [
    `https://elevenlabs.io/app/voice-lab/share/${voiceId}`,
    `https://elevenlabs.io/voice-library?search=${encodeURIComponent(voiceId)}`,
    `https://elevenlabs.io/voice-lab/share/${voiceId}`
  ];

  for (const pageUrl of pageUrls) {
    try {
      const res = await fetch(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      console.log(`Page ${pageUrl} -> Status: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const nextData = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (nextData) {
          console.log('Found __NEXT_DATA__ in', pageUrl);
          fs.writeFileSync('next_data_sample.json', nextData[1]);
          const parsed = JSON.parse(nextData[1]);
          console.log('PageProps:', JSON.stringify(parsed.props?.pageProps).slice(0, 300));
        }

        // Search for JSON objects in script tags
        const scripts = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        for (const s of scripts) {
          if (s[1].includes(voiceId)) {
            console.log('Found voiceId in script tag:');
            console.log(s[1].slice(0, 500));
          }
        }
      }
    } catch (e) {
      console.log('Page fetch err:', e.message);
    }
  }
}

testVoice('nC2yzw1lZiuWB6LUDT15a');
