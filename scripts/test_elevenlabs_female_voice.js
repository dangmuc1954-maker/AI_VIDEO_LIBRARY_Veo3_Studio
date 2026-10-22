const fs = require('fs');
const path = require('path');

async function testFemaleVoiceSynth() {
  console.log('Testing ElevenLabs TTS with Female Voice ID: EXAVITQu4vr4xnSDxMaL (Bella)...');
  const femaleVoiceId = 'EXAVITQu4vr4xnSDxMaL';
  const text = 'Chào bạn, đây là giọng đọc nữ mẫu chuẩn ElevenLabs tiếng Việt.';

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${femaleVoiceId}/stream/with-timestamps/anonymous`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.85,
          style: 0.15,
          use_speaker_boost: true
        }
      })
    });

    console.log('Status code:', res.status, res.statusText);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log('Received audio bytes:', buf.length);
      fs.writeFileSync('scratch/test_female_voice.mp3', buf);
      console.log('Saved to scratch/test_female_voice.mp3');
    } else {
      const errText = await res.text();
      console.log('Error text:', errText);
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testFemaleVoiceSynth();
