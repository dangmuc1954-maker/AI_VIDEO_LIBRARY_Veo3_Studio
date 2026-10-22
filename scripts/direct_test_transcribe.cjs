const fs = require('fs');
const path = require('path');
const cp = require('child_process');

console.log('=== TEST TRANSCRIBE DIRECTLY ===');

// Let's test with the newest video in assets
const assetDir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets';
const files = fs.readdirSync(assetDir).filter(f => f.endsWith('.mp4'));
const newestVid = files.map(f => ({ name: f, time: fs.statSync(path.join(assetDir, f)).mtime }))
                       .sort((a, b) => b.time - a.time)[0];

console.log('Newest video file:', newestVid);
const vidPath = path.join(assetDir, newestVid.name);

// Let's run the exact ffmpeg extraction that transcribeVideoAudio does:
const tempWav = path.resolve(__dirname, '../scratch/test_extract_now.wav');
const ffmpegBin = 'ffmpeg';
const extractArgs = ["-hide_banner", "-loglevel", "error", "-y", "-i", vidPath, "-vn", "-ar", "16000", "-ac", "1", tempWav];

console.log('Extracting audio from video with ffmpeg...');
const t0 = Date.now();
try {
  cp.execFileSync(ffmpegBin, extractArgs);
  console.log('Audio extracted in', (Date.now() - t0)/1000, 's, wav size:', fs.statSync(tempWav).size);
} catch (e) {
  console.error('FFmpeg extraction failed:', e.message);
}

// Now test Whisper on this extracted audio
async function runWhisper() {
  const { pathToFileURL } = require('url');
  const modPath = path.resolve('app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modPath).href);
  env.cacheDir = path.resolve('app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = false;

  console.log('Loading pipeline...');
  const t1 = Date.now();
  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
  console.log('Pipeline loaded in', (Date.now() - t1)/1000, 's');

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  console.log('Transcribing float32 samples:', float32.length, '...');
  const t2 = Date.now();
  const out = await transcriber(float32, { task: "transcribe", sampling_rate: 16000 });
  console.log('Transcribed in', (Date.now() - t2)/1000, 's! Result:', out);
}

runWhisper().catch(e => console.error('Whisper failed:', e));
