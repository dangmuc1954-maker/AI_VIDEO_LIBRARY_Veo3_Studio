const { app } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

app.whenReady().then(async () => {
  console.log('--- RUNNING TEST INSIDE ELECTRON MAIN PROCESS ---');
  console.log('process.resourcesPath:', process.resourcesPath);
  console.log('app.getAppPath():', app.getAppPath());

  const assetStatePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/asset-state.json');
  const assetState = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));
  const videoAssetId = '31a0165a-3b44-4445-b05a-84ea4f11be9e';
  
  const vAsset = assetState.assets.find(t => t.id === videoAssetId);
  console.log('Found vAsset:', vAsset?.id, vAsset?.localPath);

  const ffmpegBin = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  let videoPath = vAsset.localPath;

  const tempWav = path.join(__dirname, '../scratch/electron_stt_test.wav');
  let scriptText = '';

  try {
    const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", `"${videoPath}"`, "-vn", "-ar", "16000", "-ac", "1", `"${tempWav}"`];
    console.log('Extracting audio via FFmpeg...');
    execSync(`"${ffmpegBin}" ${extractArgs.join(' ')}`);
    console.log('Extracted WAV size:', fs.existsSync(tempWav) ? fs.statSync(tempWav).size : 0);

    if (fs.existsSync(tempWav) && fs.statSync(tempWav).size > 1000) {
      const wavBuf = fs.readFileSync(tempWav);
      const pcmBytes = wavBuf.subarray(44);
      const float32 = new Float32Array(pcmBytes.length / 2);
      for (let i = 0; i < float32.length; i++) {
        float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
      }

      // Check transformers loading exactly as in main/index.js
      const N = path.join;
      const Nn = path.join(__dirname, '../app/out/main'); // In main/index.js
      const possibleTransformers = [
        N(Nn, "../node_modules/@xenova/transformers/src/transformers.js"),
        N(Nn, "../../node_modules/@xenova/transformers/src/transformers.js"),
        N(process.resourcesPath || "", "app/node_modules/@xenova/transformers/src/transformers.js"),
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/@xenova/transformers/src/transformers.js"
      ];

      const possibleModelDirs = [
        N(Nn, "../models"),
        N(Nn, "../../models"),
        N(process.env.APPDATA || "", "AI_VIDEO_LIBRARY_DATA/models"),
        N(process.resourcesPath || "", "app/models"),
        "D:/dự án antigravity/AIForge_Veo3_Studio/app/models"
      ];

      let modPath = "";
      for (const p of possibleTransformers) {
        console.log('Checking transformer path:', p, 'exists:', fs.existsSync(p));
        if (fs.existsSync(p)) {
          modPath = p;
          break;
        }
      }
      console.log('Chosen modPath:', modPath);

      if (modPath) {
        const modUrl = "file:///" + modPath.replace(/\\/g, "/");
        console.log('Dynamic importing modUrl in Electron:', modUrl);
        const { pipeline, env } = await import(modUrl);
        console.log('Successfully imported transformers!');

        let chosenModelDir = "";
        for (const md of possibleModelDirs) {
          console.log('Checking model dir:', md, 'exists:', fs.existsSync(md));
          if (fs.existsSync(md)) {
            chosenModelDir = md;
            break;
          }
        }
        console.log('Chosen modelDir:', chosenModelDir);
        if (chosenModelDir) env.cacheDir = chosenModelDir;
        env.allowLocalModels = true;
        env.allowRemoteModels = true;

        console.log('Initializing whisper pipeline...');
        const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
        console.log('Transcriber created! Running recognition...');

        const promptContext = (vAsset.prompt || "").slice(0, 100);
        const out = await transcriber(float32, {
          language: "vietnamese",
          task: "transcribe",
          sampling_rate: 16000,
          initial_prompt: promptContext || "tạo nhân vật nữ review balo, kịch bản lồng tiếng"
        });

        console.log('SUCCESS! Whisper out:', out);
        scriptText = out.text;
      }
    }
  } catch (err) {
    console.error('CATCH ERROR IN ELECTRON:', err);
  }

  console.log('RESULT SCRIPT TEXT:', scriptText);
  app.quit();
});
