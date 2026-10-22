const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function dubUserVideo() {
  console.log('=== TEST DUBBING ON EXACT USER VIDEO 91774308 ===');
  const userVid = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/assets/91774308-8725-41a3-8db9-707e11d9f001.mp4');
  const ffmpeg = path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');

  if (!fs.existsSync(userVid)) {
    console.error('User video not found!');
    return;
  }

  // 1. Generate natural Vietnamese dialogue based on context: "tạo nhân vật nữ đang riview balo"
  const dialogue = 'Xin chào các bạn! Hôm nay mình sẽ review chi tiết chiếc ba lô siêu xinh và cực kỳ tiện lợi này cho các bạn cùng xem nhé.';
  console.log('[*] Contextual dialogue generated:', dialogue);

  // 2. Synthesize audio
  console.log('[*] Synthesizing Vietnamese audio...');
  // Split long sentences if needed, and fetch audio chunks
  async function fetchTts(text) {
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=vi&client=tw-ob`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    if (!res.ok) throw new Error('TTS fetch failed: ' + res.status);
    return Buffer.from(await res.arrayBuffer());
  }

  // Sentence splitting for clean natural pauses
  const sentences = dialogue.match(/[^.!?]+[.!?]+/g) || [dialogue];
  const audioParts = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed) {
      const part = await fetchTts(trimmed);
      audioParts.push(part);
    }
  }

  const mergedAudio = Buffer.concat(audioParts);
  const tempAudioPath = path.join(__dirname, '../scratch/test_balo_audio.mp3');
  const tempDubbedPath = path.join(__dirname, '../scratch/test_balo_dubbed.mp4');
  fs.writeFileSync(tempAudioPath, mergedAudio);
  console.log('Audio saved, size:', mergedAudio.length, 'bytes');

  // 3. Probe video duration
  let vidDuration = 8.0;
  const probeRes = spawnSync(ffmpeg, ['-i', userVid], { encoding: 'utf8' });
  const durMatch = probeRes.stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (durMatch) {
    vidDuration = parseFloat(durMatch[1]) * 3600 + parseFloat(durMatch[2]) * 60 + parseFloat(durMatch[3]);
  }
  console.log('[*] Video duration:', vidDuration, 'seconds');

  // Probe audio duration
  let audioDuration = 6.0;
  const aProbe = spawnSync(ffmpeg, ['-i', tempAudioPath], { encoding: 'utf8' });
  const aDurMatch = aProbe.stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (aDurMatch) {
    audioDuration = parseFloat(aDurMatch[1]) * 3600 + parseFloat(aDurMatch[2]) * 60 + parseFloat(aDurMatch[3]);
  }
  console.log('[*] Audio duration:', audioDuration, 'seconds');

  // Calculate tempo ratio to sync speech timing
  const targetDuration = Math.max(1.0, vidDuration - 0.4);
  const tempoRatio = audioDuration / targetDuration;
  const clampedTempo = Math.max(0.8, Math.min(1.35, tempoRatio));
  console.log('[*] Tempo ratio:', tempoRatio.toFixed(3), 'Clamped tempo:', clampedTempo.toFixed(3));

  // 4. Remux with FFmpeg: 100% audio replacement
  const ffmpegArgs = [
    '-y',
    '-i', userVid,
    '-i', tempAudioPath
  ];

  if (Math.abs(clampedTempo - 1.0) >= 0.04) {
    ffmpegArgs.push('-filter_complex', `[1:a]atempo=${clampedTempo.toFixed(3)},aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aout]`);
    ffmpegArgs.push('-map', '0:v:0', '-map', '[aout]');
  } else {
    ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');
  }

  ffmpegArgs.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', tempDubbedPath);

  const ffRes = spawnSync(ffmpeg, ffmpegArgs, { encoding: 'utf8' });
  if (fs.existsSync(tempDubbedPath) && fs.statSync(tempDubbedPath).size > 1000) {
    console.log('🎉 SUCCESS! Dubbed video created:', tempDubbedPath);
    console.log('Dubbed video size:', fs.statSync(tempDubbedPath).size, 'bytes');

    // Probe the new video to confirm audio track
    const checkRes = spawnSync(ffmpeg, ['-i', tempDubbedPath], { encoding: 'utf8' });
    const hasAudio = checkRes.stderr.includes('Audio: aac');
    console.log('Confirmed audio stream in dubbed video:', hasAudio);
  } else {
    console.error('FFmpeg remux failed:', ffRes.stderr);
  }
}

dubUserVideo();
