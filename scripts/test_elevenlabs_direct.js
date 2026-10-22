const path = require('path');
const fs = require('fs');

async function testTts() {
  console.log('--- Testing ElevenLabs synthesis direct ---');
  const voiceId = 'aN7cv9yXNrfIR87bDmyD';
  const text = 'Xin chào, đây là giọng đọc thử nghiệm từ hệ thống ElevenLabs.';
  
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });
    console.log('Direct status:', res.status, res.statusText);
    if (!res.ok) {
      const txt = await res.text();
      console.log('Direct err body:', txt);
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('Direct audio received, byte size:', buf.length);
    }
  } catch (err) {
    console.error('Direct fetch error:', err.message);
  }
}

testTts();
