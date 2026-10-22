const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const targetVid = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\668ce23a-5a53-4c99-a9aa-6fe373ed056b.mp4';
console.log('Video exists:', fs.existsSync(targetVid));
if (fs.existsSync(targetVid)) {
  console.log('Size:', fs.statSync(targetVid).size);

  // Check audio stream in this video with ffprobe/ffmpeg
  const probe = cp.spawnSync('ffmpeg', ['-hide_banner', '-i', targetVid], { encoding: 'utf8' });
  console.log('FFmpeg probe output:');
  console.log(probe.stderr);

  // Extract audio
  const outWav = path.resolve(__dirname, '../scratch/test_flow_668.wav');
  cp.execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', targetVid, '-vn', '-ar', '16000', '-ac', '1', outWav]);
  console.log('Extracted wav size:', fs.statSync(outWav).size);

  // Now run Whisper on this WAV
  async function runSTT() {
    const { pathToFileURL } = require('url');
    const modPath = path.resolve('app/node_modules/@xenova/transformers/src/transformers.js');
    const { pipeline, env } = await import(pathToFileURL(modPath).href);
    env.cacheDir = path.resolve('app/models');
    env.allowLocalModels = true;
    env.allowRemoteModels = false;

    const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");
    const wavBuf = fs.readFileSync(outWav);
    const pcmBytes = wavBuf.subarray(44);
    const float32 = new Float32Array(pcmBytes.length / 2);
    for (let i = 0; i < float32.length; i++) {
      float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
    }

    const out = await transcriber(float32, { language: 'vietnamese', task: 'transcribe', sampling_rate: 16000 });
    console.log('WHISPER TRANSCRIBED RESULT:', out);
  }
  runSTT().catch(e => console.error(e));
}
