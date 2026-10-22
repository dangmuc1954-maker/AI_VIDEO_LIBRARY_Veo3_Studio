const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

async function testDub() {
  const vidPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/df6b4daf-b183-43be-b84d-1c91eb545efc.mp4';
  console.log('1. Checking vidPath:', vidPath, 'exists:', fs.existsSync(vidPath));

  const prompt = 'tạo cô gái riview balo';
  const vName = 'Ninh Đôn (Tiếng Việt - Nam Trầm ấm, truyền cảm)';
  const vId = 'aN7cv9yXNrfIR87bDmyD';

  // 1. Check dialogue generation
  function generateSmartVietnameseDialogue(rawPrompt, vidDuration, voiceName) {
    const p = (rawPrompt || "").toLowerCase();
    let isFemale = /nữ|gái|bạn nữ|cô gái|chị|em|bà|female|woman|girl/i.test(rawPrompt + " " + (voiceName || ""));
    let selfRef = "mình";

    if (/review|đánh giá|trải nghiệm|balo|túi|sách|điện thoại|áo|quần|giày|mỹ phẩm|son|đồng hồ|unboxing|đập hộp/i.test(p)) {
      let item = "chiếc ba lô";
      if (/balo|ba lô/i.test(p)) item = "chiếc ba lô";
      else if (/túi/i.test(p)) item = "chiếc túi xách";
      else if (/điện thoại/i.test(p)) item = "chiếc điện thoại";
      else if (/mỹ phẩm|son/i.test(p)) item = "sản phẩm làm đẹp";
      else if (/áo|quần|giày/i.test(p)) item = "mẫu trang phục";
      else item = "sản phẩm này";

      if (vidDuration <= 5) {
        return "Xin chào các bạn, chiếc " + item + " này thực sự rất xinh và tiện lợi nhé!";
      } else if (vidDuration <= 7) {
        return "Xin chào mọi người! Hôm nay " + selfRef + " sẽ review cho các bạn xem chiếc " + item + " siêu xinh và tiện lợi này nhé!";
      } else {
        return "Xin chào tất cả các bạn! Hôm nay " + selfRef + " rất vui được giới thiệu và review chi tiết chiếc " + item + " cực kỳ xinh xắn và tiện lợi này cho mọi người cùng xem nhé!";
      }
    }
    return "Xin chào mọi người!";
  }

  const sText = generateSmartVietnameseDialogue(prompt, 8.0, vName);
  console.log('2. Generated script:', sText);

  // 2. Synthesize audio
  async function synthesizeVietnameseVoice(text) {
    const sentences = (text.match(/[^.!?]+[.!?]+/g) || [text]).map(x => x.trim()).filter(Boolean);
    const chunks = [];
    for (const s of sentences) {
      const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(s) + "&tl=vi&client=tw-ob";
      console.log('Fetching TTS for chunk:', s);
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        chunks.push(Buffer.from(await res.arrayBuffer()));
      }
    }
    return Buffer.concat(chunks);
  }

  const aBuf = await synthesizeVietnameseVoice(sText);
  console.log('3. Audio buffer size:', aBuf.length);

  // 3. Test FFmpeg remux
  const tAudio = path.join(__dirname, 'temp_test_audio.mp3');
  const tVoiced = path.join(__dirname, 'temp_test_voiced.mp4');
  fs.writeFileSync(tAudio, aBuf);

  const args = [
    '-y',
    '-i', vidPath,
    '-i', tAudio,
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    tVoiced
  ];

  console.log('4. Running ffmpeg with args:', args);
  const p = spawn('ffmpeg', args);
  p.stderr.on('data', d => console.log('[ffmpeg err]', d.toString()));
  p.on('close', code => {
    console.log('5. FFmpeg exited with code:', code);
    if (fs.existsSync(tVoiced)) {
      console.log('6. Created voiced video size:', fs.statSync(tVoiced).size);
    }
  });
}

testDub().catch(e => console.error('Error:', e));
