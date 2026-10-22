const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function transcribeUserVideo() {
  const wavPath = path.join(__dirname, '../scratch/test_user_video.wav');
  const modulePath = path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modulePath).href);

  env.cacheDir = path.join(__dirname, '../app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('Loading pipeline...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');

  const buf = fs.readFileSync(wavPath);
  const pcmBytes = buf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  console.log('Float32 array length:', float32.length);
  // Check if there is actual audio volume
  let maxAmp = 0;
  for (let i = 0; i < float32.length; i++) {
    const a = Math.abs(float32[i]);
    if (a > maxAmp) maxAmp = a;
  }
  console.log('Max audio amplitude:', maxAmp);

  const out = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000
  });

  console.log('TRANSCRIPTION RESULT:', out);
}

transcribeUserVideo().catch(console.error);
