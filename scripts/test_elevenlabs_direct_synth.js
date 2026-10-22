const fs = require('fs');
const path = require('path');

async function testElevenLabsSynth() {
  console.log('=== TESTING ELEVENLABS SYNTHESIS ===');
  const text = 'Xin chào, đây là bản thử nghiệm lồng tiếng tự động từ AI Forge Studio!';
  const voiceId = 'aN7cv9yXNrfIR87bDmyD'; // Ninh Đôn
  const modelId = 'eleven_multilingual_v2';

  // Test 1: Direct anonymous API
  console.log('[*] Testing direct anonymous endpoint...');
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85,
          style: 0.15,
          use_speaker_boost: true
        }
      })
    });

    console.log('Direct status:', res.status, res.statusText);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('✅ Direct synth SUCCESS! Audio bytes:', buf.length);
      fs.writeFileSync('scratch/direct_synth_test.mp3', buf);
      return;
    } else {
      const errText = await res.text();
      console.warn('Direct synth response error:', errText);
    }
  } catch (err) {
    console.warn('Direct synth fetch error:', err.message);
  }

  // Test 2: Standard non-stream endpoint
  console.log('[*] Testing standard text-to-speech endpoint...');
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85
        }
      })
    });
    console.log('Standard status:', res.status, res.statusText);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('✅ Standard synth SUCCESS! Audio bytes:', buf.length);
      fs.writeFileSync('scratch/direct_synth_test.mp3', buf);
      return;
    } else {
      const errText = await res.text();
      console.warn('Standard synth response error:', errText);
    }
  } catch (err) {
    console.warn('Standard synth fetch error:', err.message);
  }
}

testElevenLabsSynth();
