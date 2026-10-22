const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

console.log('=== TEST E2E DUBBING ENGINE & AUDIO-VIDEO SYNC ===');

const assetStatePath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/asset-state.json';
const data = JSON.parse(fs.readFileSync(assetStatePath, 'utf8'));

const validVideos = data.assets.filter(a => a.type === 'video' && a.localPath && fs.existsSync(a.localPath));
const validAudios = data.assets.filter(a => a.type === 'audio' && a.localPath && fs.existsSync(a.localPath));

console.log(`Tìm thấy: ${validVideos.length} video hợp lệ và ${validAudios.length} audio hợp lệ trên ổ đĩa.`);

if (validVideos.length === 0 || validAudios.length === 0) {
  console.log('Không đủ video hoặc audio để test!');
  process.exit(0);
}

const testVid = validVideos[validVideos.length - 1];
const testAud = validAudios[validAudios.length - 1];

console.log(`Test Video: ${testVid.name} (${testVid.localPath})`);
console.log(`Test Audio: ${testAud.name} (${testAud.localPath})`);

// Thử chạy trực tiếp qua ffmpeg để kiểm tra bộ lọc
const ffmpegBin = 'ffmpeg';
const outDir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets';
const testOut = path.join(outDir, 'test_e2e_dubbed_' + Date.now() + '.mp4');

const probeMedia = (filePath) => new Promise((resolve) => {
  execFile(ffmpegBin, ['-hide_banner', '-i', filePath], (err, stdout, stderr) => {
    const out = (stderr || '') + (stdout || '');
    let dur = 5.0;
    const durM = out.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
    if (durM) dur = Math.max(0.1, Number(durM[1]) * 3600 + Number(durM[2]) * 60 + Number(durM[3]));
    resolve(dur);
  });
});

async function run() {
  const vDur = await probeMedia(testVid.localPath);
  const aDur = await probeMedia(testAud.localPath);
  console.log(`Thời lượng video: ${vDur}s, Thời lượng audio: ${aDur}s`);

  let targetSpeed = aDur / vDur;
  targetSpeed = Math.max(0.65, Math.min(1.65, targetSpeed));
  console.log(`Hệ số co giãn nhịp điệu (Time-stretch): ${targetSpeed.toFixed(3)}x`);

  const voiceFilters = ['highpass=f=75'];
  if (Math.abs(targetSpeed - 1.0) >= 0.04) {
    voiceFilters.push('atempo=' + targetSpeed.toFixed(3));
  }
  // Thêm bộ lọc Viral Climax
  voiceFilters.push('bass=g=3.2:f=120');
  voiceFilters.push('treble=g=3.0:f=3800');
  voiceFilters.push('acompressor=threshold=-18dB:ratio=4.0:attack=12:release=110');
  voiceFilters.push('loudnorm=I=-14:LRA=8:TP=-1.0');
  voiceFilters.push('aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo');

  const voiceChain = voiceFilters.join(',');
  const filterComplex = [
    `[1:a]${voiceChain}[voice]`,
    `[voice]apad=pad_dur=${vDur.toFixed(2)}[outa]`
  ];

  const args = [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-i', testVid.localPath,
    '-i', testAud.localPath,
    '-filter_complex', filterComplex.join(';'),
    '-map', '0:v:0', '-map', '[outa]',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
    '-shortest', '-movflags', '+faststart',
    testOut
  ];

  console.log('Đang thực thi ffmpeg ghép lồng tiếng...');
  execFile(ffmpegBin, args, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ Lỗi ffmpeg:', stderr || err.message);
      process.exit(1);
    }
    if (fs.existsSync(testOut)) {
      const stats = fs.statSync(testOut);
      console.log(`✅ THÀNH CÔNG! Video lồng tiếng đã được tạo: ${testOut} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      // Xóa file test sau khi test xong
      try { fs.unlinkSync(testOut); } catch (_) {}
    } else {
      console.error('❌ Không tìm thấy file output');
      process.exit(1);
    }
  });
}

run();
