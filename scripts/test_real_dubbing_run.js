const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

let ffmpegBin = 'ffmpeg';
try {
  const p = path.join(__dirname, 'extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');
  if (fs.existsSync(p)) ffmpegBin = p;
} catch {}

const uDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
const state = JSON.parse(fs.readFileSync(path.join(uDir, 'asset-state.json'), 'utf8'));

const vAsset = state.assets.find(a => a.type === 'video' && fs.existsSync(a.localPath));
const aAsset = state.assets.find(a => a.id === '0cf2aec7-6ff3-407c-9aea-c1a9cc142005');

console.log('Video asset:', vAsset ? vAsset.name : 'none');
console.log('Audio asset:', aAsset ? aAsset.name : 'none');

if (!vAsset || !aAsset) {
  console.log('Missing assets');
  process.exit(1);
}

// Probe audio safely
async function probeAudio(filePath) {
  const proc = spawn(ffmpegBin, ['-hide_banner', '-i', filePath]);
  let buf = '';
  proc.stderr.on('data', d => buf += d.toString());
  await new Promise(res => proc.on('close', res));
  const m = buf.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (m) {
    return Number(m[1])*3600 + Number(m[2])*60 + Number(m[3]);
  }
  return 5.0;
}

// Probe video
async function probeVideo(filePath) {
  const proc = spawn(ffmpegBin, ['-hide_banner', '-i', filePath]);
  let buf = '';
  proc.stderr.on('data', d => buf += d.toString());
  await new Promise(res => proc.on('close', res));
  const m = buf.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
  if (m) {
    return Number(m[1])*3600 + Number(m[2])*60 + Number(m[3]);
  }
  return 5.0;
}

async function run() {
  const aDur = await probeAudio(aAsset.localPath);
  const vDur = await probeVideo(vAsset.localPath);
  console.log(`✓ Audio Duration: ${aDur}s | Video Duration: ${vDur}s`);
  
  const targetSpeed = Math.max(0.65, Math.min(1.55, aDur / vDur));
  console.log(`✓ Calculated adaptive tempo: ${targetSpeed.toFixed(3)}x`);

  const tmpOut = path.join(__dirname, '../scratch/test_real_dubbed.mp4');
  const voiceChain = `atempo=${targetSpeed.toFixed(3)},highpass=f=70,equalizer=f=180:width_type=h:width=120:g=2.5,equalizer=f=3600:width_type=h:width=1200:g=3.2,compand=attacks=0.02:decays=0.15:points=-80/-80|-40/-30|-20/-14|0/-8:soft-knee=6,loudnorm=I=-15:LRA=9:TP=-1.2,aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo`;

  const args = [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', vAsset.localPath,
    '-i', aAsset.localPath,
    '-filter_complex', `[1:a]${voiceChain}[aout]`,
    '-map', '0:v:0', '-map', '[aout]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-shortest', '-movflags', '+faststart',
    tmpOut
  ];

  const t0 = Date.now();
  const proc = spawn(ffmpegBin, args);
  proc.on('close', code => {
    if (code === 0 && fs.existsSync(tmpOut)) {
      console.log(`🎉 HOÀN TẤT GHÉP VIDEO THỰC TẾ TRONG ${Date.now() - t0}ms! Kích thước: ${(fs.statSync(tmpOut).size / 1024 / 1024).toFixed(2)} MB`);
    } else {
      console.error('Error with code', code);
    }
  });
}

run();
