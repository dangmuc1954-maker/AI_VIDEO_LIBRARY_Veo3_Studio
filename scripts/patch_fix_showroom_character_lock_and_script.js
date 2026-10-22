const fs = require('fs');
const path = require('path');
const vm = require('vm');

const targetPath = 'app/out/renderer/assets/VideoFactoryStudio.js';
if (!fs.existsSync(targetPath + '.bak_before_showroom_fix')) {
  fs.copyFileSync(targetPath, targetPath + '.bak_before_showroom_fix');
  console.log('[BACKUP] Created backup:', targetPath + '.bak_before_showroom_fix');
}

let code = fs.readFileSync(targetPath, 'utf8');

// 1. Update getEffectiveKocProfile to eliminate gender forcing when KOC image is present
const oldGetEffectiveKocProfile = `function getEffectiveKocProfile(kocImg, profile, voice) {
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
}`;

const newGetEffectiveKocProfile = `function getEffectiveKocProfile(kocImg, profile, voice) {
  if (kocImg) {
    return {
      hasKocImage: true,
      gender: 'reference',
      isFemale: false,
      presenterNoun: 'the SAME presenter from the reference KOC photo',
      outfitDesc: 'wearing the EXACT SAME outfit and clothing as shown in the reference KOC photo',
      expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
    };
  }
  if (profile && profile.gender) {
    return profile;
  }
  return {
    hasKocImage: false,
    gender: 'neutral',
    isFemale: false,
    presenterNoun: 'the commercial presenter',
    outfitDesc: 'wearing elegant tailored commercial attire',
    expression: 'beaming radiant commercial smile, energetic fresh confident expression looking directly at camera'
  };
}`;

if (code.includes(oldGetEffectiveKocProfile)) {
  code = code.replace(oldGetEffectiveKocProfile, newGetEffectiveKocProfile);
  console.log('[1/6] Updated getEffectiveKocProfile without gender forcing');
} else {
  console.log('[WARN 1/6] oldGetEffectiveKocProfile not matched directly, attempting flexible replace');
  const startIdx = code.indexOf('function getEffectiveKocProfile(');
  const endIdx = code.indexOf('// TẠO PROMPT VIDEO NÂNG CAO CHO MODEL VEO', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.slice(0, startIdx) + newGetEffectiveKocProfile + '\n\n' + code.slice(endIdx);
    console.log('[1/6] Replaced getEffectiveKocProfile via index slice');
  }
}

// 2. Update buildEnhancedVideoPrompt
const oldBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
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

const newBuildEnhanced = `function buildEnhancedVideoPrompt(scene, totalScenes = 3, kocProfile = null, hasKocImage = false, voiceLabel = '') {
  const isFirstScene = scene.id === 1;
  const isLastScene = scene.id === totalScenes;
  const rawMotion = (scene.motionPrompt || '').trim().replace(/\\.+$/, '');

  const presWord = hasKocImage ? "the SAME presenter from the reference KOC photo" : "the commercial presenter";
  const outfitWord = hasKocImage 
    ? "wearing the EXACT SAME outfit, clothing, and accessories as seen in the reference KOC photo"
    : "wearing an elegant tailored business outfit";

  if (isFirstScene) {
    return \`A sleek commercial video opening, steady medium shot: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord}, \${outfitWord}, gracefully showcases the featured product inside a bright modern showroom with a radiant, confident commercial smile. 100% consistent character identity and wardrobe lock, steady locked cinematic camera, soft diffused studio lighting, high production value, pristine 4k commercial quality.\`;
  } else if (isLastScene) {
    return \`A high-converting commercial closing clip, steady medium framing: \${rawMotion ? rawMotion + '. ' : ''}The SAME \${presWord}, \${outfitWord}, proudly presents the product while gesturing warmly towards the bottom-left shopping area in the bright modern showroom with an inviting, radiant commercial smile. 100% consistent character identity and wardrobe lock, steady locked framing, natural soft lighting, 4k commercial finish.\`;
  } else {
    return \`A premium macro commercial product video: \${rawMotion ? rawMotion + '. ' : ''}Crisp close-up focus on the product features and practical functions in action, smoothly operated by the hands of the SAME \${presWord} wearing identical sleeves matching the reference KOC outfit. 100% consistent character identity, presenter's radiant smile visible in soft background bokeh, steady cinematic camera without spinning, soft studio lighting, pristine 4k.\`;
  }
}`;

if (code.includes(oldBuildEnhanced)) {
  code = code.replace(oldBuildEnhanced, newBuildEnhanced);
  console.log('[2/6] Updated buildEnhancedVideoPrompt without gender forcing');
} else {
  console.log('[WARN 2/6] oldBuildEnhanced not matched directly, attempting slice replace');
  const startIdx = code.indexOf('function buildEnhancedVideoPrompt(');
  const endIdx = code.indexOf('const VideoFactoryStudio =', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.slice(0, startIdx) + newBuildEnhanced + '\n\n' + code.slice(endIdx);
    console.log('[2/6] Replaced buildEnhancedVideoPrompt via index slice');
  }
}

// 3. Update directorPrompt in handleGenerateShowroomAllScenes
const oldRulesInDirector = `🚨 MANDATORY RULES (STRICT CONSISTENCY, GENDER LOCK, OUTFIT LOCK & RADIANT EXPRESSION):
1. PRESENTER IDENTIFICATION & WARDROBE LOCK:
- GENDER LOCK: \${kocImage ? \`A reference KOC photo is provided. The presenter MUST BE \${isKocFemale ? 'FEMALE (woman)' : 'MALE (man)'} to strictly match the reference photo! NEVER swap or change gender under any circumstances!\` : \`Selected voice is \${selectedVoice}. The presenter MUST BE \${isKocFemale ? 'FEMALE (attractive young Asian female presenter)' : 'MALE (handsome young Asian male presenter)'} to match the voice!\`}
- IDENTITY & CONSISTENCY: The presenter MUST remain 100% IDENTICAL across ALL \${sceneCount} scenes (same face, neat hair, same Asian commercial look).
- WARDROBE LOCK (ABSOLUTE 100% MATCH): \${outfitLockRule} In a professional commercial, the presenter DOES NOT CHANGE CLOTHES between scenes. Do NOT invent different colors or outfits; replicate the reference clothing exactly!
- EXPRESSION: The presenter MUST ALWAYS have a radiant, cheerful, warm commercial smile with fresh, energetic, inviting poise looking directly at camera (nhân vật luôn tươi tắn, rạng rỡ, thần thái đỉnh cao).`;

const newRulesInDirector = `🚨 MANDATORY RULES (100% CHARACTER & WARDROBE LOCK, STRICTLY PRESERVE REFERENCE PHOTO):
1. CHARACTER IDENTITY & CLOTHING LOCK:
- IDENTITY LOCK: \${kocImage ? "A reference KOC photo is provided (reference photo #2). The presenter MUST remain 100% IDENTICAL to the exact person in the reference KOC photo across ALL scenes (identical face, eyes, nose, hair, skin tone, and body). Do NOT describe or guess gender as 'male' or 'female'; refer strictly to 'the same presenter from the reference photo' so the visual identity from the photo is preserved without conflict!" : "The presenter must maintain identical appearance across all scenes with neat hair and radiant commercial look."}
- WARDROBE LOCK (100% EXACT SAME OUTFIT): \${kocImage ? "The presenter MUST wear the EXACT SAME outfit and clothing as shown in the reference KOC photo throughout ALL scenes. Replicate the reference clothing, neckline, sleeves, and style exactly. Absolutely NO clothing changes between scenes!" : "The presenter must wear the exact same clean elegant commercial outfit across all scenes."}
- EXPRESSION: The presenter MUST ALWAYS have a radiant, cheerful, warm commercial smile with fresh, energetic, inviting poise looking directly at camera (nhân vật luôn tươi tắn, rạng rỡ, thần thái đỉnh cao).`;

if (code.includes(oldRulesInDirector)) {
  code = code.replace(oldRulesInDirector, newRulesInDirector);
  console.log('[3/6] Updated directorPrompt in handleGenerateShowroomAllScenes');
} else {
  console.log('[WARN 3/6] oldRulesInDirector not matched directly');
}

// 4. Update fallback charDesc in handleGenerateShowroomAllScenes
const oldFallbackCharDesc = 'const charDesc = `The SAME ${effProfile.presenterNoun} with a radiant beaming commercial smile, ${effProfile.outfitDesc}`;';
const newFallbackCharDesc = 'const charDesc = kocImage ? "the SAME presenter from the reference KOC photo, maintaining identical facial features and wearing the EXACT SAME outfit as seen in the reference photo, with a radiant beaming commercial smile" : "the commercial presenter with a radiant commercial smile, wearing stylish business attire";';

if (code.includes(oldFallbackCharDesc)) {
  code = code.replace(oldFallbackCharDesc, newFallbackCharDesc);
  console.log('[4/6] Updated fallback charDesc in handleGenerateShowroomAllScenes');
}

// 5. Fix effProfile is not defined in handleGenerateScript
const oldScriptHead = `    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      const variationNonce = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);`;

const newScriptHead = `    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      const effProfile = getEffectiveKocProfile(kocImage, kocProfile, selectedVoice);
      const variationNonce = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);`;

if (code.includes(oldScriptHead)) {
  code = code.replace(oldScriptHead, newScriptHead);
  console.log('[5/6] Fixed effProfile is not defined in handleGenerateScript');
} else {
  console.log('[WARN 5/6] oldScriptHead not matched directly');
}

// 6. Update Center Showroom Preview Box with Rotating Loading Animation
const oldCenterPreviewBox = `activeScene?.showroomStatus === 'generating' ? (
              React.createElement(ProgressCircle, { progress: activeScene.showroomProgress, size: 65, color: "#06b6d4" })
            ) : activeScene?.showroomImage ? (`;

const newCenterPreviewBox = `(isShowroomGenerating || activeScene?.showroomStatus === 'generating') ? (
              React.createElement("div", {
                className: "flex flex-col items-center justify-center p-6 text-center w-full h-full relative z-10 bg-[#0c1122]/95 backdrop-blur-md rounded-[30px]"
              },
                React.createElement("div", { className: "relative mb-3 flex items-center justify-center" },
                  React.createElement("div", { className: "w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" }),
                  React.createElement("span", { className: "absolute text-2xl" }, "🍌")
                ),
                React.createElement("span", { className: "text-xs font-bold text-cyan-300 uppercase tracking-wider animate-pulse" },
                  \`Đang tạo Showroom Cảnh 0\${activeScene?.id || 1}...\`
                ),
                React.createElement("span", { className: "text-[10px] text-gray-400 mt-1" },
                  "Banana AI đang render 8K KOC Showroom..."
                )
              )
            ) : activeScene?.showroomImage ? (`;

if (code.includes(oldCenterPreviewBox)) {
  code = code.replace(oldCenterPreviewBox, newCenterPreviewBox);
  console.log('[6/6] Updated Center Showroom Preview with animated spinning loading overlay');
} else {
  console.log('[WARN 6/6] oldCenterPreviewBox not matched directly');
}

// 7. Update UI Badge under KOC Image
const oldKocBadge = 'React.createElement("span", null, kocProfile?.isFemale ?? (!selectedVoice.includes(\'Nam\')) ? "👩 Nữ • Khóa đồ gốc" : "👨 Nam • Khóa đồ gốc")';
const newKocBadge = 'React.createElement("span", null, kocImage ? "✨ Khóa 100% nhân vật & đồ gốc" : "✨ Chưa nạp KOC mẫu")';

if (code.includes(oldKocBadge)) {
  code = code.replace(oldKocBadge, newKocBadge);
  console.log('[7/7] Updated KOC UI Badge to neutral character lock');
}

// Write updated file
fs.writeFileSync(targetPath, code, 'utf8');
console.log('[OK] Successfully updated VideoFactoryStudio.js!');
