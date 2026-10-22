// scripts/patch_fix_koc_gender_and_outfit_lock.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 VÁ LỖI KHÓA GIỚI TÍNH, TRANG PHỤC KOC GỐC & NỤ CƯỜI TƯƠI TẮN 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let code = fs.readFileSync(vfPath, 'utf8');

  // 1. Cập nhật hàm buildEnhancedVideoPrompt và thêm các hàm phân tích KOC
  const oldBuildPromptRegex = /\/\/ TẠO PROMPT VIDEO NÂNG CAO CHO MODEL VEO \/ OMNI[\s\S]*?function buildEnhancedVideoPrompt\(scene, totalScenes = 3\) \{[\s\S]*?return `A premium macro commercial product video:[\s\S]*?\}\s*\}/;

  const newBuildPromptAndHelpers = `// PHÂN TÍCH NHẬN DIỆN CHI TIẾT KOC (GIỚI TÍNH, TRANG PHỤC, NỤ CƯỜI TƯƠI TẮN)
async function analyzeKocDetails(kocImg, apiKey) {
  if (!kocImg?.base64) return null;
  try {
    const activeKey = (apiKey || DEFAULT_GEMINI_KEY).trim();
    let rawB64 = kocImg.base64;
    let mime = kocImg.mimeType || 'image/jpeg';
    if (rawB64.includes(',')) {
      const parts = rawB64.split(',');
      rawB64 = parts[1];
      const matchMime = parts[0].match(/:(.*?);/);
      if (matchMime) mime = matchMime[1];
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    const prompt = \`Analyze this reference photo of a commercial presenter/KOC.
Identify their exact gender and clothing details to lock character identity and wardrobe 100% across all commercial scenes.
Return ONLY a JSON object:
{
  "gender": "female" or "male",
  "isFemale": true or false,
  "presenterNoun": "attractive young Asian female presenter" or "handsome young Asian male presenter",
  "outfitDesc": "concise description of the exact clothes they wear (color, jacket/blazer/suit/shirt, sleeves, collar, inner top), e.g. 'wearing an elegant dark charcoal grey tailored blazer jacket over a clean white top with identical dark sleeves and collar'",
  "expression": "beaming radiant commercial smile, fresh and inviting facial expression looking at camera"
}\`;

    const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${activeKey}\`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mime, data: rawB64 } },
            { text: prompt }
          ]
        }],
        generationConfig: { temperature: 0.1, response_mime_type: "application/json" }
      })
    });
    clearTimeout(timer);

    if (resp.ok) {
      const data = await resp.json();
      const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const match = txt?.match(/\\{[\\s\\S]*\\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.gender) {
          parsed.isFemale = parsed.gender.toLowerCase().includes('female') || parsed.gender.toLowerCase().includes('woman') || parsed.gender.toLowerCase().includes('nữ');
          return parsed;
        }
      }
    }
  } catch(e) {
    console.warn("[VFS] Phân tích KOC offline/timeout:", e);
  }
  return null;
}

function getEffectiveKocProfile(kocImg, profile, voice) {
  if (profile && profile.gender) {
    return profile;
  }
  const isFemale = kocImg?.profile?.isFemale ?? (!voice || !voice.includes('Nam'));
  return {
    gender: isFemale ? 'female' : 'male',
    isFemale: isFemale,
    presenterNoun: isFemale ? 'attractive young Asian female presenter' : 'handsome young Asian male presenter',
    outfitDesc: kocImg 
      ? 'wearing the EXACT SAME outfit from the original KOC photo with matching tailored jacket/blazer and identical sleeves' 
      : 'wearing an elegant tailored business blazer over a clean top',
    expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
  };
}

// TẠO PROMPT VIDEO NÂNG CAO CHO MODEL VEO / OMNI / MUSE (KHÓA NHÂN VẬT, TRANG PHỤC KOC GỐC & NỤ CƯỜI TƯƠI TẮN)
function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  const rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');

  const isFem = kocProfile?.isFemale ?? (!voiceLabel || !voiceLabel.includes('Nam'));
  const presWord = isFem ? "attractive Asian female presenter" : "handsome Asian male presenter";
  const outfitWord = hasKocImage 
    ? (kocProfile?.outfitDesc ? \`wearing \${kocProfile.outfitDesc}\` : "wearing the EXACT SAME outfit from the original KOC photo with identical sleeves")
    : "wearing an elegant tailored business blazer over a clean top";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord} \${outfitWord} gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord} \${outfitWord} proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    // Phân cảnh quay cận review công dụng & chức năng sản phẩm
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}Crisp close-up focus on the product features and utility in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the KOC outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

  if (oldBuildPromptRegex.test(code)) {
    code = code.replace(oldBuildPromptRegex, newBuildPromptAndHelpers);
  }

  // 2. Thêm state kocProfile
  if (!code.includes('const [kocProfile, setKocProfile] = React.useState')) {
    code = code.replace(
      "const [kocImage, setKocImage] = React.useState(globalStudioState?.kocImage || null);",
      "const [kocImage, setKocImage] = React.useState(globalStudioState?.kocImage || null);\n  const [kocProfile, setKocProfile] = React.useState(globalStudioState?.kocProfile || null);"
    );
  }

  // 3. Persist kocProfile
  code = code.replace(
    'kocImage,\n      videoEngine,',
    'kocImage,\n      kocProfile,\n      videoEngine,'
  );
  code = code.replace(
    ', bgMode, kocImage, videoEngine,',
    ', bgMode, kocImage, kocProfile, videoEngine,'
  );

  // 4. Cập nhật handleKocUpload để tự động nhận diện và khóa giới tính + trang phục KOC
  const oldKocUpload = `  // Upload KOC mẫu
  const handleKocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      let assetId = null;
      if (window.aiforge?.assets?.importReference) {
        try {
          const imported = await window.aiforge.assets.importReference({
            name: file.name,
            mimeType: file.type,
            dataUrl: base64
          });
          assetId = imported?.id;
        } catch(err){}
      }
      setKocImage({ name: file.name, base64, mimeType: file.type, assetId });
      setBgMode('reference');
      toast?.success?.("Đã tải KOC mẫu vào hệ thống!");
    };
    reader.readAsDataURL(file);
  };`;

  const newKocUpload = `  // Upload KOC mẫu & Tự động phân tích nhận diện khóa nhân vật, trang phục
  const handleKocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      let assetId = null;
      if (window.aiforge?.assets?.importReference) {
        try {
          const imported = await window.aiforge.assets.importReference({
            name: file.name,
            mimeType: file.type,
            dataUrl: base64
          });
          assetId = imported?.id;
        } catch(err){}
      }
      const newKoc = { name: file.name, base64, mimeType: file.type, assetId };
      setKocImage(newKoc);
      setBgMode('reference');
      toast?.info?.("Đang phân tích nhân vật & khóa trang phục KOC...");

      analyzeKocDetails(newKoc, geminiApiKey).then(profile => {
        if (profile) {
          setKocProfile(profile);
          setKocImage(prev => prev ? { ...prev, profile } : prev);
          toast?.success?.(\`Đã nhận diện: \${profile.isFemale ? 'KOC Nữ' : 'KOC Nam'} - Khóa 100% trang phục & nụ cười tươi tắn!\`);
        } else {
          toast?.success?.("Đã nạp KOC mẫu - Khóa trang phục và nhân vật theo ảnh!");
        }
      });
    };
    reader.readAsDataURL(file);
  };`;

  if (code.includes(oldKocUpload)) {
    code = code.replace(oldKocUpload, newKocUpload);
  }

  // 5. Cập nhật handleGenerateShowroomAllScenes:
  // - Gửi inline_data của ảnh KOC sang Gemini Thinking
  // - Khóa giới tính (Nữ ra nữ, Nam ra nam)
  // - Khóa trang phục nhân vật giống ảnh KOC gốc
  // - Biểu cảm tươi tắn rạng rỡ
  // - Fallback charDesc bám sát KOC gốc
  const oldShowroomDirectorStart = 'const directorPrompt = `You are a top-tier commercial advertising director';
  const oldShowroomDirectorEnd = 'if (window.aiforge?.queue?.addJobs) {';

  const newShowroomDirector = `const effProfile = getEffectiveKocProfile(kocImage, kocProfile, selectedVoice);
      const isKocFemale = effProfile.isFemale;
      const presenterTitle = effProfile.presenterNoun;
      const outfitLockRule = kocImage
        ? \`The presenter MUST wear the EXACT SAME OUTFIT as seen in the reference KOC photo (\${effProfile.outfitDesc}). Absolutely NO clothing change between scenes!\`
        : \`The presenter MUST wear the EXACT SAME stylish tailored business blazer over a clean top across ALL scenes (100% outfit lock).\`;

      const directorPrompt = \`You are a top-tier commercial advertising director planning high-end TikTok / e-commerce showroom photography.
Product: \${productInfo || niche.defaultInfo}
Brand: \${brandName}
Niche: \${niche.name}
Total Scenes: \${sceneCount}
Chosen Voice: \${selectedVoice}

Stage breakdown:
\${scenes.map((s, i) => \`Scene \${i + 1}: \${s.stage} - \${s.title} (Camera style: \${s.angleName})\`).join('\\n')}

🚨 MANDATORY RULES (STRICT CONSISTENCY, GENDER LOCK, OUTFIT LOCK & RADIANT EXPRESSION):
1. PRESENTER IDENTIFICATION & WARDROBE LOCK:
- GENDER LOCK: \${kocImage ? \`A reference KOC photo is provided. The presenter MUST BE \${isKocFemale ? 'FEMALE (woman)' : 'MALE (man)'} to strictly match the reference photo! NEVER swap or change gender under any circumstances!\` : \`Selected voice is \${selectedVoice}. The presenter MUST BE \${isKocFemale ? 'FEMALE (attractive young Asian female presenter)' : 'MALE (handsome young Asian male presenter)'} to match the voice!\`}
- IDENTITY & CONSISTENCY: The presenter MUST remain 100% IDENTICAL across ALL \${sceneCount} scenes (same face, neat hair, same Asian commercial look).
- WARDROBE LOCK (ABSOLUTE 100% MATCH): \${outfitLockRule} In a professional commercial, the presenter DOES NOT CHANGE CLOTHES between scenes. Do NOT invent other colors or cream blazer unless that is what is in the reference!
- EXPRESSION: The presenter MUST ALWAYS have a radiant, cheerful, warm commercial smile with fresh, energetic, inviting poise looking directly at camera (nhân vật luôn tươi tắn, rạng rỡ, thần thái đỉnh cao).

2. MANDATORY SCENE STRUCTURE:
- Scene 1 (Hook & Introduction): Energetic medium close-up of the \${presenterTitle} presenting the product with a warm, radiant inviting smile, face clearly visible to camera.
- Scene 2 (Macro Hero Product Close-Up & Function Review): Dramatic commercial close-up shot focusing tightly on the product's fine details, craftsmanship, functions, and premium textures in sharp crisp focus, held proudly by the hands of the SAME \${presenterTitle} (wearing the identical sleeves and outfit, with the presenter's recognizable face and warm smile visible in the soft background depth of field).
- Middle Scenes (if 4 or 5 scenes): Hands-on demonstration and real-world satisfaction, showing practical utility and features with the SAME \${presenterTitle} actively operating or interacting with the product.
- Final Scene (Closing Call-To-Action): The SAME \${presenterTitle} holding the product and warmly gesturing towards the bottom-left corner (where the shopping cart is located) with a welcoming, confident radiant smile.

3. COMMERCIAL AESTHETIC:
- Plain clean unbranded showroom or luxury studio background with soft cinematic lighting.
- 8K commercial photography, vertical 9:16 aspect ratio, ultra-crisp focus, photorealistic textures.
- No text, no logos, no watermarks, no split screens.

Return ONLY a JSON array of \${sceneCount} prompt strings:
[
  "Prompt for scene 1...",
  "Prompt for scene 2...",
  ...
]\`;

      // Chuẩn bị dữ liệu KOC ảnh gửi kèm cho Gemini Thinking
      let kocInlinePart = null;
      if (kocImage?.base64) {
        let b64 = kocImage.base64;
        let mime = kocImage.mimeType || 'image/jpeg';
        if (b64.includes(',')) {
          const spl = b64.split(',');
          b64 = spl[1];
          const m = spl[0].match(/:(.*?);/);
          if (m) mime = m[1];
        }
        if (b64 && b64.length > 50) {
          kocInlinePart = {
            inline_data: {
              mime_type: mime,
              data: b64
            }
          };
        }
      }

      let generatedPrompts = [];
      const geminiModels = [
        'gemini-3.8-flash',
        'gemini-flash-latest',
        'gemini-3.5-flash-lite',
        'gemini-3.7-flash',
        'gemini-3.1-flash-lite'
      ];
      for (const mName of geminiModels) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 12000);
          const reqParts = [{ text: directorPrompt }];
          if (kocInlinePart) reqParts.unshift(kocInlinePart);

          const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${mName}:generateContent?key=\${activeKey}\`, {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: reqParts }],
              generationConfig: { temperature: 0.8, response_mime_type: "application/json" }
            })
          });
          clearTimeout(timer);
          if (resp.ok) {
            const d = await resp.json();
            const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
            const match = text?.match(/\\[[\\s\\S]*\\]/);
            if (match) {
              generatedPrompts = JSON.parse(match[0]);
              if (Array.isArray(generatedPrompts) && generatedPrompts.length > 0) break;
            }
          }
        } catch(e) {}
      }

      // Chuẩn bị reference assets
      const refIds = [];
      products.forEach(p => { if (p?.assetId) refIds.push(p.assetId); });
      if (kocImage?.assetId) {
        refIds.push(kocImage.assetId);
      }

      // Luôn lấy đúng tài khoản Banana (Ảnh Showroom) để không bao giờ bị nghẽn
      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetBananaAccId = bananaAcc?.accountId || undefined;

      if (window.aiforge?.queue?.addJobs) {`;

  const sIdx1 = code.indexOf(oldShowroomDirectorStart);
  const sIdx2 = code.indexOf(oldShowroomDirectorEnd);
  if (sIdx1 !== -1 && sIdx2 !== -1) {
    code = code.slice(0, sIdx1) + newShowroomDirector + '\n' + code.slice(sIdx2 + oldShowroomDirectorEnd.length);
  }

  // Cập nhật fallback prompt cho Showroom (loại bỏ generic presenter)
  const oldCharDescRegex = /const charDesc = "The same stylish presenter wearing an elegant tailored blazer over a clean top with neat hair";/;
  const newCharDesc = `const charDesc = \`The SAME \${effProfile.presenterNoun} with a radiant beaming commercial smile, \${effProfile.outfitDesc}\`;`;
  if (oldCharDescRegex.test(code)) {
    code = code.replace(oldCharDescRegex, newCharDesc);
  }

  // 6. Cập nhật handleGenerateScript (Lên kịch bản KOC):
  // - Ưu tiên kocImage trong targetImg gửi sang Gemini
  // - Thay thế cream blazer bằng effProfile.outfitDesc và presenterNoun
  // - Giữ nhân vật tươi tắn rạng rỡ
  code = code.replace(
    'const targetImg = activeSceneImg || products.find(p => p !== null) || kocImage;',
    'const targetImg = kocImage || activeSceneImg || products.find(p => p !== null);'
  );

  // Xóa cream blazer trong analysisPrompt
  code = code.replace(
    'Elegant presenter in tailored cream blazer gracefully introduces the featured product inside the modern showroom with natural commercial poise, soft studio lighting.',
    '${effProfile.presenterNoun} wearing ${effProfile.outfitDesc} gracefully introduces the featured product inside the modern showroom with a radiant, confident commercial smile and natural poise, soft studio lighting.'
  );

  code = code.replace(
    'The SAME presenter wearing the EXACT SAME tailored cream blazer over white top throughout all scenes',
    'The SAME presenter (${effProfile.presenterNoun}) wearing the EXACT SAME outfit as the original KOC photo (${effProfile.outfitDesc}) with a radiant smiling expression throughout all scenes'
  );

  code = code.replace(
    'operated smoothly by the same presenter\'s hands with identical suit sleeves, steady camera capturing utility and fine textures, presenter\'s smile visible in background bokeh.',
    'operated smoothly by the same presenter\'s hands with identical sleeves matching the KOC outfit, steady camera capturing utility and fine textures, presenter\'s radiant smile visible in background bokeh.'
  );

  code = code.replace(
    'The same presenter holding product proudly, gesturing warmly towards bottom-left shopping area with welcoming smile.',
    'The same ${effProfile.presenterNoun} wearing ${effProfile.outfitDesc} holding product proudly, gesturing warmly towards bottom-left shopping area with an inviting, radiant smile.'
  );

  // Cập nhật đầu hàm handleGenerateScript để lấy effProfile
  if (!code.includes('const effProfile = getEffectiveKocProfile(kocImage, kocProfile, selectedVoice);') || code.indexOf('const effProfile = getEffectiveKocProfile') > code.indexOf('handleGenerateScript')) {
    code = code.replace(
      'const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;',
      'const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;\n      const effProfile = getEffectiveKocProfile(kocImage, kocProfile, selectedVoice);'
    );
  }

  // 7. Cập nhật các lệnh gọi buildEnhancedVideoPrompt
  code = code.replace(
    /const enhancedPrompt = buildEnhancedVideoPrompt\(scene, sceneCount\);/g,
    'const enhancedPrompt = buildEnhancedVideoPrompt(scene, sceneCount, kocProfile, Boolean(kocImage), selectedVoice);'
  );

  // 8. Cập nhật UI Section 3: Thêm badge xác nhận khóa nhân vật & trang phục
  code = code.replace(
    'onClick: (e) => { e.stopPropagation(); setKocImage(null); },\n                  className: "absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors"\n                }, "×")',
    `onClick: (e) => { e.stopPropagation(); setKocImage(null); setKocProfile(null); },
                  className: "absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors"
                }, "×"),
                React.createElement("div", {
                  className: "absolute bottom-1 left-1 right-1 bg-black/80 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center justify-between text-[9px] text-cyan-300 font-semibold border border-cyan-500/30 select-none"
                },
                  React.createElement("span", null, kocProfile?.isFemale ?? (!selectedVoice.includes('Nam')) ? "👩 Nữ • Khóa đồ gốc" : "👨 Nam • Khóa đồ gốc"),
                  React.createElement("span", { className: "text-emerald-400 font-bold" }, "✨ Tươi tắn")
                )`
  );

  fs.writeFileSync(vfPath, code, 'utf8');
  console.log('✅ Đã cập nhật VideoFactoryStudio.js tại:', vfPath);
}

// Kiểm tra AST Syntax
try {
  execSync('node -c app/out/renderer/assets/VideoFactoryStudio.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] VideoFactoryStudio.js AST Syntax 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] VideoFactoryStudio.js AST Syntax lỗi!');
  process.exit(1);
}

console.log('\n💎 HOÀN TẤT VÁ LỖI KHÓA GIỚI TÍNH, TRANG PHỤC KOC GỐC & NỤ CƯỜI TƯƠI TẮN!');
