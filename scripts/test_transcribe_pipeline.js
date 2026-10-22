const fs = require('fs');
const path = require('path');
const nodeFs = fs;
const N = path.join;
const Nn = 'D:/dự án antigravity/AIForge_Veo3_Studio/app/out/main';

const videoPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/8f6cbeef-e4c0-4b30-8f62-a400af898339.mp4';
const tempWav = 'D:/dự án antigravity/AIForge_Veo3_Studio/scratch/test_pipeline.wav';

async function runPipeline() {
  const possibleTransformers = [
    N(Nn, "../node_modules/@xenova/transformers/src/transformers.js"),
    N(Nn, "../../node_modules/@xenova/transformers/src/transformers.js"),
    N(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
    "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/@xenova/transformers/src/transformers.js",
    "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
  ];

  console.log('Testing possibleTransformers paths:');
  for (const p of possibleTransformers) {
    console.log('  ', p, '-> exists:', fs.existsSync(p));
  }

  const possibleModelDirs = [
    N(Nn, "../models"),
    N(Nn, "../../models"),
    N(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
    N(process.resourcesPath || "", "app/models"),
    "C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/models",
    "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
  ];

  console.log('\nTesting possibleModelDirs paths:');
  for (const md of possibleModelDirs) {
    console.log('  ', md, '-> exists:', fs.existsSync(md));
  }

  // Chạy trích xuất ffmpeg
  const { execSync } = require('child_process');
  execSync(`ffmpeg -hide_banner -loglevel error -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${tempWav}"`);
  console.log('\ntempWav exists:', fs.existsSync(tempWav), 'size:', fs.statSync(tempWav).size);

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  let modPath = "";
  for (const p of possibleTransformers) {
    if (nodeFs.existsSync(p)) {
      modPath = p;
      break;
    }
  }

  console.log('\nSelected modPath:', modPath);
  const { pathToFileURL } = await import("node:url");
  const modUrl = pathToFileURL(modPath).href;
  console.log('modUrl:', modUrl);

  const { pipeline, env } = await import(modUrl);
  let chosenModelDir = "";
  for (const md of possibleModelDirs) {
    if (nodeFs.existsSync(md)) {
      chosenModelDir = md;
      break;
    }
  }
  console.log('chosenModelDir:', chosenModelDir);
  if (chosenModelDir) env.cacheDir = chosenModelDir;
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('Calling pipeline...');
  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
  console.log('Transcriber loaded. Transcribing...');
  const out = await transcriber(float32, {
    language: "vietnamese",
    task: "transcribe",
    sampling_rate: 16000
  });

  console.log('Result:', out);
}

runPipeline().catch(console.error);
