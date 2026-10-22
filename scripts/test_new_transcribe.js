const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function testNewTranscribe() {
  const videoPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\beb1cd1a-347f-4d27-a0ef-99f5648ce351.mp4';
  const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
  const tempWav = path.join(__dirname, '../scratch/test_new_beb.wav');

  execSync(`"${ffmpeg}" -hide_banner -loglevel error -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${tempWav}"`);

  const wavBuf = fs.readFileSync(tempWav);
  const pcmBytes = wavBuf.subarray(44);
  const float32 = new Float32Array(pcmBytes.length / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = pcmBytes.readInt16LE(i * 2) / 32768.0;
  }

  const modPath = path.join(__dirname, '../app/node_modules/@xenova/transformers/src/transformers.js');
  const { pathToFileURL } = require('url');
  const { pipeline, env } = await import(pathToFileURL(modPath).href);

  env.cacheDir = path.join(__dirname, '../app/models');
  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  const out = await transcriber(float32, { language: 'vietnamese', task: 'transcribe', sampling_rate: 16000 });

  console.log('Raw Whisper text:', out.text);

  let s = out.text.trim();
  s = s.replace(/(?<![\p{L}\p{N}])cả\s+nhà(?![\\p{L}\\p{N}])/giu, '__CA_NHA__');

  const rep = (pat, repl) => {
    const re = new RegExp("(?<![\\p{L}\\p{N}])" + pat + "(?![\\p{L}\\p{N}])", "giu");
    s = s.replace(re, repl);
  };

  // 1. Lời chào mở đầu (Greetings)
  rep('(?:trong|chong|choang|cho|chúng)\\s+mình\\s+các\\s+bạn', 'Chào mừng các bạn');
  rep('(?:trong|chong|choang|cho|chúng)\\s+mình\\s+mọi\\s+người', 'Chào mừng mọi người');
  rep('xin\\s+chào\\s+các\\s+bạn\\s+đã\\s+quay\\s+trở\\s+lại', 'Chào mừng các bạn đã quay trở lại');

  // 2. Chủ ngữ & Đối tượng (Subjects & Product Names)
  rep('chia\\s+sẻ\\s+này', 'chiếc xe này');
  rep('chia\\s+sẻ(?=\\s+(?:này|đạp|chạy|đi|có|rất|được))', 'chiếc xe');
  rep('3\\s*lo|bà\\s*lôn|ba\\s*lo|balon', 'balo');
  rep('xem\\s+trước\\s+([0-9a-zà-ỹ]+)\\s+mới', 'xem chiếc $1 mới');
  rep('(?:xem|review|riview)\\s+trước\\s+([0-9a-zà-ỹ]+)', 'review chiếc $1');
  rep('xem\\s+trước', 'xem chiếc');
  rep('riview|reviu', 'review');
  rep('chứt\\s+kế|chức\\s+kế|chất\\s+kế', 'thiết kế');
  rep('khung\\s+sửa|khung\\s+sữa|khung\\s+sưa', 'khung sườn');
  rep('các\\s+bòn|các\\s+bon|cacbon|khung\\s+các\\s+bòn', 'carbon');
  rep('siêu\\s+bên', 'siêu bền');
  rep('mưỡi|mỡi', 'mới');
  rep('rút\\s+đổi\\s+trạy|rút\\s+đổi\\s+chạy', 'tốc độ chạy');
  rep('rút\\s+đổi', 'tốc độ');
  rep('trạy', 'chạy');
  rep('chất\\s+vài|chất\\s+liệu\\s+vài', 'chất liệu vải');
  rep('chúng\\s+nước|xíu\\s+trống\\s+nước|trống\\s+nước', 'chống nước');
  rep('xíu(?=\\s+(?:chống|đẹp|nhẹ|bền|nhanh|mượt|êm))', 'siêu');
  rep('đ[eé]o\\s+thử', 'đeo thử');
  rep('đ[eé]o(?=\\s+(?:thử|lên|vào|chiếc|balo|tai|vai))', 'đeo');
  rep('(?:lên|trên)\\s+vài', 'lên vai');
  rep('em\\s+ai|em\\s+ài', 'êm ái');
  rep('ưu\\s+đại|u\\s+đại', 'ưu đãi');
  rep('linh\\s+mua\\s+hàng', 'link mua hàng');
  rep('linh\\s+bên\\s+dưới', 'link bên dưới');
  rep('dộng\\s+giải|rộng\\s+giải', 'rộng rãi');
  rep('nhân\\s+viên\\s+vài', 'nhân vật');
  rep('tai\\s+nghé', 'tai nghe');
  rep('điện\\s+thoai', 'điện thoại');
  rep('xe\\s+đập', 'xe đạp');
  rep('kết\\s+l\\s*nối', 'kết nối');
  rep('bảo\\s+hanh', 'bảo hành');
  rep('khuyên\\s+mãi|khuyễn\\s+mãi', 'khuyến mãi');
  rep('chính\\s+hang', 'chính hãng');

  // 3. Lời kết video & Kêu gọi hành động (Call To Action)
  rep('nhớ\\s+bấm\\s+follow\\s+mình\\s+nhá', 'nhớ bấm follow mình nhé');
  rep('nhớ\\s+follow\\s+kênh\\s+để\\s+xem\\s+thêm\\s+nhá', 'nhớ follow kênh để xem thêm nhé');
  rep('đăng\\s+kí', 'đăng ký');
  rep('nhá(?=[,.!?]|$)', 'nhé');
  rep('nhà(?=[,.!?]|$)', 'nha');

  s = s.replace(/__CA_NHA__/g, 'cả nhà');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/([.?!])\s*(\p{L})/gu, (_, p1, p2) => p1 + ' ' + p2.toUpperCase());
  if (s.length > 0) {
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.!?]$/.test(s)) s += '.';
  }

  console.log('\n======================================================');
  console.log('⭐ KẾT QUẢ SAU KHI CHUẨN HÓA:');
  console.log(s);
  console.log('======================================================\n');
}

testNewTranscribe().catch(console.error);
