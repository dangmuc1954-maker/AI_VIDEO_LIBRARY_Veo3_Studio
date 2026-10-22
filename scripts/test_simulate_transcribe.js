const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function testSimulateTranscribe() {
  const assetStatePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/asset-state.json');
  const assetState = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));
  const videoAssetId = '31a0165a-3b44-4445-b05a-84ea4f11be9e';
  
  const vAsset = assetState.assets.find(t => t.id === videoAssetId);
  console.log('Found vAsset:', vAsset?.id, vAsset?.localPath);

  const ffmpegBin = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  let videoPath = vAsset.localPath;

  const filesDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/assets');
  const tempWav = path.join(__dirname, '../scratch/sim_stt_extract.wav');
  let scriptText = '';

  try {
    const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", videoPath, "-vn", "-ar", "16000", "-ac", "1", tempWav];
    execSync(`"${ffmpegBin}" ${extractArgs.join(' ')}`);
    console.log('FFmpeg extracted WAV. Exists:', fs.existsSync(tempWav), 'Size:', fs.existsSync(tempWav) ? fs.statSync(tempWav).size : 0);

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
        if (fs.existsSync(p)) {
          modPath = p;
          break;
        }
      }
      console.log('modPath:', modPath);

      if (modPath) {
        const modUrl = "file:///" + modPath.replace(/\\/g, "/");
        const { pipeline, env } = await import(modUrl);
        let chosenModelDir = "";
        for (const md of possibleModelDirs) {
          if (fs.existsSync(md)) {
            chosenModelDir = md;
            break;
          }
        }
        console.log('chosenModelDir:', chosenModelDir);
        if (chosenModelDir) env.cacheDir = chosenModelDir;
        env.allowLocalModels = true;
        env.allowRemoteModels = true;

        console.log('Initializing transcriber...');
        const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
        const promptContext = (vAsset.prompt || "").slice(0, 100);
        console.log('Running transcriber with context:', promptContext);
        const out = await transcriber(float32, {
          language: "vietnamese",
          task: "transcribe",
          sampling_rate: 16000,
          initial_prompt: promptContext || "tạo nhân vật nữ review balo, kịch bản lồng tiếng"
        });

        console.log('Whisper raw out:', out);
        if (out && typeof out.text === "string") {
          let s = out.text.trim();
          console.log('Trimmed text:', s);
          if (s.length > 2) {
            s = s.replace(/3\s*lo|bà\s*lôn|ba\s*lo|balon/gi, "balo")
                 .replace(/mưỡi/gi, "mới")
                 .replace(/xem\s+trước\s+([0-9a-zà-ỹ]+)\s+mới/gi, "xem chiếc $1 mới")
                 .replace(/review\s+trước\s+balo/gi, "review chiếc balo")
                 .replace(/xem\s+trước\s+balo/gi, "xem chiếc balo")
                 .replace(/xem\s+trước/gi, "xem chiếc")
                 .replace(/review\s+trước/gi, "review chiếc")
                 .replace(/chất\s+vài/gi, "chất vải")
                 .replace(/chất\s+liệu\s+vài/gi, "chất liệu vải")
                 .replace(/chúng\s+nước/gi, "chống nước")
                 .replace(/xíu\s+trống\s+nước/gi, "siêu chống nước")
                 .replace(/trống\s+nước/gi, "chống nước")
                 .replace(/đ[eé]o\s+thử/gi, "đeo thử")
                 .replace(/đ[eé]o/gi, "đeo")
                 .replace(/lên\s+vài/gi, "lên vai")
                 .replace(/nhá,\s*em\s+ai/gi, "nhé, êm ái")
                 .replace(/em\s+ai|em\s+ài/gi, "êm ái")
                 .replace(/(?:ưu|u)\s+đại/gi, "ưu đãi")
                 .replace(/linh\s+mua\s+hàng/gi, "link mua hàng")
                 .replace(/dộng\s+giải/gi, "rộng rãi")
                 .replace(/nhà\./gi, "nha.")
                 .replace(/nhà$/gi, "nha")
                 .replace(/nhá$/gi, "nhé!");
            s = s.trim();
            if (s.length > 0) {
              scriptText = s.charAt(0).toUpperCase() + s.slice(1);
            }
          }
        }
      } else {
        console.error('modPath was EMPTY!');
      }
    } else {
      console.error('Wav file missing or <= 1000 bytes');
    }
  } catch (err) {
    console.error('Error during transcribe:', err);
  }

  console.log('\nFinal scriptText:', scriptText);
  if (!scriptText) {
    console.log('FALLBACK TRIGGERED!');
  }
}

testSimulateTranscribe().catch(console.error);
