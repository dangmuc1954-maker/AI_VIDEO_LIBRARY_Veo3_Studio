const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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
    else item = "sản phẩm";

    if (vidDuration <= 5) {
      return `Xin chào các bạn, hôm nay ${selfRef} sẽ review ${item} siêu xinh và tiện lợi này nhé!`;
    } else if (vidDuration <= 7) {
      return `Xin chào tất cả các bạn, hôm nay ${selfRef} rất hào hứng review cho mọi người ${item} cực kỳ tiện lợi và thời trang này nhé!`;
    } else {
      return `Xin chào tất cả các bạn! Hôm nay ${selfRef} rất vui được giới thiệu và review chi tiết ${item} siêu xinh xắn, thiết kế hiện đại và cực kỳ tiện lợi này cho mọi người cùng xem nhé!`;
    }
  }

  if (/cà phê|cafe|quán|ăn|món|ẩm thực|nấu|food|coffee|nước/i.test(p)) {
    if (vidDuration <= 5) {
      return `Chào các bạn, hôm nay ${selfRef} vừa ghé một quán cà phê siêu chill đồ uống cực ngon nè!`;
    } else if (vidDuration <= 7) {
      return `Xin chào mọi người, hôm nay ${selfRef} khám phá được một góc quán cực kỳ đẹp và đồ uống thơm ngon, cùng xem nhé!`;
    } else {
      return `Xin chào tất cả các bạn! Hôm nay ${selfRef} vừa tìm được một không gian quán siêu chill với những món đồ uống tuyệt hảo, các bạn cùng theo chân mình trải nghiệm nhé!`;
    }
  }

  if (/công nghệ|ai|trí tuệ nhân tạo|tài chính|chứng khoán|đầu tư|thị trường|tin tức|tech|finance|news/i.test(p)) {
    if (vidDuration <= 5) {
      return "Xin chào quý vị, đây là những cập nhật công nghệ và xu hướng mới nhất hôm nay.";
    } else if (vidDuration <= 7) {
      return "Xin chào quý vị và các bạn! Chào mừng quý vị đến với bản tin tổng hợp các đột phá công nghệ và cơ hội thị trường mới nhất.";
    } else {
      return "Xin chào quý vị và các bạn! Chào mừng mọi người quay trở lại, hôm nay chúng ta sẽ cùng phân tích những chuyển động nổi bật nhất của thị trường công nghệ và trí tuệ nhân tạo hiện nay.";
    }
  }

  if (/du lịch|khám phá|vlog|ngoại ô|phố|biển|núi|chuyến đi|travel/i.test(p)) {
    if (vidDuration <= 5) {
      return `Chào mọi người, cảnh sắc ở đây thực sự quá tuyệt vời và thơ mộng luôn nè!`;
    } else if (vidDuration <= 7) {
      return `Xin chào tất cả các bạn, chuyến đi hôm nay của ${selfRef} có rất nhiều cảnh đẹp và bất ngờ thú vị!`;
    } else {
      return `Xin chào tất cả mọi người! Hãy cùng theo chân ${selfRef} trong hành trình khám phá ngày hôm nay, phong cảnh nơi đây thực sự quá hùng vĩ và tuyệt vời các bạn ạ!`;
    }
  }

  if (vidDuration <= 5) {
    return "Xin chào tất cả các bạn, chào mừng các bạn đã đến với video ngày hôm nay!";
  } else if (vidDuration <= 7) {
    return "Xin chào mọi người! Rất vui được gặp lại các bạn trong video hôm nay, chúc mọi người một ngày thật nhiều năng lượng!";
  } else {
    return "Xin chào tất cả các bạn! Chào mừng các bạn đã quay trở lại với video ngày hôm nay, hãy cùng mình theo dõi những điều thú vị ngay sau đây nhé!";
  }
}

async function synthesizeVietnameseVoice(text) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const audioChunks = [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(trimmed) + "&tl=vi&client=tw-ob";
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    if (!res.ok) throw new Error("Voice synth rejected: " + res.status);
    audioChunks.push(Buffer.from(await res.arrayBuffer()));
  }
  return Buffer.concat(audioChunks);
}

async function testFullPipeline() {
  console.log('=== TEST FULL RESILIENT PIPELINE ===');
  const userVid = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA/assets/91774308-8725-41a3-8db9-707e11d9f001.mp4');
  const ffmpeg = path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');

  const dialogue = generateSmartVietnameseDialogue('tạo nhân vật nữ đang riview balo', 8.0, '★ ★ em gais xinh');
  console.log('Generated dialogue:', dialogue);

  const audioBuf = await synthesizeVietnameseVoice(dialogue);
  console.log('Synthesized audio buffer bytes:', audioBuf.length);

  const testAudio = path.join(__dirname, '../scratch/test_pipeline_audio.mp3');
  const testOutput = path.join(__dirname, '../scratch/test_pipeline_out.mp4');
  fs.writeFileSync(testAudio, audioBuf);

  // Probe durations
  let vidDuration = 8.0;
  const p1 = spawnSync(ffmpeg, ['-i', userVid], { encoding: 'utf8' });
  const m1 = p1.stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (m1) vidDuration = parseFloat(m1[1])*3600 + parseFloat(m1[2])*60 + parseFloat(m1[3]);

  let audioDuration = 8.0;
  const p2 = spawnSync(ffmpeg, ['-i', testAudio], { encoding: 'utf8' });
  const m2 = p2.stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (m2) audioDuration = parseFloat(m2[1])*3600 + parseFloat(m2[2])*60 + parseFloat(m2[3]);

  const targetDuration = Math.max(1.0, vidDuration - 0.4);
  const tempoRatio = audioDuration / targetDuration;
  const clampedTempo = Math.max(0.75, Math.min(1.45, tempoRatio));

  console.log(`Video: ${vidDuration}s, Audio: ${audioDuration}s, Clamped tempo: ${clampedTempo.toFixed(3)}`);

  const ffmpegArgs = [
    '-y',
    '-i', userVid,
    '-i', testAudio
  ];

  if (Math.abs(clampedTempo - 1.0) >= 0.04) {
    ffmpegArgs.push('-filter_complex', `[1:a]atempo=${clampedTempo.toFixed(3)},aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[aout]`);
    ffmpegArgs.push('-map', '0:v:0', '-map', '[aout]');
  } else {
    ffmpegArgs.push('-map', '0:v:0', '-map', '1:a:0');
  }

  ffmpegArgs.push('-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', testOutput);

  const res = spawnSync(ffmpeg, ffmpegArgs, { encoding: 'utf8' });
  if (fs.existsSync(testOutput) && fs.statSync(testOutput).size > 1000) {
    console.log('✅ Pipeline Test SUCCESSFUL! Video created:', fs.statSync(testOutput).size, 'bytes');
  } else {
    console.error('❌ Pipeline Test Failed:', res.stderr);
  }
}

testFullPipeline();
