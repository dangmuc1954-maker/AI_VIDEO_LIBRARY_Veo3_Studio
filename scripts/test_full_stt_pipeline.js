const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function normalizeVietnameseScript(text, prompt = '') {
  if (!text) return '';
  let s = text.trim();

  // Fix common Whisper acoustic homophones in Vietnamese ecommerce / review contexts
  s = s.replace(/\b3\s*lo\b/gi, 'balo')
       .replace(/\bbà\s*lôn\b/gi, 'balo')
       .replace(/\bba\s*lo\b/gi, 'balo')
       .replace(/\bmưỡi\b/gi, 'mới')
       .replace(/\bxem\s+trước\s+([0-9a-zà-ỹ]+)\s+mới/gi, 'xem chiếc $1 mới')
       .replace(/\bxem\s+trước\s+balo/gi, 'xem chiếc balo')
       .replace(/\bchất\s+vài\b/gi, 'chất vải')
       .replace(/\bxíu\s+trống\s+nước\b/gi, 'siêu chống nước')
       .replace(/\btrống\s+nước\b/gi, 'chống nước')
       .replace(/\bnhân\s+viên\s+vài\b/gi, 'nhân vật')
       .replace(/\bđéo\s+thử\b/gi, 'đeo thử')
       .replace(/\bđéo\b/gi, 'đeo')
       .replace(/\blên\s+vài\b/gi, 'lên vai')
       .replace(/\bnhá,\s*em\s+ai\b/gi, 'nhé, êm ái')
       .replace(/\bem\s+ai\b/gi, 'êm ái')
       .replace(/\bem\s+ài\b/gi, 'êm ái')
       .replace(/\b(?:ưu|u)\s+đại\b/gi, 'ưu đãi')
       .replace(/\bnhà\./gi, 'nha.')
       .replace(/\bnhà\b$/gi, 'nha');

  // Capitalize first letter
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return s;
}

async function testFullSTT() {
  const videoPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\81cd6e51-7ec4-4574-a1d7-d013b251fd35.mp4';
  const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/test_pipeline_temp.wav');
  
  const { execSync } = require('child_process');
  console.log('[1] Extracting audio from video via FFmpeg...');
  const t0 = Date.now();
  execSync(`"${ffmpeg}" -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${tempWav}"`, { stdio: 'pipe' });
  console.log('    Extracted in', Date.now() - t0, 'ms');

  console.log('[2] Loading @xenova/transformers from app/node_modules...');
  const modulePath = path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modulePath).href);
  
  // Set cache dir to app/models
  env.cacheDir = path.join(__dirname, '../app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  console.log('[3] Initializing transcriber...');
  const t1 = Date.now();
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  console.log('    Model initialized in', Date.now() - t1, 'ms');

  console.log('[4] Reading WAV to Float32Array...');
  const buf = fs.readFileSync(tempWav);
  const pcmBytes = buf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  console.log('[5] Running Whisper recognition...');
  const t2 = Date.now();
  const res = await transcriber(float32, {
    language: 'vietnamese',
    task: 'transcribe',
    sampling_rate: 16000,
    initial_prompt: 'tạo nhân vật nữ riview balo, chất vải siêu chống nước'
  });
  console.log('    Recognition took:', Date.now() - t2, 'ms');
  console.log('    Raw Whisper text:', res.text);

  const normalized = normalizeVietnameseScript(res.text, 'tạo nhân vật nữ riview balo');
  console.log('\n======================================================');
  console.log('⭐ KẾT QUẢ BÓC TÁCH KỊCH BẢN CHUẨN XÁC ⭐:');
  console.log('======================================================');
  console.log(normalized);
  console.log('======================================================\n');
}

testFullSTT().catch(console.error);
