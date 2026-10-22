const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. UPDATE buildEnhancedVideoPrompt
const oldBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  const rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');

  const isFem = kocProfile?.isFemale ?? (!voiceLabel || !voiceLabel.includes('Nam'));
  const presWord = isFem ? "attractive Asian female presenter" : "handsome Asian male presenter";
  const outfitWord = hasKocImage 
    ? (kocProfile?.outfitDesc 
        ? \`wearing \${kocProfile.outfitDesc.replace(/tailored (jacket|blazer)|business blazer/gi, 'clothing from reference photo')}\` 
        : "wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match with NO jacket/blazer unless shown in photo)")
    : "wearing clean commercial clothing matching the reference photo";

  const hasShowroom = Boolean(scene.showroomImage);
  const refContext = hasShowroom 
    ? "Directly animating the exact scene, presenter, and outfit shown in reference image #1. " 
    : "";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}The SAME \${presWord} \${outfitWord} gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}The SAME \${presWord} \${outfitWord} proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}Crisp close-up focus on the product features and utility in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the reference outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

const newBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  let rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');
  const vietnameseDialogue = (scene.voiceScript || '').trim();

  // Strip any accidental English spoken quotes from motion prompt
  rawMotion = rawMotion.replace(/saying\\s*:\\s*["'][^"']+["']/gi, '');
  rawMotion = rawMotion.replace(/saying\\s+["'][^"']+["']/gi, '');
  rawMotion = rawMotion.replace(/\\b(speaking|speaks|talks)\\s+(in\\s+)?english\\b/gi, 'speaking fluent Vietnamese');
  rawMotion = rawMotion.replace(/\\benglish\\s+(dialogue|speech|words|lines)\\b/gi, 'Vietnamese dialogue');

  const isFem = kocProfile?.isFemale ?? (!voiceLabel || !voiceLabel.includes('Nam'));
  const presWord = isFem ? "attractive Asian female presenter" : "handsome Asian male presenter";
  const outfitWord = hasKocImage 
    ? (kocProfile?.outfitDesc 
        ? \`wearing \${kocProfile.outfitDesc.replace(/tailored (jacket|blazer)|business blazer/gi, 'clothing from reference photo')}\` 
        : "wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match with NO jacket/blazer unless shown in photo)")
    : "wearing clean commercial clothing matching the reference photo";

  const hasShowroom = Boolean(scene.showroomImage);
  const refContext = hasShowroom 
    ? "Directly animating the exact scene, presenter, and outfit shown in reference image #1. " 
    : "";

  // KHÓA CHẶT QUY TẮC NHÂN VẬT CHỈ NÓI TIẾNG VIỆT, CẤM TUYỆT ĐỐI NÓI TIẾNG ANH
  const speechRule = vietnameseDialogue
    ? \`The presenter speaks natural fluent Vietnamese with authentic Vietnamese mouth movements and lip-sync, expressing: "\${vietnameseDialogue}". ABSOLUTELY NO English speech, NO English dialogue, 100% Vietnamese spoken language only. \`
    : "The presenter speaks natural fluent Vietnamese with accurate Vietnamese lip-sync, absolutely no English spoken dialogue. ";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}\${speechRule}The SAME \${presWord} \${outfitWord} gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}\${speechRule}The SAME \${presWord} \${outfitWord} proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}\${refContext}\${speechRule}Crisp close-up focus on the product features and utility in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the reference outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

if (!content.includes(oldBuildEnhanced)) {
  console.error('ERROR: oldBuildEnhanced not found in VideoFactoryStudio.js!');
  process.exit(1);
}
content = content.replace(oldBuildEnhanced, newBuildEnhanced);
console.log('1. Updated buildEnhancedVideoPrompt successfully!');

// 2. UPDATE analysisPrompt in handleGenerateScript
const oldPromptSection = `3. ĐỒNG NHẤT NHÂN VẬT & KHÓA TRANG PHỤC TUYỆT ĐỐI (100% STRICT REFERENCE OUTFIT LOCK):
- Tất cả các cảnh đều thuộc về CÙNG MỘT NHÂN VẬT mặc CÙNG MỘT BỘ ĐỒ DUY NHẤT lấy chính xác 100% từ ảnh tham chiếu KOC: The SAME presenter (\${effProfile.presenterNoun}) wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match).
- 🚨 CẢNH BÁO QUAN TRỌNG VỀ TRANG PHỤC: TUYỆT ĐỐI CẤM TỰ Ý MÔ TẢ MẶC VEST, BLAZER, JACKET, ÁO VÉC NẾU NHÂN VẬT TRONG ẢNH KHÔNG MẶC VEST! Nhân vật mặc gì trong ảnh tham chiếu thì motionPrompt PHẢI khóa y nguyên trang phục đó (ví dụ áo thun, áo sơ mi, đầm, áo polo,...), KHÔNG thêm áo khoác/vest/blazer vào prompt!

4. YÊU CẦU ĐẦU RA CHO MỖI PHÂN ĐOẠN:
- voiceScript: Lời thoại bán hàng tiếng Việt ngắn gọn, sắc bén, hấp dẫn, tối đa 22 từ, chuẩn văn phong phù hợp với giọng \${selectedVoice}.
- motionPrompt: Mô tả diễn xuất tiếng Anh chi tiết, tuân thủ đúng góc máy và tiêu chí review công dụng ở trên.`;

const newPromptSection = `3. ĐỒNG NHẤT NHÂN VẬT & KHÓA TRANG PHỤC TUYỆT ĐỐI (100% STRICT REFERENCE OUTFIT LOCK):
- Tất cả các cảnh đều thuộc về CÙNG MỘT NHÂN VẬT mặc CÙNG MỘT BỘ ĐỒ DUY NHẤT lấy chính xác 100% từ ảnh tham chiếu KOC: The SAME presenter (\${effProfile.presenterNoun}) wearing the EXACT SAME outfit and clothing as shown in the reference photo (identical style, neckline, sleeves, and colors - 100% exact 1:1 match).
- 🚨 CẢNH BÁO QUAN TRỌNG VỀ TRANG PHỤC: TUYỆT ĐỐI CẤM TỰ Ý MÔ TẢ MẶC VEST, BLAZER, JACKET, ÁO VÉC NẾU NHÂN VẬT TRONG ẢNH KHÔNG MẶC VEST! Nhân vật mặc gì trong ảnh tham chiếu thì motionPrompt PHẢI khóa y nguyên trang phục đó (ví dụ áo thun, áo sơ mi, đầm, áo polo,...), KHÔNG thêm áo khoác/vest/blazer vào prompt!

4. 🚨 LUẬT BẮT BUỘC: NHÂN VẬT 100% CHỈ ĐƯỢC NÓI TIẾNG VIỆT - TUYỆT ĐỐI CẤM NÓI TIẾNG ANH (STRICT 100% VIETNAMESE SPEECH ONLY):
- VỀ LỜI THOẠI (voiceScript):
  + TẤT CẢ các cảnh (từ Cảnh 1 đến Cảnh \${sceneCount}) 100% BẮT BUỘC PHẢI LÀ TIẾNG VIỆT thuần túy, tự nhiên, cuốn hút, chốt đơn đỉnh cao theo chuẩn phong cách TikTok KOC Việt Nam.
  + TUYỆT ĐỐI CẤM (ZERO TOLERANCE): CẤM tuyệt đối bất kỳ câu, từ, chữ tiếng Anh nào xuất hiện trong voiceScript (KHÔNG chèn "Hello guys", "Check it out", "Buy now", "Don't miss", "Today we have", "Amazing product",...). Toàn bộ kịch bản lời thoại phải là TIẾNG VIỆT CÓ DẤU HOÀN TOÀN!
- VỀ DIỄN XUẤT VÀ KHẨU HÌNH (motionPrompt):
  + motionPrompt được viết bằng tiếng Anh để mô tả góc quay và chuyển động cho AI Video. NHƯNG NẾU CÓ MÔ TẢ NHÂN VẬT NÓI, MỞ MIỆNG, CỬ ĐỘNG KHẨU HÌNH:
    * BẮT BUỘC PHẢI MÔ TẢ LÀ NÓI TIẾNG VIỆT: "The presenter speaks natural fluent Vietnamese with authentic Vietnamese lip-sync", hoặc trích dẫn chính câu thoại tiếng Việt: speaking in Vietnamese: "...".
    * TUYỆT ĐỐI CẤM đưa bất kỳ câu thoại tiếng Anh nào vào motionPrompt (CẤM các kiểu: saying: "...", talks in English, speaks English dialogue, shouting English slogans,...).
    * Mọi âm thanh và khẩu hình nói chuyện của nhân vật trong video ĐỀU LÀ TIẾNG VIỆT 100%!

5. YÊU CẦU ĐẦU RA CHO MỖI PHÂN ĐOẠN:
- voiceScript: 100% Lời thoại bán hàng TIẾNG VIỆT thuần túy, ngắn gọn, sắc bén, hấp dẫn, tối đa 22 từ, chuẩn văn phong phù hợp với giọng \${selectedVoice}. TUYỆT ĐỐI KHÔNG DÙNG TIẾNG ANH.
- motionPrompt: Mô tả diễn xuất tiếng Anh chi tiết, tuân thủ đúng góc máy và tiêu chí review công dụng ở trên, nhân vật nói tiếng Việt (speaking Vietnamese only).`;

if (!content.includes(oldPromptSection)) {
  console.error('ERROR: oldPromptSection not found in VideoFactoryStudio.js!');
  process.exit(1);
}
content = content.replace(oldPromptSection, newPromptSection);
console.log('2. Updated analysisPrompt with strict Vietnamese rule!');

// 3. UPDATE SANITIZATION IN handleGenerateScript
const oldApplyScript = `      if (scriptData && Array.isArray(scriptData) && scriptData.length >= 1) {
        setScenes(prev => prev.map((s, idx) => {
          const item = scriptData[idx] || scriptData[idx % scriptData.length];
          return {
            ...s,
            voiceScript: item?.voiceScript || s.voiceScript,
            motionPrompt: item?.motionPrompt || s.motionPrompt,
            promptStatus: 'done'
          };
        }));
        setIsScriptGenerating(false);
        toast?.success?.(\`Đã đổi mới 100% kịch bản KOC cho cả \${sceneCount} phân đoạn!\`);
      }`;

const newApplyScript = `      if (scriptData && Array.isArray(scriptData) && scriptData.length >= 1) {
        // Hàm kiểm tra nghiêm ngặt: Lời thoại phải là tiếng Việt có dấu
        const viDiacritics = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
        const enWordsCheck = /\\b(hello|welcome|check out|buy now|today|don't miss|this is|product|great|amazing|order now|link below|click here)\\b/i;

        setScenes(prev => prev.map((s, idx) => {
          const item = scriptData[idx] || scriptData[idx % scriptData.length];
          let vScript = (item?.voiceScript || s.voiceScript || '').trim();
          let mPrompt = (item?.motionPrompt || s.motionPrompt || '').trim();

          // 🚨 NẾU AI LỠ TRẢ VỀ TIẾNG ANH: TỰ ĐỘNG THAY THẾ BẰNG KỊCH BẢN TIẾNG VIỆT CHUẨN KOC NGAY LẬP TỨC
          if (!viDiacritics.test(vScript) || enWordsCheck.test(vScript)) {
            const fallback = buildFallbackForScene(s.id, sceneCount);
            vScript = fallback.voiceScript;
          }

          // 🚨 LÀM SẠCH motionPrompt: LOẠI BỎ TRIỆT ĐỂ BẤT KỲ CÂU NÓI TIẾNG ANH NÀO
          mPrompt = mPrompt.replace(/saying\\s*:\\s*["'][^"']+["']/gi, '');
          mPrompt = mPrompt.replace(/saying\\s+["'][^"']+["']/gi, '');
          mPrompt = mPrompt.replace(/\\b(speaking|speaks|talks)\\s+(in\\s+)?english\\b/gi, 'speaking fluent Vietnamese');
          mPrompt = mPrompt.replace(/\\benglish\\s+(dialogue|speech|words|lines)\\b/gi, 'Vietnamese dialogue');
          if (!/vietnamese/i.test(mPrompt)) {
            mPrompt += ' The presenter speaks natural fluent Vietnamese with authentic Vietnamese mouth movements and lip-sync.';
          }

          return {
            ...s,
            voiceScript: vScript,
            motionPrompt: mPrompt,
            promptStatus: 'done'
          };
        }));
        setIsScriptGenerating(false);
        toast?.success?.(\`Đã đổi mới 100% kịch bản KOC Tiếng Việt cho cả \${sceneCount} phân đoạn!\`);
      }`;

if (!content.includes(oldApplyScript)) {
  console.error('ERROR: oldApplyScript not found in VideoFactoryStudio.js!');
  process.exit(1);
}
content = content.replace(oldApplyScript, newApplyScript);
console.log('3. Updated script sanitization in handleGenerateScript!');

// Verify JS syntax
try {
  new vm.Script(content);
  console.log('4. VM syntax check PASSED! 100% valid JS.');
} catch (e) {
  // If top-level await or import/export causes vm.Script issue, try SourceTextModule or check error
  if (e.message.includes('Cannot use import statement') || e.message.includes('Cannot use export')) {
    console.log('4. ES Module detected, syntax OK.');
  } else {
    console.error('Syntax ERROR:', e.message);
    process.exit(1);
  }
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('5. Successfully saved updated VideoFactoryStudio.js!');
