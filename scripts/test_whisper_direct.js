const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

async function testWhisper() {
  const wavPath = 'D:/dự án antigravity/AIForge_Veo3_Studio/scratch/test_extract.wav';
  const wavBuf = fs.readFileSync(wavPath);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }
  console.log('Float32 samples:', float32.length, 'Duration approx:', float32.length / 16000, 'seconds');

  const possibleTransformers = [
    'D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js',
    'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js'
  ];

  let modPath = '';
  for (const p of possibleTransformers) {
    if (fs.existsSync(p)) {
      modPath = p;
      break;
    }
  }
  console.log('Found transformers at:', modPath);

  if (!modPath) {
    console.error('Transformers not found!');
    return;
  }

  const { pipeline, env } = await import(pathToFileURL(modPath).href);
  const possibleModelDirs = [
    'D:/dự án antigravity/AIForge_Veo3_Studio/app/models',
    'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models'
  ];
  for (const md of possibleModelDirs) {
    if (fs.existsSync(md)) {
      env.cacheDir = md;
      console.log('Using model cacheDir:', md);
      break;
    }
  }
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('Loading pipeline automatic-speech-recognition...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  console.log('Transcriber loaded successfully. Running inference...');
  const out = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000
  });

  console.log('Raw output from Whisper:');
  console.log(JSON.stringify(out, null, 2));
}

testWhisper().catch(err => {
  console.error('Error during whisper test:', err);
});
