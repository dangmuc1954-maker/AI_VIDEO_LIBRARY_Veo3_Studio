const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { execSync } = require('child_process');

function normalizeVietnameseScript(text) {
  if (!text) return '';
  let s = text.trim();

  s = s.replace(/3\s*lo|bà\s*lôn|ba\s*lo|balon/gi, "balo")
       .replace(/mưỡi/gi, "mới")
       .replace(/chứt\s+kế/gi, "thiết kế")
       .replace(/chức\s+kế/gi, "thiết kế")
       .replace(/rút\s+đổi\s+trạy/gi, "tốc độ chạy")
       .replace(/rút\s+đổi/gi, "tốc độ")
       .replace(/các\s+bòn/gi, "carbon")
       .replace(/các\s+bon/gi, "carbon")
       .replace(/siêu\s+bên/gi, "siêu bền")
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
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }
  return s;
}

async function testFullPipeline() {
  const videoPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\31a0165a-3b44-4445-b05a-84ea4f11be9e.mp4';
  const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/test_pipeline_user.wav');

  console.log('[1] Trích xuất âm thanh từ video bằng FFmpeg...');
  execSync(`"${ffmpeg}" -hide_banner -loglevel error -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${tempWav}"`);
  console.log('    ✓ Trích xuất xong WAV:', fs.statSync(tempWav).size, 'bytes');

  console.log('[2] Đọc dữ liệu audio PCM sang Float32Array...');
  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }
  console.log('    ✓ Float32 length:', float32.length);

  console.log('[3] Nạp model Whisper Speech-to-Text...');
  const modPath = path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js');
  const { pipeline, env } = await import(pathToFileURL(modPath).href);

  env.cacheDir = path.join(__dirname, '../app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  const transcriber = await pipeline("automatic-speech-recognition", "Xenova/whisper-base");

  console.log('[4] Nhận diện giọng nói tiếng Việt từ âm thanh video...');
  const out = await transcriber(float32, {
    language: "vietnamese",
    task: "transcribe",
    sampling_rate: 16000
  });

  console.log('    Raw Whisper:', out.text);
  const finalScript = normalizeVietnameseScript(out.text);

  console.log('\n======================================================');
  console.log('🎯 KỊCH BẢN THOẠI ĐƯỢC BÓC TÁCH TỪ ÂM THANH VIDEO:');
  console.log('======================================================');
  console.log(finalScript);
  console.log('======================================================\n');
}

testFullPipeline().catch(console.error);
