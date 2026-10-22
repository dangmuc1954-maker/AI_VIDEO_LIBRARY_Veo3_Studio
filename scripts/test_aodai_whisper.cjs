const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const vidPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\3b52cc41-1b43-4a2c-9958-6552a1e79846.mp4';
console.log('Video exists:', fs.existsSync(vidPath), 'size:', fs.statSync(vidPath).size);

// Extract audio with ffmpeg
const tempWav = path.resolve(__dirname, '../scratch/test_aodai.wav');
cp.execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', vidPath, '-vn', '-ar', '16000', '-ac', '1', tempWav]);
console.log('Extracted wav size:', fs.statSync(tempWav).size);

// Run Whisper
async function run() {
  const { pathToFileURL } = require('url');
  const modPath = path.resolve('app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modPath).href);
  env.cacheDir = path.resolve('app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = false;

  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const out = await transcriber(float32, { language: 'vietnamese', task: "transcribe", sampling_rate: 16000 });
  console.log('✅ RAW WHISPER ON AO DAI VIDEO:', out);
}

run().catch(e => console.error(e));
