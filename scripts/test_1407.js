const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { pathToFileURL } = require('url');

async function testVideo(videoPath) {
  console.log('Testing video 14:07:', videoPath);
  const tempWav = path.join(__dirname, '../scratch/test_1407.wav');
  
  await new Promise((resolve, reject) => {
    execFile('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', videoPath, '-vn', '-ar', '16000', '-ac', '1', tempWav], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
  console.log('Wav extracted, size:', fs.statSync(tempWav).size);

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const transformerPaths = [
    'D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js',
    'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js'
  ];
  let modPath = transformerPaths.find(p => fs.existsSync(p));
  const { pipeline, env } = await import(pathToFileURL(modPath).href);

  const modelDirs = [
    'D:/dự án antigravity/AIForge_Veo3_Studio/app/models',
    'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models'
  ];
  let chosenModelDir = modelDirs.find(d => fs.existsSync(d));
  if (chosenModelDir) env.cacheDir = chosenModelDir;
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('Running Whisper...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  const out = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000
  });

  console.log('Raw output from Whisper:', out);
}

const vPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/f407a1a1-718d-4cde-8945-fcf67d55d5ab.mp4';
testVideo(vPath).catch(console.error);
