const fs = require('fs');
const path = require('path');

const { pathToFileURL } = require('url');

async function runWhisper() {
  console.log('Loading @xenova/transformers...');
  const modulePath = path.join(__dirname, '../scratch/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modulePath).href);

  // Use HuggingFace cache directory
  env.cacheDir = path.join(__dirname, '../scratch/models');

  console.log('Initializing automatic-speech-recognition with Xenova/whisper-tiny...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');

  console.log('Reading 16kHz mono WAV file...');
  const wavPath = path.join(__dirname, '../scratch/test_extracted.wav');
  const buf = fs.readFileSync(wavPath);
  
  // WAV header is 44 bytes, followed by 16-bit signed integer samples at 16000Hz mono
  const pcmBytes = buf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  console.log('Transcribing Vietnamese speech (vi)... (Float32 length: ' + float32.length + ')');
  const start = Date.now();
  const output = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000
  });

  console.log('Transcription took:', Date.now() - start, 'ms');
  console.log('TRANSCRIPTION RESULT:');
  console.log(output);
}

runWhisper().catch(err => {
  console.error('Whisper failed:', err);
});
