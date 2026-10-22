const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('=== TEST TRANSCRIBE EXACT ASSET 0772ba78 ===');
const vidPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\0772ba78-1d16-473b-a24e-1fae44f71bf4.mp4';
console.log('Video exists:', fs.existsSync(vidPath), 'size:', fs.statSync(vidPath).size);

// Test ffmpeg extraction exactly like transcribeVideoAudio
const tempWav = path.resolve(__dirname, '../scratch/test_0772.wav');
const ffmpegBin = 'ffmpeg';
const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", vidPath, "-vn", "-ar", "16000", "-ac", "1", tempWav];

cp.execFileSync(ffmpegBin, extractArgs);
console.log('Extracted wav size:', fs.statSync(tempWav).size);

// Test Whisper
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
  console.log('✅ Result of Whisper on video 0772ba78:', out);
}

run().catch(e => console.error(e));
