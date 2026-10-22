const fs = require('fs');
const path = require('path');

console.log('=== TEST ELEVENLABS RUNNER IN ISOLATION ===');

// Let's test the anonymous TTS streaming endpoint with timestamps
async function testDirectTTS() {
  const voiceId = "aN7cv9yXNrfIR87bDmyD"; // Ninh Don
  const text = "Xin chào các bạn, đây là thử nghiệm lồng tiếng video bằng ElevenLabs.";
  console.log(`Calling ElevenLabs anonymous TTS for text: "${text}"...`);
  
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream/with-timestamps/anonymous`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    if (res.ok) {
      const data = await res.json();
      console.log('Success! audioBase64 length:', data.audio_base64?.length || 0);
    } else {
      const txt = await res.text();
      console.log('Response error text:', txt.slice(0, 300));
    }
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

testDirectTTS();
