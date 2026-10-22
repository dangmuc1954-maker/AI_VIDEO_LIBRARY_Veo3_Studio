const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
const wavPath = path.join(appData, 'AI_VIDEO_LIBRARY_DATA/assets/extracted_raw_f5102f2db893.wav');
const mp4Path = path.join(appData, 'AI_VIDEO_LIBRARY_DATA/assets/df6b4daf-b183-43be-b84d-1c91eb545efc.mp4');

console.log('=== INSPECTING AUDIO & VIDEO FILES ===');
console.log('WAV exists:', fs.existsSync(wavPath), 'Size:', fs.existsSync(wavPath) ? fs.statSync(wavPath).size : 0);
console.log('MP4 exists:', fs.existsSync(mp4Path), 'Size:', fs.existsSync(mp4Path) ? fs.statSync(mp4Path).size : 0);

// Let's test the STT API call with this wav file:
async function testStt() {
  if (!fs.existsSync(wavPath)) return;
  const wavBuffer = fs.readFileSync(wavPath);
  const base64Audio = wavBuffer.toString('base64');
  console.log('[*] Testing Cloud STT with extracted wav (base64 length: ' + base64Audio.length + ')...');
  
  const serverUrl = 'https://vercelserver-eight.vercel.app/api/transcribe';
  try {
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64Audio,
        promptContext: 'tạo cô gái riview balo',
        targetLanguage: 'vi'
      })
    });
    console.log('STT status:', res.status, res.statusText);
    const json = await res.json();
    console.log('STT response:', json);
  } catch (err) {
    console.error('STT error:', err.message);
  }
}

testStt();
