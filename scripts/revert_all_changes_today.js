const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================');
console.log('🔄 BẮT ĐẦU HOÀN NGUYÊN TOÀN BỘ MÃ NGUỒN VỀ TRƯỚC HÔM NAY');
console.log('======================================================');

// -----------------------------------------------------------
// 1. HOÀN NGUYÊN app/out/renderer/assets/VideoFactoryStudio.js
// -----------------------------------------------------------
const vfsPath = path.resolve('app/out/renderer/assets/VideoFactoryStudio.js');
let vfs = fs.readFileSync(vfsPath, 'utf8');

// 1.1 Gỡ bỏ resolveBananaAccounts helper
vfs = vfs.replace(/\n\s*\/\/ 🎯 TRUY VẤN TÀI KHOẢN BANANA LIVE TỪ BROWSER HUB TRÁNH STALE PROPS[\s\S]*?return \{ pool, active \};\s*\};\n/, '\n');

// 1.2 Hoàn nguyên getSmartMotionPrompt
const oldSmartMotionBlock = `// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)
function getSmartMotionPrompt(sceneId, creativeDirection = '', outfitName = '') {
  const loc = creativeDirection ? \`in \${creativeDirection}\` : 'in a luxury bedroom';
  switch (Number(sceneId)) {
    case 1:
      const garment = outfitName ? \`a gorgeous \${outfitName} matching the reference photo\` : 'the stunning new garment matching the reference outfit';
      return \`A young East Asian woman with long wavy black hair wearing pajamas \${loc}, starts in the exact pose shown holding a black shipping bag. Over 8 seconds, she excitedly unboxes the package, peeling open the bag to reveal \${garment}. She holds the dress up against herself, beaming with a delighted closed-mouth smile. Handheld shaky camera. Mouth strictly closed. Soundscape: soft plastic package peeling, gentle crinkling courier bag, delicate fabric rustle, ambient room tone.\`;
    case 2:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she holds the dress close to the camera, gently rubbing and feeling the fabric texture between her fingers, examining the stitching with an appreciative closed-mouth smile. Handheld smartphone camera with natural slight movement. Mouth strictly closed. Soundscape: soft fabric rubbing, delicate textile rustle, quiet room ambience.\`;
    case 3:
      return \`The same female KOC starts in the exact pose shown, now wearing the stunning new outfit \${loc}. Over 8 seconds, she performs a confident fashion walk towards the camera, smiling warmly with mouth closed. Handheld tracking camera slowly stepping backward. Mouth strictly closed throughout. Soundscape: gentle footstep sounds, delicate fabric swishing with movement, peaceful room tone.\`;
    case 4:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she performs a playful 360-degree spin, gracefully showcasing the dress silhouette, drape, and back design with a radiant closed-mouth smile. Smooth handheld circular camera follow. Mouth strictly closed throughout. Soundscape: fabric whoosh, soft air movement, gentle room acoustics.\`;
    case 5:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she poses with an elegant over-the-shoulder look, gently tucking her hair while smiling warmly at the camera with mouth firmly closed. Subtle handheld camera drift, soft flattering lighting. Mouth strictly closed throughout. Soundscape: faint hair touch, soft room tone, quiet atmospheric hum.\`;
    case 6:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she strikes a confident fashion stance with hands on her hips, swaying slightly to highlight the garment's fit and movement, beaming with closed lips. Handheld natural eye-level framing. Mouth strictly closed throughout. Soundscape: subtle cloth rustling, gentle indoor room acoustics.\`;
    case 7:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she gives a friendly, charming wave to the camera and takes a gentle step back as a closing gesture, smiling happily with mouth closed. Handheld camera slowly pulling back. Mouth strictly closed throughout. Soundscape: gentle hand motion in air, soft room ambience, calm closing vibe.\`;
    default:
      return \`The female KOC starts in the exact pose shown \${loc}. She performs natural fashion posing movements showcasing the outfit with mouth strictly closed. Handheld UGC smartphone camera. Mouth strictly closed throughout. Soundscape: fabric rustling, natural room ambience.\`;
  }
}`;

const currentSmartMotionStart = vfs.indexOf('// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)');
const currentSmartMotionEnd = vfs.indexOf('async function callGeminiVisionDirector(', currentSmartMotionStart);
if (currentSmartMotionStart !== -1 && currentSmartMotionEnd !== -1) {
  vfs = vfs.substring(0, currentSmartMotionStart) + oldSmartMotionBlock + '\n\n' + vfs.substring(currentSmartMotionEnd);
  console.log('  ✓ Đã hoàn nguyên getSmartMotionPrompt');
}

// 1.3 Hoàn nguyên callGeminiVisionDirector
const oldGeminiDirector = `async function callGeminiVisionDirector(frame, action, apiKey, outfitAsset = null) {
  if (!frame?.imageAsset) {
    return { ok: false, error: "Cảnh này chưa có hình ảnh để phân tích" };
  }

  const cleanB64 = await ensureAssetBase64(frame.imageAsset);
  if (!cleanB64) {
    return { ok: false, error: "Không thể trích xuất ảnh base64 của Cảnh " + frame.id };
  }

  const isScene1 = Number(frame.id) === 1;
  let outfitB64 = '';
  if (isScene1 && outfitAsset) {
    try {
      outfitB64 = await ensureAssetBase64(outfitAsset);
    } catch (_) {}
  }

  let promptText = '';
  let parts = [];

  if (isScene1 && outfitB64) {
    parts = [
      { inline_data: { mime_type: 'image/jpeg', data: cleanB64 } },
      { inline_data: { mime_type: 'image/jpeg', data: outfitB64 } }
    ];

    promptText = \`You are the master cinematic AI director for Google Veo 3 and Veo 3.1 video production.
You are provided with TWO reference images:
- Image 1: The starting video pose for Scene 1 showing a young East Asian female presenter holding a sealed black courier shopping bag in a luxury bedroom/setting.
- Image 2: The exact reference outfit photo showing the clothing/dress she bought.

YOUR TASK:
Generate a single, hyper-realistic, production-ready 8-second video motion prompt for Scene 1: Unboxing and Revealing the Exact Outfit from Image 2.

YOU MUST STRICTLY FOLLOW THIS PROVEN VIDEO SCRIPT STRUCTURE:
1. STARTING POSE ANCHOR:
   Describe the presenter based on Image 1 (e.g. "A young East Asian woman with long wavy black hair, wearing pajamas/homewear in the bedroom, starts in the exact pose shown holding a black shopping bag.").
2. METICULOUS OUTFIT EXTRACTION FROM IMAGE 2 (100% ACCURACY):
   Carefully examine Image 2. You MUST identify and detail the exact garment:
   - Garment type (e.g. mini dress, midi dress, gown, top and skirt set, blazer, jumpsuit)
   - Color and patterns (e.g. white with black polka dots, solid red, floral print, stripes)
   - Straps / Neckline / Sleeves (e.g. spaghetti straps, sleeveless, sweetheart neckline, off-shoulder)
   - Fabric texture and silhouette (e.g. silk, satin, cotton, chiffon, tiered ruffled skirt, pleated hem)
3. 8-SECOND UNBOXING ACTION PACING:
   "Over 8 seconds, she excitedly unboxes the package, peeling open the bag to reveal [detailed garment description from Image 2]. She holds the dress up against herself, beaming with a delighted closed-mouth smile."
4. CAMERA & FACIAL DIRECTING:
   "Handheld shaky camera. Mouth strictly closed." (Zero mouth distortion, authentic TikTok/Reels smartphone aesthetic).
5. AMBIENT SOUNDSCAPE LINE:
   "Soundscape: soft plastic package peeling, gentle crinkling courier bag, delicate fabric rustle, ambient room tone."

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;
  } else {
    parts = [
      { inline_data: { mime_type: 'image/jpeg', data: cleanB64 } }
    ];

    promptText = \`You are the master cinematic AI director for Google Veo 3 and Veo 3.1 video production.
Analyze this high-fashion commercial storyboard reference photo for Scene \${frame.id}.
The primary scene action is: "\${action}"

Generate a single, hyper-realistic, production-ready video motion prompt for an 8-second commercial scene.

YOU MUST STRICTLY ENFORCE THESE 6 CORE DIRECTING RULES:

RULE 1: FIRST FRAME ANCHOR (Zero Flicker Guarantee)
The video MUST seamlessly begin from the exact starting pose, facial angle, clothing details, and environment shown in the reference image. Zero jumping or flickering when transitioning from the static frame into continuous video motion.

RULE 2: NATURAL PHYSICAL INERTIA & ACTION PACING (Organic Movement)
Describe smooth, continuous physical action designed precisely for an 8-second clip. Detail physical weight shifts, natural fabric drape and inertia sway, hair movement, and elegant posture transitions.

RULE 3: MOUTH STRICTLY CLOSED (No Speaking / No Distortion)
The presenter's mouth MUST remain strictly closed throughout the entire 8-second video. They maintain a radiant, natural, genuine closed-mouth commercial smile. Absolutely NO lip movement, NO mouth opening, NO speaking animation, preventing any facial distortion.

RULE 4: SMARTPHONE UGC CAMERA STYLE (Authentic TikTok / Reels Aesthetic)
Direct the camera as an authentic handheld smartphone shot (iPhone 15 Pro UGC aesthetic). Incorporate subtle organic handheld breathing shake, dynamic focus tracking, and natural eye-level framing—NOT artificial cinematic Hollywood staging.

RULE 5: REALISTIC SOUNDSCAPE LINE (Detailed Ambient Audio Design)
At the very end of the prompt, include a dedicated ambient soundscape sentence tailored specifically to the action (e.g. realistic plastic tearing sound of the courier bag, delicate fabric rustle as the dress moves, soft footsteps on hardwood floor, warm ambient room tone).

RULE 6: METICULOUS OUTFIT & SCENE CONTINUITY (Flawless Consistency)
Maintain exact continuity with the reference image: same clothing details, same lighting temperature, same room architecture, same character likeness.

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;
  }
  parts.push({ text: promptText });`;

const currentGeminiStart = vfs.indexOf('async function callGeminiVisionDirector(');
const currentGeminiEnd = vfs.indexOf('parts.push({ text: promptText });', currentGeminiStart);
if (currentGeminiStart !== -1 && currentGeminiEnd !== -1) {
  vfs = vfs.substring(0, currentGeminiStart) + oldGeminiDirector + vfs.substring(currentGeminiEnd + 'parts.push({ text: promptText });'.length);
  console.log('  ✓ Đã hoàn nguyên callGeminiVisionDirector');
}

// 1.4 Hoàn nguyên generateSingleImage
vfs = vfs.replace(
`    const cs = stateRef.current;
    if (Number(frameId) === 1) {
      if (!cs.koc) {
        toast?.warn?.("Vui lòng tải lên Gương mặt KOC tham chiếu trước!");
        return;
      }
    } else {
      if (!cs.koc || !cs.outfit) {
        toast?.warn?.("Vui lòng tải lên cả Gương mặt KOC và Mẫu Trang phục trước!");
        return;
      }
    }`,
`    const cs = stateRef.current;
    if (!cs.koc || !cs.outfit) {
      toast?.warn?.("Vui lòng tải lên cả Gương mặt KOC và Mẫu Trang phục trước!");
      return;
    }`
);

// Hoàn nguyên refs trong generateSingleImage
vfs = vfs.replace(
`      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
      const validOutfitId = Number(frameId) === 1 ? null : await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg');
      if (validKocId && validKocId !== cs.koc.assetId) {
        setKoc(prev => prev ? { ...prev, assetId: validKocId, mediaId: validKocId } : prev);
      }
      if (validOutfitId && validOutfitId !== cs.outfit?.assetId) {
        setOutfit(prev => prev ? { ...prev, assetId: validOutfitId, mediaId: validOutfitId } : prev);
      }

      // 🎯 CHUỖI THAM CHIẾU GOOGLE FLOW:
      // Cảnh 1: [Mặt KOC] (CHỈ NẠP DUY NHẤT 1 ẢNH THAM CHIẾU LÀ KOC, TUYỆT ĐỐI KHÔNG NẠP OUTFIT HOẶC ẢNH KHÁC)
      // Cảnh 2 & 3: [Mặt KOC, Outfit, Cảnh 1]
      // Cảnh 4-7: [Mặt KOC, Outfit, Cảnh 1, Cảnh 3]
      const refs = Number(frameId) === 1 ? [validKocId].filter(Boolean) : [validKocId, validOutfitId].filter(Boolean);`,
`      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
      const validOutfitId = await ensureRegisteredAsset(cs.outfit, 'outfit_sample.jpg');
      if (validKocId && validKocId !== cs.koc.assetId) {
        setKoc(prev => prev ? { ...prev, assetId: validKocId, mediaId: validKocId } : prev);
      }
      if (validOutfitId && validOutfitId !== cs.outfit.assetId) {
        setOutfit(prev => prev ? { ...prev, assetId: validOutfitId, mediaId: validOutfitId } : prev);
      }

      // 🎯 CHUỖI THAM CHIẾU GOOGLE FLOW:
      // Cảnh 1: [Mặt KOC, Outfit]
      // Cảnh 2 & 3: [Mặt KOC, Outfit, Cảnh 1]
      // Cảnh 4-7: [Mặt KOC, Outfit, Cảnh 1, Cảnh 3]
      const refs = [validKocId, validOutfitId].filter(Boolean);`
);

// Hoàn nguyên account resolution trong generateSingleImage
vfs = vfs.replace(
`      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      const { pool: bananaPool, active: activeBananaAccs } = await resolveBananaAccounts();
      let curBananaAcc = undefined;
      let isManualBanana = false;
      if (!isAutoBanana) {
        curBananaAcc = bananaPool.find(a => a.accountId === selectedBananaAccountId);
        isManualBanana = !!curBananaAcc;
      }
      if (!curBananaAcc && activeBananaAccs.length > 0) {
        window.__aiforge_koc_single_banana_counter = (window.__aiforge_koc_single_banana_counter || 0) + 1;
        curBananaAcc = activeBananaAccs[(window.__aiforge_koc_single_banana_counter - 1) % activeBananaAccs.length];
        isManualBanana = false;
      }
      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        autoRemoveWatermark: cs.removeWatermark === true,
        removeWatermark: cs.removeWatermark === true,
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          promptOrder: Number(frameId),
          sceneIndex: Number(frameId),
          sceneName: \`Cảnh \${frameId}\`,
          prompt: finalPrompt,`,
`      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let curBananaAcc = undefined;
      let isManualBanana = false;
      if (!isAutoBanana) {
        curBananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId);
        isManualBanana = !!curBananaAcc;
      }
      if (!curBananaAcc && activeBananaAccs.length > 0) {
        window.__aiforge_koc_single_banana_counter = (window.__aiforge_koc_single_banana_counter || 0) + 1;
        curBananaAcc = activeBananaAccs[(window.__aiforge_koc_single_banana_counter - 1) % activeBananaAccs.length];
        isManualBanana = false;
      }
      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        autoRemoveWatermark: cs.removeWatermark === true,
        removeWatermark: cs.removeWatermark === true,
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          prompt: finalPrompt,`
);

// 1.5 Hoàn nguyên generateAllImages
vfs = vfs.replace(
`      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      const { pool: bananaPool, active: activeBananaAccs } = await resolveBananaAccounts();
      let manualBananaAcc = !isAutoBanana ? bananaPool.find(a => a.accountId === selectedBananaAccountId) : undefined;`,
`      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;`
);

vfs = vfs.replace(
`          const finalPrompt = buildSceneImagePrompt(frame.imagePrompt, cs.creativeDirection, cs.technicalStyle);
          // Cảnh 1 chỉ nạp duy nhất 1 ảnh tham chiếu là KOC!
          const refs = Number(frame.id) === 1 ? [validKocId].filter(Boolean) : [validKocId, validOutfitId].filter(Boolean);
          if (frame.id > 1 && validFrame1Id) {
            refs.push(validFrame1Id);
          }
          if (frame.id >= 4 && validFrame3Id) {
            refs.push(validFrame3Id);
          }`,
`          const finalPrompt = buildSceneImagePrompt(frame.imagePrompt, cs.creativeDirection, cs.technicalStyle);
          const refs = [validKocId, validOutfitId];
          if (frame.id > 1 && validFrame1Id) {
            refs.push(validFrame1Id);
          }
          if (frame.id >= 4 && validFrame3Id) {
            refs.push(validFrame3Id);
          }`
);

vfs = vfs.replaceAll(
`            payload: {
              title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
              promptOrder: Number(frame.id),
              sceneIndex: Number(frame.id),
              sceneName: \`Cảnh \${frame.id}\`,
              prompt: finalPrompt,`,
`            payload: {
              title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
              prompt: finalPrompt,`
);

vfs = vfs.replace(
`            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            // 🎯 CẢNH 1 CHỈ NẠP DUY NHẤT 1 ẢNH THAM CHIẾU LÀ GƯƠNG MẶT KOC (KHÔNG NẠP OUTFIT)
            referenceAssetIds: [validKocId].filter(Boolean),`,
`            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            referenceAssetIds: [validKocId, validOutfitId].filter(Boolean),`
);

vfs = vfs.replace(
`          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            promptOrder: 1,
            sceneIndex: 1,
            sceneName: 'Cảnh 1',
            prompt: f1Prompt,`,
`          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,`
);

// 1.6 Hoàn nguyên analyzeMotion actions
const oldActionsStart = `      let action = "";
      switch (Number(frame.id)) {
        case 1: action = "Excitedly tearing open the black courier bag, plastic rustling sounds, looking at camera with a big closed-mouth smile."; break;
        case 2: action = "Detailed fabric showcase, moving material near lens, showing texture, happy facial expression with mouth closed."; break;
        case 3: action = "Fashion walk towards camera, dynamic stride, confident closed-mouth smile, showing full outfit in motion."; break;
        case 4: action = "Playful 360-degree spin, showing full outfit movement from all angles, dynamic garment drape."; break;
        case 5: action = "Over-the-shoulder gaze, adjusting hair cinematic pose, looking directly at lens with mouth closed."; break;
        case 6: action = "Powerful stance, hair flip, hands on hips fashion movement, subtle body sway highlighting outfit."; break;
        case 7: action = "Friendly wave and exit, soft camera movement follow, stepping back with a genuine closed-mouth smile."; break;
        default: action = "Natural fashion posing movement with mouth strictly closed.";
      }`;

const currentActionStart = vfs.indexOf('let action = "";\n      switch (Number(frame.id)) {');
const currentActionEnd = vfs.indexOf('default: action = ', currentActionStart);
if (currentActionStart !== -1 && currentActionEnd !== -1) {
  const currentActionEndSemi = vfs.indexOf(';\n      }', currentActionEnd);
  vfs = vfs.substring(0, currentActionStart) + oldActionsStart + vfs.substring(currentActionEndSemi + 8);
  console.log('  ✓ Đã hoàn nguyên analyzeMotion actions');
}

fs.writeFileSync(vfsPath, vfs, 'utf8');
console.log('  [+] VideoFactoryStudio.js đã được hoàn nguyên chuẩn xác! Length:', vfs.length);

// -----------------------------------------------------------
// 2. HOÀN NGUYÊN app/out/renderer/assets/ImageStudio-4nmpUX3j.js
// -----------------------------------------------------------
const imgStudioPath = path.resolve('app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let imgStudio = fs.readFileSync(imgStudioPath, 'utf8');
const originalZt = 'Zt=p.useMemo(()=>ot.filter(t=>Tt(t)&&!Dt(t)),[ot]),Yt=p.useMemo(()=>st.filter(t=>Tt(t)&&!Dt(t)),[st]),er=p.useMemo(()=>nt.filter(t=>Tt(t)&&!Dt(t)),[nt]),';
const patchedZt = 'Zt=p.useMemo(()=>{const r=ot.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:ot.filter(t=>Tt(t))},[ot]),Yt=p.useMemo(()=>{const r=st.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:st.filter(t=>Tt(t))},[st]),er=p.useMemo(()=>{const r=nt.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:nt.filter(t=>Tt(t))},[nt]),';
if (imgStudio.includes(patchedZt)) {
  imgStudio = imgStudio.replace(patchedZt, originalZt);
  fs.writeFileSync(imgStudioPath, imgStudio, 'utf8');
  console.log('  [+] ImageStudio-4nmpUX3j.js đã hoàn nguyên về trạng thái gốc!');
}

// -----------------------------------------------------------
// 3. HOÀN NGUYÊN app/out/main/index.js (CƠ CHẾ LÕI BANANA & SESSION)
// -----------------------------------------------------------
const mainPath = path.resolve('app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 3.1 Hoàn nguyên zu và executeFlowImageRpc từ extracted_original_20260912 / scripts/extracted
const extractedMainPath = path.resolve('scripts/extracted/main_index.js');
const extractedMain = fs.readFileSync(extractedMainPath, 'utf8');

const extZuStart = extractedMain.indexOf('function zu(');
const extZuEnd = extractedMain.indexOf('function Ku(', extZuStart);
const originalZu = extractedMain.slice(extZuStart, extZuEnd);

const curZuStart = mainCode.indexOf('function zu(');
const curZuEnd = mainCode.indexOf('function Ku(', curZuStart);
if (curZuStart !== -1 && curZuEnd !== -1 && originalZu) {
  mainCode = mainCode.slice(0, curZuStart) + originalZu + mainCode.slice(curZuEnd);
  console.log('  ✓ Đã hoàn nguyên function zu về bản gốc 100%!');
}

const extExecStart = extractedMain.indexOf('async executeFlowImageRpc(');
const extExecEnd = extractedMain.indexOf('async executeFlowUploadImageRpc(', extExecStart);
const originalExec = extractedMain.slice(extExecStart, extExecEnd);

const curExecStart = mainCode.indexOf('async executeFlowImageRpc(');
const curExecEnd = mainCode.indexOf('async executeFlowUploadImageRpc(', curExecStart);
if (curExecStart !== -1 && curExecEnd !== -1 && originalExec) {
  mainCode = mainCode.slice(0, curExecStart) + originalExec + mainCode.slice(curExecEnd);
  console.log('  ✓ Đã hoàn nguyên async executeFlowImageRpc về bản gốc 100%!');
}

// 3.2 Hoàn nguyên getAccountCooldownMs
const extCdStart = extractedMain.indexOf('getAccountCooldownMs(e){');
const extCdEnd = extractedMain.indexOf('emitState(){', extCdStart);
const originalCd = extractedMain.slice(extCdStart, extCdEnd);

const curCdStart = mainCode.indexOf('getAccountCooldownMs(e){');
const curCdEnd = mainCode.indexOf('emitState(){', curCdStart);
if (curCdStart !== -1 && curCdEnd !== -1 && originalCd) {
  mainCode = mainCode.slice(0, curCdStart) + originalCd + mainCode.slice(curCdEnd);
  console.log('  ✓ Đã hoàn nguyên getAccountCooldownMs về bản gốc 100%!');
}

// 3.3 Hoàn nguyên markJobRecoveryNeeded
const extRcStart = extractedMain.indexOf('markJobRecoveryNeeded(e,t,A){');
const extRcEnd = extractedMain.indexOf('removeSession(e){', extRcStart);
const originalRc = extractedMain.slice(extRcStart, extRcEnd);

const curRcStart = mainCode.indexOf('markJobRecoveryNeeded(e,t,A){');
const curRcEnd = mainCode.indexOf('removeSession(e){', curRcStart);
if (curRcStart !== -1 && curRcEnd !== -1 && originalRc) {
  mainCode = mainCode.slice(0, curRcStart) + originalRc + mainCode.slice(curRcEnd);
  console.log('  ✓ Đã hoàn nguyên markJobRecoveryNeeded về bản gốc 100%!');
}

// 3.4 Hoàn nguyên defaultModel & Hm
mainCode = mainCode.replace(/defaultModel:\s*"GEM_PIX_2"/g, 'defaultModel:"NARWHAL"');

fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('  [+] app/out/main/index.js đã hoàn nguyên về trạng thái gốc! Length:', mainCode.length);

// -----------------------------------------------------------
// 4. LÀM SẠCH BROWSER-SESSIONS.JSON & QUEUE-STATE.JSON
// -----------------------------------------------------------
const sessionFile = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/browser-sessions.json';
if (fs.existsSync(sessionFile)) {
  const sessData = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
  const list = Object.values(sessData.sessions || sessData);
  list.forEach(s => {
    if (s.diagnostics) {
      delete s.diagnostics.cooldownUntil;
      delete s.diagnostics.cooldownReason;
      delete s.diagnostics.lastError;
      delete s.diagnostics.lastProviderErrorCode;
    }
    if (s.authStatus === 'Logged In') {
      s.viewState = 'Idle';
      s.healthScore = 100;
      s.healthLabel = 'Excellent';
    }
  });
  fs.writeFileSync(sessionFile, JSON.stringify(sessData, null, 2), 'utf8');
  console.log('  ✓ Đã làm sạch toàn bộ cooldown & lỗi trong browser-sessions.json');
}

const queueFile = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/queue-state.json';
if (fs.existsSync(queueFile)) {
  const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
  if (Array.isArray(queueData.jobs)) {
    queueData.jobs = queueData.jobs.filter(j => j.status === 'Completed');
  }
  fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2), 'utf8');
  console.log('  ✓ Đã dọn dẹp hàng đợi queue-state.json sạch bóng');
}

console.log('======================================================');
console.log('✅ HOÀN TẤT HOÀN NGUYÊN TOÀN BỘ HỆ THỐNG VỀ NGUYÊN BẢN GỐC!');
console.log('======================================================');
