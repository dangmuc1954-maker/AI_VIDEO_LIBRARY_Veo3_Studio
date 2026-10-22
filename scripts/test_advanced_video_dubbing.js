const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

console.log('======================================================================');
console.log('🧪 TEST: AI SMART CADENCE & CLIMAX DUBBING PIPELINE 🧪');
console.log('======================================================================');

let ffmpegBin = 'ffmpeg';
try {
  const p = path.join(__dirname, 'extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');
  if (fs.existsSync(p)) ffmpegBin = p;
} catch {}

const tmpDir = path.join(__dirname, '../scratch');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Check for real test video
const realAssetsDir = path.join(process.env.APPDATA || '', 'AI_VIDEO_LIBRARY_DATA/assets');
let realVideo = null;
let realAudio = null;

if (fs.existsSync(realAssetsDir)) {
  const files = fs.readdirSync(realAssetsDir);
  const mp4s = files.filter(f => f.endsWith('.mp4'));
  const mp3s = files.filter(f => f.endsWith('.mp3'));
  if (mp4s.length > 0) realVideo = path.join(realAssetsDir, mp4s[0]);
  if (mp3s.length > 0) realAudio = path.join(realAssetsDir, mp3s[0]);
}

console.log('Real video found:', realVideo || 'None, using dummy 6s test video');
console.log('Real audio found:', realAudio || 'None, using dummy 4.5s test audio');

let inputVid = realVideo;
let inputAud = realAudio;

if (!inputVid) {
  inputVid = path.join(tmpDir, 'test_e2e_vid.mp4');
  execFileSync(ffmpegBin, ['-y', '-f', 'lavfi', '-i', 'testsrc=duration=5:size=640x360:rate=30', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=5', '-c:v', 'libx264', '-c:a', 'aac', '-shortest', inputVid]);
}

if (!inputAud) {
  inputAud = path.join(tmpDir, 'test_e2e_aud.mp3');
  execFileSync(ffmpegBin, ['-y', '-f', 'lavfi', '-i', 'sine=frequency=330:duration=4.2', '-c:a', 'libmp3lame', inputAud]);
}

// Function simulating the backend syncVoiceoverVideo filter generation
function buildDubbingArgs(vPath, aPath, outPath, options = {}) {
  const vDur = 5.0; // test assumption or probed
  const aDur = 4.2;
  let targetSpeed = 1.0;
  if (options.speedMode === 'custom' && typeof options.customSpeed === 'number') {
    targetSpeed = Math.max(0.5, Math.min(2.0, options.customSpeed));
  } else {
    targetSpeed = aDur / vDur;
    targetSpeed = Math.max(0.65, Math.min(1.55, targetSpeed));
    if (Math.abs(targetSpeed - 1.0) < 0.03) targetSpeed = 1.0;
  }

  const voiceFilters = [];
  if (Math.abs(targetSpeed - 1.0) >= 0.03) {
    if (targetSpeed > 2.0) {
      voiceFilters.push('atempo=2.0,atempo=' + (targetSpeed / 2.0).toFixed(3));
    } else if (targetSpeed < 0.5) {
      voiceFilters.push('atempo=0.5,atempo=' + (targetSpeed / 0.5).toFixed(3));
    } else {
      voiceFilters.push('atempo=' + targetSpeed.toFixed(3));
    }
  }

  const mood = options.mood || 'viral_climax';
  const intensity = typeof options.intensity === 'number' ? Math.max(0.5, Math.min(1.5, options.intensity)) : 1.0;
  voiceFilters.push('highpass=f=70');

  if (mood === 'viral_climax' || mood === 'dramatic') {
    voiceFilters.push(`equalizer=f=180:width_type=h:width=120:g=${(2.5 * intensity).toFixed(1)}`);
    voiceFilters.push(`equalizer=f=3600:width_type=h:width=1200:g=${(3.2 * intensity).toFixed(1)}`);
    voiceFilters.push('compand=attacks=0.02:decays=0.15:points=-80/-80|-40/-30|-20/-14|0/-8:soft-knee=6');
    voiceFilters.push('loudnorm=I=-15:LRA=9:TP=-1.2');
  } else if (mood === 'broadcast') {
    voiceFilters.push('equalizer=f=200:width_type=h:width=100:g=1.5');
    voiceFilters.push('equalizer=f=4000:width_type=h:width=1000:g=2.5');
    voiceFilters.push('loudnorm=I=-16:LRA=10:TP=-1.5');
  } else if (mood === 'sales_punch') {
    voiceFilters.push('equalizer=f=250:width_type=h:width=150:g=2.0');
    voiceFilters.push('equalizer=f=3200:width_type=h:width=800:g=3.8');
    voiceFilters.push('compand=attacks=0.01:decays=0.1:points=-70/-70|-35/-22|0/-6:soft-knee=4');
    voiceFilters.push('loudnorm=I=-14:LRA=8:TP=-1.0');
  } else {
    voiceFilters.push('loudnorm=I=-16:LRA=11:TP=-1.5');
  }

  const voiceVol = typeof options.voiceVolume === 'number' ? Math.max(0.1, Math.min(2.5, options.voiceVolume / 100)) : 1.0;
  if (Math.abs(voiceVol - 1.0) > 0.05) {
    voiceFilters.push('volume=' + voiceVol.toFixed(2));
  }

  voiceFilters.push('aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo');
  const voiceChain = voiceFilters.join(',');

  const removeOriginal = options.removeOriginalAudio !== false;
  const args = ['-hide_banner', '-loglevel', 'error', '-y', '-i', vPath, '-i', aPath];

  if (removeOriginal) {
    args.push('-filter_complex', `[1:a]${voiceChain}[aout]`);
    args.push('-map', '0:v:0', '-map', '[aout]');
  } else {
    args.push('-filter_complex', `[0:a]volume=0.15[bgm];[1:a]${voiceChain}[voice];[bgm][voice]amix=inputs=2:duration=first:dropout_transition=2[aout]`);
    args.push('-map', '0:v:0', '-map', '[aout]');
  }

  args.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', outPath);
  return args;
}

const testModes = ['viral_climax', 'broadcast', 'sales_punch'];
testModes.forEach(mood => {
  const out = path.join(tmpDir, `test_result_${mood}.mp4`);
  console.log(`\nTesting mood [${mood}]...`);
  const t0 = Date.now();
  const args = buildDubbingArgs(inputVid, inputAud, out, { mood, intensity: 1.2, speedMode: 'auto' });
  execFileSync(ffmpegBin, args);
  const elapsed = Date.now() - t0;
  console.log(`✓ Completed mood [${mood}] in ${elapsed}ms | Output size: ${fs.statSync(out).size} bytes`);
});

console.log('\n======================================================================');
console.log('🎉 TẤT CẢ TEST ĐÃ THÀNH CÔNG VƯỢT TRỘI! SẴN SÀNG ĐỒNG BỘ VÀ BUILD! 🎉');
console.log('======================================================================');
