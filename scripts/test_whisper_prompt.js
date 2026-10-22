const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function testPromptWhisper() {
  const modulePath = path.join(__dirname, '../scratch/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modulePath).href);
  env.cacheDir = path.join(__dirname, '../scratch/models');

  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  const wavPath = path.join(__dirname, '../scratch/test_extracted.wav');
  const buf = fs.readFileSync(wavPath);
  const pcmBytes = buf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const output = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000,
    initial_prompt: 'Review balo, túi xách, chất vải siêu chống nước, nhiều ngăn cực kỳ tiện lợi.'
  });

  console.log('OUTPUT WITH INITIAL PROMPT:');
  console.log(output);
}

testPromptWhisper();
