const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { execSync } = require('child_process');

async function testWhisperTuning() {
  const videoPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\beb1cd1a-347f-4d27-a0ef-99f5648ce351.mp4';
  const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/test_beb1cd1a.wav');

  execSync(`"${ffmpeg}" -hide_banner -loglevel error -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${tempWav}"`);

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const modPath = path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modPath).href);

  env.cacheDir = path.join(__dirname, '../app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');

  console.log('--- Test 1: No initial prompt ---');
  let res1 = await transcriber(float32, { language: 'vietnamese', task: 'transcribe', sampling_rate: 16000 });
  console.log('Result 1:', res1.text);

  console.log('\n--- Test 2: Standard Vietnamese Greetings & Review prompt ---');
  const p2 = 'Chào mừng các bạn đã quay trở lại, hôm nay mình review chiếc xe đạp này có khung sườn siêu nhẹ, trải nghiệm mượt mà, nhớ bấm follow mình nhé.';
  let res2 = await transcriber(float32, { language: 'vietnamese', task: 'transcribe', sampling_rate: 16000, initial_prompt: p2 });
  console.log('Result 2:', res2.text);

  console.log('\n--- Test 3: Broad domain contextual prompt ---');
  const p3 = 'Chào mừng các bạn đã quay trở lại với kênh của mình, hôm nay review sản phẩm chiếc xe, balo, điện thoại, khung sườn, thiết kế, chất lượng cực kỳ mượt mà, bấm follow nhé.';
  let res3 = await transcriber(float32, { language: 'vietnamese', task: 'transcribe', sampling_rate: 16000, initial_prompt: p3 });
  console.log('Result 3:', res3.text);
}

testWhisperTuning().catch(console.error);
