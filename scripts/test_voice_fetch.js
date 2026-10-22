const fs = require('fs');

async function test(voiceId) {
  console.log(`Testing Voice ID: ${voiceId}`);
  
  // 1. Try public voices endpoint
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices');
    if (res.ok) {
      const data = await res.json();
      const found = (data.voices || []).find(v => v.voice_id === voiceId);
      if (found) {
        console.log('Found in public voices:', found.name, found.category, found.preview_url);
        return {
          voiceId: found.voice_id,
          voiceName: found.name,
          previewUrl: found.preview_url,
          category: found.category,
          language: found.labels?.language || 'Auto'
        };
      }
    }
  } catch (e) {
    console.log('Error fetching public voices:', e.message);
  }

  // 2. Try scraping ElevenLabs share page
  const shareUrls = [
    `https://elevenlabs.io/app/voice-lab/share/${voiceId}`,
    `https://elevenlabs.io/voice-library?search=${encodeURIComponent(voiceId)}`
  ];

  for (const url of shareUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });
      console.log(`Status for ${url}: ${res.status}`);
      if (res.ok) {
        const html = await res.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          console.log('Title:', titleMatch[1]);
        }
        const ogTitle = html.match(/property="og:title"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:title"/i);
        if (ogTitle) {
          console.log('OG Title:', ogTitle[1]);
        }
        const ogDesc = html.match(/property="og:description"\s+content="([^"]+)"/i) || html.match(/content="([^"]+)"\s+property="og:description"/i);
        if (ogDesc) {
          console.log('OG Desc:', ogDesc[1]);
        }
        const audioMatch = html.match(/https:\/\/[^"'\s]+\.mp3/i);
        if (audioMatch) {
          console.log('Found MP3:', audioMatch[0]);
        }
      }
    } catch (e) {
      console.log(`Error fetching ${url}:`, e.message);
    }
  }
}

test('nC2yzw1lZiuWB6LUDT15a');
