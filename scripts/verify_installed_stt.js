const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function testInstalledTranscribe() {
  const assetStatePath = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/asset-state.json');
  const assetState = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));
  const videoAssetId = '31a0165a-3b44-4445-b05a-84ea4f11be9e';
  
  const vAsset = assetState.assets.find(t => t.id === videoAssetId);
  console.log('[*] Found asset:', vAsset.id, 'prompt:', vAsset.prompt);

  const ffmpegBin = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/installed_stt_test.wav');

  execSync(`"${ffmpegBin}" -hide_banner -loglevel error -y -i "${vAsset.localPath}" -vn -ar 16000 -ac 1 "${tempWav}"`);
  console.log('[*] WAV size:', fs.statSync(tempWav).size);

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const installedApp = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app';
  const modPath = path.join(installedApp, 'node_modules/@xenova/transformers/src/transformers.js');
  const { pathToFileURL } = require('url');
  const modUrl = pathToFileURL(modPath).href;

  console.log('[*] Loading transformers from installed app:', modUrl);
  const { pipeline, env } = await import(modUrl);

  env.cacheDir = path.join(installedApp, 'models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('[*] Creating whisper-base transcriber...');
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');

  console.log('[*] Transcribing speech from video audio...');
  const out = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000
  });

  console.log('\n=============================================================');
  console.log('🎉 RAW WHISPER TRANSCRIPTION FROM INSTALLED APP:');
  console.log(out.text);
  console.log('=============================================================\n');
}

testInstalledTranscribe().catch(console.error);
