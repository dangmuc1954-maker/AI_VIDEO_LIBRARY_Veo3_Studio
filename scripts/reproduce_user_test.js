const fs = require('fs');
const path = require('path');

// Simulate the exact transcribeVideoAudio call
async function testExactCall() {
  const assetId = '857e3407-d6e4-45f0-a9db-556c763d2dbb';
  const statePath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\asset-state.json';
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const vAsset = state.assets.find(a => a.id === assetId);
  console.log('Found vAsset:', vAsset ? vAsset.id : 'NOT FOUND');
  console.log('LocalPath:', vAsset.localPath, 'exists:', fs.existsSync(vAsset.localPath));

  const ffmpegBin = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/debug_stt.wav');

  // Let's test FFmpeg extraction
  const { execSync } = require('child_process');
  try {
    console.log('Extracting audio with FFmpeg...');
    const out = execSync(`"${ffmpegBin}" -hide_banner -loglevel error -y -i "${vAsset.localPath}" -vn -ar 16000 -ac 1 "${tempWav}"`, { stdio: 'pipe' });
    console.log('FFmpeg success, wav size:', fs.statSync(tempWav).size);
  } catch (e) {
    console.error('FFmpeg extraction error:', e);
    console.error('Stderr:', e.stderr ? e.stderr.toString() : '');
    return;
  }

  // Now let's test Whisper loading
  try {
    console.log('Loading @xenova/transformers...');
    const possibleTransformers = [
      path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js')
    ];
    const { pathToFileURL } = require('url');
    const { pipeline, env } = await import(pathToFileURL(possibleTransformers[0]).href);

    const modelDir = path.join(__dirname, '../app/models');
    env.cacheDir = modelDir;
    env.allowLocalModels = true;
    env.allowRemoteModels = true;

    console.log('Loading pipeline Xenova/whisper-base...');
    const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
    console.log('Transcriber ready');

    const wavBuf = fs.readFileSync(tempWav);
    const pcmBytes = wavBuf.subarray(44);
    const float32 = new Float32Array(pcmBytes.length / 2);
    for (let i = 0; i < float32.length; i++) {
      float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
    }

    console.log('Transcribing Float32 length:', float32.length);
    const res = await transcriber(float32, {
      language: 'vietnamese',
      task: 'transcribe',
      sampling_rate: 16000,
      initial_prompt: vAsset.prompt || 'review balo'
    });

    console.log('Transcription result:', res);
  } catch (e) {
    console.error('Whisper/pipeline error:', e);
  }
}

testExactCall().catch(console.error);
