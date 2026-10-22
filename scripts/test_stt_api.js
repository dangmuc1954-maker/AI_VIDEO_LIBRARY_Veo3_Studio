const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function testSpeechRecognition() {
  console.log('Testing speech recognition...');
  const ffmpegPath = path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');
  
  // Create a 3s test audio saying something if possible or test web stt endpoint
  const testWav = path.join(__dirname, '../scratch/test_speech.wav');
  execSync(`"${ffmpegPath}" -y -f lavfi -i sine=frequency=300:duration=2 -ar 16000 -ac 1 -c:a pcm_s16le "${testWav}"`, { stdio: 'ignore' });

  const audioBytes = fs.readFileSync(testWav);

  // Test Google Speech v2 API
  try {
    const res = await fetch('https://www.google.com/speech-api/v2/recognize?output=json&lang=en-US&key=YOUR_API_KEY', {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/l16; rate=16000'
      },
      body: audioBytes
    });
    console.log('Google Speech v2 status:', res.status);
    const text = await res.text();
    console.log('Google Speech response:', text);
  } catch (e) {
    console.log('Google Speech error:', e.message);
  }
}

testSpeechRecognition();
