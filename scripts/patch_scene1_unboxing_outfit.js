const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/renderer/assets/VideoFactoryStudio.js');
let content = fs.readFileSync(targetFile, 'utf8');
console.log('Original length:', content.length);

// 1. UPDATE callGeminiVisionDirector signature & body
const oldGeminiStart = `async function callGeminiVisionDirector(frame, action, apiKey) {
  if (!frame?.imageAsset) {
    return { ok: false, error: "Cảnh này chưa có hình ảnh để phân tích" };
  }

  const cleanB64 = await ensureAssetBase64(frame.imageAsset);
  if (!cleanB64) {
    return { ok: false, error: "Không thể trích xuất ảnh base64 của Cảnh " + frame.id };
  }

  const promptText = \`You are the master cinematic AI director for Google Veo 3 and Veo 3.1 video production.
Analyze this high-fashion commercial storyboard reference photo for Scene \${frame.id}.
The primary scene action is: "\${action}"

Generate a single, hyper-realistic, production-ready video motion prompt for an 8-second commercial scene.

YOU MUST STRICTLY ENFORCE THESE 5 CORE DIRECTING RULES:

RULE 1: FIRST FRAME ANCHOR (Zero Flicker Guarantee)
The video MUST seamlessly begin from the exact starting pose, facial angle, clothing details, and environment shown in the reference image. Zero jumping or flickering when transitioning from the static frame into continuous video motion.

RULE 2: MOUTH STRICTLY CLOSED (No Speaking / No Distortion)
The presenter's mouth MUST remain strictly closed throughout the entire 8-second video. They maintain a radiant, natural, genuine closed-mouth commercial smile. Absolutely NO lip movement, NO mouth opening, NO speaking animation, preventing any facial distortion.

RULE 3: SMARTPHONE UGC CAMERA STYLE (Authentic TikTok / Reels Aesthetic)
Direct the camera as an authentic handheld smartphone shot (iPhone 15 Pro UGC aesthetic). Incorporate subtle organic handheld breathing shake, dynamic focus tracking, and natural eye-level framing—NOT artificial cinematic Hollywood staging.

RULE 4: REALISTIC SOUNDSCAPE LINE (Detailed Ambient Audio Design)
At the very end of the prompt, include a dedicated ambient soundscape sentence tailored specifically to the action (e.g. realistic plastic tearing sound of the courier bag, delicate fabric rustle as the dress moves, soft footsteps on hardwood floor, warm ambient room tone).

RULE 5: 8-SECOND CONTINUOUS MOTION PACING (Paced Natural Flow)
Describe smooth, continuous physical pacing designed precisely for an 8-second clip. Detail physical weight shifts, natural fabric drape and inertia sway, hair movement, and elegant posture transitions without rushing.

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;`;

const newGeminiStart = `async function callGeminiVisionDirector(frame, action, apiKey, outfitAsset = null) {
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
   "Over 8 seconds, she excitedly rips open the bag and pulls out [detailed garment description from Image 2]. She holds the dress up against herself, beaming with an excited closed-lip smile."
4. CAMERA & FACIAL DIRECTING:
   "Handheld shaky camera. Mouth strictly closed." (Zero mouth distortion, authentic TikTok/Reels smartphone aesthetic).
5. AMBIENT SOUNDSCAPE LINE:
   "Soundscape: loud plastic package tearing, crinkling courier bag, soft fabric rustle, ambient room tone."

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

YOU MUST STRICTLY ENFORCE THESE 5 CORE DIRECTING RULES:

RULE 1: FIRST FRAME ANCHOR (Zero Flicker Guarantee)
The video MUST seamlessly begin from the exact starting pose, facial angle, clothing details, and environment shown in the reference image. Zero jumping or flickering when transitioning from the static frame into continuous video motion.

RULE 2: MOUTH STRICTLY CLOSED (No Speaking / No Distortion)
The presenter's mouth MUST remain strictly closed throughout the entire 8-second video. They maintain a radiant, natural, genuine closed-mouth commercial smile. Absolutely NO lip movement, NO mouth opening, NO speaking animation, preventing any facial distortion.

RULE 3: SMARTPHONE UGC CAMERA STYLE (Authentic TikTok / Reels Aesthetic)
Direct the camera as an authentic handheld smartphone shot (iPhone 15 Pro UGC aesthetic). Incorporate subtle organic handheld breathing shake, dynamic focus tracking, and natural eye-level framing—NOT artificial cinematic Hollywood staging.

RULE 4: REALISTIC SOUNDSCAPE LINE (Detailed Ambient Audio Design)
At the very end of the prompt, include a dedicated ambient soundscape sentence tailored specifically to the action (e.g. realistic plastic tearing sound of the courier bag, delicate fabric rustle as the dress moves, soft footsteps on hardwood floor, warm ambient room tone).

RULE 5: 8-SECOND CONTINUOUS MOTION PACING (Paced Natural Flow)
Describe smooth, continuous physical pacing designed precisely for an 8-second clip. Detail physical weight shifts, natural fabric drape and inertia sway, hair movement, and elegant posture transitions without rushing.

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;
  }
  parts.push({ text: promptText });`;

if (!content.includes(oldGeminiStart)) {
  console.error('Could not find oldGeminiStart!');
  process.exit(1);
}
content = content.replace(oldGeminiStart, newGeminiStart);
console.log('1. Updated callGeminiVisionDirector with dual-image outfit support');

// Also update body of fetch in callGeminiVisionDirector
const oldFetchBody = `          contents: [{
            parts: [
              { inline_data: { mime_type: 'image/jpeg', data: cleanB64 } },
              { text: promptText }
            ]
          }],`;

const newFetchBody = `          contents: [{
            parts: parts
          }],`;

if (!content.includes(oldFetchBody)) {
  console.error('Could not find oldFetchBody!');
  process.exit(1);
}
content = content.replace(oldFetchBody, newFetchBody);
console.log('2. Updated fetch body to use dynamic parts');

// 2. UPDATE call site in analyzeMotion
const oldCallSite = `      // Ưu tiên gọi trực tiếp qua Gemini Vision API
      let res = await callGeminiVisionDirector(frame, action, activeKey);`;

const newCallSite = `      // Ưu tiên gọi trực tiếp qua Gemini Vision API (Cảnh 1 kèm ảnh Outfit tham chiếu)
      let res = await callGeminiVisionDirector(frame, action, activeKey, Number(frame.id) === 1 ? cs.outfit : null);`;

if (!content.includes(oldCallSite)) {
  console.error('Could not find oldCallSite!');
  process.exit(1);
}
content = content.replace(oldCallSite, newCallSite);
console.log('3. Updated analyzeMotion call to pass cs.outfit for Scene 1');

// 3. UPDATE generateSingleVideo referenceAssetIds for Scene 1
const oldSingleRef = `          // 🎯 CHỈ NẠP DUY NHẤT ẢNH CẢNH NÀY ĐỂ MUSE AI BIẾN ĐÚNG ẢNH TĨNH THÀNH VIDEO
          referenceAssetIds: validAssetId ? [validAssetId] : [],
          referenceLocalPath: frame?.imageAsset?.localPath || undefined,
          referenceUrl: frame?.imageAsset?.url || undefined,
          resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
          studioSource: "fashion-factory",
          removeWatermark: cs.removeWatermark,
          autoRemoveWatermark: cs.removeWatermark,
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        } : {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: promptToSend,
          flowVideoMode: validAssetId ? "I2V" : "T2V",
          videoMode: validAssetId ? "I2V" : "T2V",
          mode: validAssetId ? "I2V" : "T2V",
          // 🎯 CHỈ NẠP DUY NHẤT ẢNH CẢNH NÀY LÀM START FRAME CHO VEO 3
          referenceAssetIds: validAssetId ? [validAssetId] : [],
          inputImageAssetId: validAssetId || undefined,
          firstFrameImageMediaId: validAssetId || undefined,
          startImageMediaId: validAssetId || undefined,`;

const newSingleRef = `          // 🎯 NẠP CẢ ẢNH CẢNH 1 VÀ ẢNH OUTFIT THAM CHIẾU CHO CẢNH 1 ĐỂ KHÓA TRANG PHỤC
          referenceAssetIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
          referenceLocalPath: frame?.imageAsset?.localPath || undefined,
          referenceUrl: frame?.imageAsset?.url || undefined,
          resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
          studioSource: "fashion-factory",
          removeWatermark: cs.removeWatermark,
          autoRemoveWatermark: cs.removeWatermark,
          account: targetAccName || (isManual ? undefined : "Auto"),
          accountSelection: isManual ? "manual" : "auto"
        } : {
          title: \`[KOC Thời Trang] Video Cảnh \${frameId}\`,
          prompt: promptToSend,
          flowVideoMode: validAssetId ? "I2V" : "T2V",
          videoMode: validAssetId ? "I2V" : "T2V",
          mode: validAssetId ? "I2V" : "T2V",
          // 🎯 NẠP CẢ ẢNH CẢNH 1 LÀM START FRAME VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ VEO 3 KHÓA TRANG PHỤC
          referenceAssetIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
          inputImageAssetId: validAssetId || undefined,
          firstFrameImageMediaId: validAssetId || undefined,
          startImageMediaId: validAssetId || undefined,
          referenceImageMediaIds: (Number(frameId) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id] : [],`;

if (!content.includes(oldSingleRef)) {
  console.error('Could not find oldSingleRef!');
  process.exit(1);
}
content = content.replace(oldSingleRef, newSingleRef);
console.log('4. Updated generateSingleVideo referenceAssetIds & referenceImageMediaIds for Scene 1');

// 4. UPDATE renderAllVideos referenceAssetIds for Scene 1
const oldRenderAllRef = `            // 🎯 CHỈ NẠP ẢNH CỦA CẢNH ĐÓ ĐỂ ĐỒNG NHẤT NHÂN VẬT & TƯ THẾ
            referenceAssetIds: validAssetId ? [validAssetId] : [],
            referenceLocalPath: frame?.imageAsset?.localPath || undefined,
            referenceUrl: frame?.imageAsset?.url || undefined,
            resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "fashion-factory",
            removeWatermark: cs.removeWatermark,
            autoRemoveWatermark: cs.removeWatermark,
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          } : {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: promptToSend,
            flowVideoMode: validAssetId ? "I2V" : "T2V",
            videoMode: validAssetId ? "I2V" : "T2V",
            mode: validAssetId ? "I2V" : "T2V",
            // 🎯 CHỈ NẠP ẢNH CỦA CẢNH ĐÓ LÀM START FRAME CHO VEO 3
            referenceAssetIds: validAssetId ? [validAssetId] : [],
            inputImageAssetId: validAssetId || undefined,
            firstFrameImageMediaId: validAssetId || undefined,
            startImageMediaId: validAssetId || undefined,`;

const newRenderAllRef = `            // 🎯 NẠP CẢ ẢNH CẢNH 1 VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ KHÓA TRANG PHỤC CẢNH 1
            referenceAssetIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
            referenceLocalPath: frame?.imageAsset?.localPath || undefined,
            referenceUrl: frame?.imageAsset?.url || undefined,
            resolutionName: cs.videoResolution === '1080p' ? "1080p" : "720p",
            studioSource: "fashion-factory",
            removeWatermark: cs.removeWatermark,
            autoRemoveWatermark: cs.removeWatermark,
            account: targetAccName || (isManual ? undefined : "Auto"),
            accountSelection: isManual ? "manual" : "auto"
          } : {
            title: \`[KOC Thời Trang] Video Cảnh \${frame.id}\`,
            prompt: promptToSend,
            flowVideoMode: validAssetId ? "I2V" : "T2V",
            videoMode: validAssetId ? "I2V" : "T2V",
            mode: validAssetId ? "I2V" : "T2V",
            // 🎯 NẠP CẢ ẢNH CẢNH 1 LÀM START FRAME VÀ ẢNH OUTFIT THAM CHIẾU ĐỂ VEO 3 KHÓA TRANG PHỤC
            referenceAssetIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [validAssetId, cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id].filter(Boolean) : (validAssetId ? [validAssetId] : []),
            inputImageAssetId: validAssetId || undefined,
            firstFrameImageMediaId: validAssetId || undefined,
            startImageMediaId: validAssetId || undefined,
            referenceImageMediaIds: (Number(frame.id) === 1 && (cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id)) ? [cs.outfit?.assetId || cs.outfit?.mediaId || cs.outfit?.id] : [],`;

if (!content.includes(oldRenderAllRef)) {
  console.error('Could not find oldRenderAllRef!');
  process.exit(1);
}
content = content.replace(oldRenderAllRef, newRenderAllRef);
console.log('5. Updated renderAllVideos referenceAssetIds & referenceImageMediaIds for Scene 1');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Saved VideoFactoryStudio.js successfully. New length:', content.length);
