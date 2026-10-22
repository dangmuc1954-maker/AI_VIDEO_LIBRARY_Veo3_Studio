const fs = require('fs');
const path = require('path');

console.log('=== TEST VOICEOVER SYNTHESIS & FFMPEG ===');

// Let's test ElevenLabs public voice lookup
async function testLookup(voiceId) {
  console.log(`Testing lookup for voiceId: ${voiceId}`);
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/voices`);
    if (res.ok) {
      const data = await res.json();
      const found = (data.voices || []).find(v => v.voice_id === voiceId);
      if (found) {
        console.log(`Found voice in public API: ${found.name} (${found.category || 'premade'})`);
        return found;
      }
    }
  } catch (err) {
    console.error('Error fetching public voices:', err.message);
  }
  
  // Try shared voice lookup
  try {
    const sharedRes = await fetch(`https://api.elevenlabs.io/v1/shared-voices/${encodeURIComponent(voiceId)}`);
    if (sharedRes.ok) {
      const sData = await sharedRes.json();
      console.log(`Found shared voice: ${sData.name}`);
      return sData;
    }
  } catch (err) {
    console.error('Error fetching shared voice:', err.message);
  }
  
  console.log('Voice not in public list (custom ID)');
  return null;
}

async function run() {
  await testLookup('21m00Tcm4TlvDq8ikWAM'); // Rachel
  await testLookup('aN7cv9yXNrfIR87bDmyD'); // Ninh Don
  await testLookup('pNInz6obpgDQGcFmaJgB'); // Adam
}

run();
