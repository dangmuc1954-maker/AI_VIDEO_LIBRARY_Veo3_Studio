const fs = require('fs');
const path = require('path');

async function testGoogleSpeech() {
  const flacData = fs.readFileSync(path.join(__dirname, '../scratch/test_extracted.flac'));
  console.log('Testing Google Speech API v2 with Chromium key/client...');
  
  // Chromium default public speech key or no key
  const urls = [
    'https://www.google.com/speech-api/v2/recognize?client=chromium&lang=vi-VN',
    'https://speech.googleapis.com/v1/speech:recognize'
  ];

  for (const url of urls) {
    try {
      console.log('Fetching', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/x-flac; rate=16000'
        },
        body: flacData
      });
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Response:', text.slice(0, 500));
    } catch (e) {
      console.error('Error for', url, e.message);
    }
  }
}

testGoogleSpeech();
