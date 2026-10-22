const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetFile = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');
console.log('[*] Original VideoFactoryStudio.js length:', code.length);

// 1. UPDATE getSmartMotionPrompt
const oldSmartMotionStart = `// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)
function getSmartMotionPrompt(sceneId, creativeDirection = '', outfitName = '') {`;

const oldSmartMotionEnd = `    default:
      return \`The female KOC starts in the exact pose shown \${loc}. She performs natural fashion posing movements showcasing the outfit with mouth strictly closed. Handheld UGC smartphone camera. Mouth strictly closed throughout. Soundscape: fabric rustling, natural room ambience.\`;
  }
}`;

const pSmartStart = code.indexOf(oldSmartMotionStart);
const pSmartEnd = code.indexOf(oldSmartMotionEnd, pSmartStart);

if (pSmartStart === -1 || pSmartEnd === -1) {
  console.error('❌ Could not find getSmartMotionPrompt block!');
  process.exit(1);
}

const newSmartMotionBlock = `// 🎬 KỊCH BẢN CHUYỂN ĐỘNG CHUẨN 1:1 GOOGLE FLOW (TEMPORAL UGC FASHION & SOUNDSCAPE)
// QUY TẮC CỐT LÕI: NỮ TÍNH, DỊU DÀNG, TỪ TỐN - TUYỆT ĐỐI KHÔNG XOAY CUỒN CUỘN, KHÔNG LẮC ĐẦU LIA LỊA
function getSmartMotionPrompt(sceneId, creativeDirection = '', outfitName = '') {
  const loc = creativeDirection ? \`in \${creativeDirection}\` : 'in a luxury bedroom';
  switch (Number(sceneId)) {
    case 1:
      const garment = outfitName ? \`a gorgeous \${outfitName} matching the reference photo\` : 'the stunning new garment matching the reference outfit';
      return \`A young East Asian woman with long wavy black hair wearing silk pajamas \${loc}, starts in the exact pose shown holding a black shopping bag. Over 8 seconds, she gently unboxes the package with calm, graceful feminine poise, carefully peeling open the bag to reveal \${garment}. She holds the dress up against herself, beaming with a soft, confident closed-lip smile. Handheld smartphone camera with subtle natural breathing movement. Mouth strictly closed. Soundscape: soft plastic package peeling, gentle crinkling courier bag, delicate fabric rustle, ambient room tone.\`;
    case 2:
      return \`The same female KOC starts in the exact pose shown \${loc}. Standing in place, she takes one gentle step forward closer to the camera to inspect the dress quality. With slow and graceful feminine movements, she gently rotates the dress to inspect front and back, delicately caresses and feels the fabric texture between her fingers, and holds the garment up against herself so viewers can clearly feel and appreciate the rich material and craftsmanship, smiling warmly with mouth strictly closed. Handheld close-up UGC smartphone camera. Mouth strictly closed throughout. Soundscape: gentle cloth friction, soft fabric rubbing, delicate textile rustle, quiet room ambience.\`;
    case 3:
      return \`The same female KOC starts in the exact pose shown, now wearing the stunning new outfit \${loc}. She performs a graceful, slow-paced fashion walk directly towards the camera with gentle, poised feminine strides (no rushing), smiling warmly with mouth strictly closed. Handheld tracking camera gently stepping backward, authentic UGC lifestyle. Mouth strictly closed throughout. Soundscape: gentle soft footstep sounds, delicate fabric swishing with movement, peaceful room tone.\`;
    case 4:
      return \`The same female KOC starts in the exact pose shown \${loc}. She slowly and elegantly turns around with a gentle, calm rotation (strictly no rapid spinning), gracefully showcasing the dress silhouette, drape, and back design with soft feminine poise and a radiant closed-mouth smile. Smooth handheld circular camera follow. Mouth strictly closed throughout. Soundscape: delicate swoosh of fabric in air, gentle room acoustics.\`;
    case 5:
      return \`The same female KOC starts in the exact pose shown \${loc}. With a slow, poised motion, she gently tilts her angle for an elegant over-the-shoulder look, softly touching a lock of hair with delicate fingers while looking warmly into the lens (calm, steady gaze, no sudden head turns or shaking), mouth firmly closed. Subtle handheld camera drift, soft flattering lighting. Mouth strictly closed throughout. Soundscape: faint hair touch, soft room tone, quiet atmospheric hum.\`;
    case 6:
      return \`The same female KOC starts in the exact pose shown \${loc}. She assumes a poised, elegant fashion stance with hands lightly and softly resting near her waist, swaying with slow, subtle feminine grace to highlight the garment's fit and comfort, smiling brightly with mouth closed. Handheld natural eye-level framing. Mouth strictly closed throughout. Soundscape: subtle cloth rustling, gentle indoor room acoustics.\`;
    case 7:
      return \`The same female KOC starts in the exact pose shown \${loc}. She offers a gentle, slow feminine wave goodbye to the camera and takes a calm, poised step back as a sweet closing gesture, beaming with a sincere closed-mouth smile. Handheld camera slowly pulling back. Mouth strictly closed throughout. Soundscape: gentle hand motion in air, soft room ambience, calm closing vibe.\`;
    default:
      return \`The female KOC starts in the exact pose shown \${loc}. She performs slow, gentle, and graceful feminine movements showcasing the outfit with soft poise and mouth strictly closed. Strictly no rapid spinning or head shaking. Handheld UGC smartphone camera. Mouth strictly closed throughout. Soundscape: delicate fabric rustling, natural room ambience.\`;
  }
}`;

code = code.substring(0, pSmartStart) + newSmartMotionBlock + code.substring(pSmartEnd + oldSmartMotionEnd.length);
console.log('  ✓ Đã cập nhật getSmartMotionPrompt (Cảnh 2 kiểm tra váy & chuyển động dịu dàng nữ tính)');

// 2. UPDATE callGeminiVisionDirector
const oldGeminiStart = `async function callGeminiVisionDirector(frame, action, apiKey, outfitAsset = null) {`;
const oldGeminiEnd = `  parts.push({ text: promptText });`;

const pGeminiStart = code.indexOf(oldGeminiStart);
const pGeminiEnd = code.indexOf(oldGeminiEnd, pGeminiStart);

if (pGeminiStart === -1 || pGeminiEnd === -1) {
  console.error('❌ Could not find callGeminiVisionDirector block!');
  process.exit(1);
}

const newGeminiBlock = `async function callGeminiVisionDirector(frame, action, apiKey, outfitAsset = null) {
  if (!frame?.imageAsset) {
    return { ok: false, error: "Cảnh này chưa có hình ảnh để phân tích" };
  }

  const cleanB64 = await ensureAssetBase64(frame.imageAsset);
  if (!cleanB64) {
    return { ok: false, error: "Không thể trích xuất ảnh base64 của Cảnh " + frame.id };
  }

  const isScene1 = Number(frame.id) === 1;
  const isScene2 = Number(frame.id) === 2;
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
3. 8-SECOND GENTLE UNBOXING ACTION PACING:
   "Over 8 seconds, she gently and gracefully unboxes the package with calm feminine poise, peeling open the bag to reveal [detailed garment description from Image 2]. She softly holds the dress up against herself, beaming with an excited closed-lip smile."
4. GENTLE FEMININE POISE & NO RAPID HEAD SHAKING:
   Movements must be calm, slow-paced, gentle, and poised (nữ tính, dịu dàng, từ tốn). Strictly NO wild frantic gestures, NO rapid head shaking.
5. CAMERA & FACIAL DIRECTING:
   "Handheld shaky camera. Mouth strictly closed." (Zero mouth distortion, authentic TikTok/Reels smartphone aesthetic).
6. AMBIENT SOUNDSCAPE LINE:
   "Soundscape: soft plastic package peeling, gentle crinkling courier bag, delicate fabric rustle, ambient room tone."

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;
  } else if (isScene2) {
    parts = [
      { inline_data: { mime_type: 'image/jpeg', data: cleanB64 } }
    ];

    promptText = \`You are the master cinematic AI director for Google Veo 3 and Veo 3.1 video production.
Analyze this high-fashion commercial storyboard reference photo for Scene 2: Detailed Fabric and Garment Quality Inspection.

EXACT SCRIPT & ACTION REQUIREMENT FOR SCENE 2:
The video must describe the female presenter standing in place, then taking ONE gentle, poised step forward closer to the camera.
She performs slow, delicate, and graceful feminine movements to inspect the dress/garment quality:
- Rotating and turning the dress front and back to examine all angles.
- Delicately touching, feeling, and softly rubbing the fabric texture between her fingertips to inspect the fine weave and material quality.
- Holding the dress up against herself to test the silhouette and drape.
The visual priority is to let the viewer clearly feel, see, and perceive the rich fabric material, texture, and craftsmanship.

YOU MUST STRICTLY ENFORCE THESE CORE DIRECTING RULES:
RULE 1: FIRST FRAME ANCHOR (Zero Flicker Guarantee)
The video MUST seamlessly begin from the exact starting pose, facial angle, clothing details, and environment shown in the reference image. Zero jumping or flickering.

RULE 2: GENTLE, FEMININE & POISED MOVEMENT (No Frantic Motion / No Rapid Head Shaking)
The presenter's movements must be slow, gentle, poised, and naturally feminine (ra dáng con gái nhẹ nhàng từ tốn). Strictly FORBID rapid spinning, frantic movements, jerky actions, or vigorous head-shaking. Every action is calm, graceful, and smooth.

RULE 3: MOUTH STRICTLY CLOSED (No Speaking / No Distortion)
The presenter's mouth MUST remain strictly closed throughout the entire 8-second video with a radiant, genuine closed-mouth commercial smile. Absolutely NO lip movement or talking.

RULE 4: SMARTPHONE UGC CAMERA STYLE (Authentic TikTok / Reels Aesthetic)
Direct as a handheld smartphone shot (iPhone 15 Pro UGC aesthetic) with subtle organic handheld shake and natural close-up framing highlighting the fabric texture.

RULE 5: REALISTIC SOUNDSCAPE LINE
At the end, include: "Soundscape: gentle cloth friction, soft fabric rubbing, delicate textile rustle, quiet room ambience."

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

RULE 2: GENTLE, FEMININE & POISED MOVEMENT (No Wild Spinning / No Rapid Head Shaking)
The female presenter's movements must be gentle, calm, slow-paced, and gracefully feminine (ra dáng con gái nhẹ nhàng từ tốn). Poses, turns, and weight shifts must be soft, poised, and smooth. Strictly FORBID rapid spinning, frantic twirling, vigorous head shaking, or jerky erratic gestures.

RULE 3: MOUTH STRICTLY CLOSED (No Speaking / No Distortion)
The presenter's mouth MUST remain strictly closed throughout the entire 8-second video. They maintain a radiant, natural, genuine closed-mouth commercial smile. Absolutely NO lip movement, NO mouth opening, NO speaking animation, preventing any facial distortion.

RULE 4: SMARTPHONE UGC CAMERA STYLE (Authentic TikTok / Reels Aesthetic)
Direct the camera as an authentic handheld smartphone shot (iPhone 15 Pro UGC aesthetic). Incorporate subtle organic handheld breathing shake, dynamic focus tracking, and natural eye-level framing—NOT artificial cinematic Hollywood staging.

RULE 5: REALISTIC SOUNDSCAPE LINE (Detailed Ambient Audio Design)
At the very end of the prompt, include a dedicated ambient soundscape sentence tailored specifically to the action (e.g. realistic plastic tearing sound of the courier bag, delicate fabric rustle as the dress moves, soft footsteps on hardwood floor, warm ambient room tone).

RULE 6: 8-SECOND CONTINUOUS MOTION PACING (Paced Natural Flow)
Describe smooth, continuous physical pacing designed precisely for an 8-second clip. Detail physical weight shifts, natural fabric drape and inertia sway, hair movement, and elegant posture transitions without rushing.

OUTPUT FORMAT:
Return ONLY the raw English prompt text ready for Veo 3. Do NOT include markdown code blocks, quotes, or conversational preamble.\`;
  }
  parts.push({ text: promptText });`;

code = code.substring(0, pGeminiStart) + newGeminiBlock + code.substring(pGeminiEnd + oldGeminiEnd.length);
console.log('  ✓ Đã cập nhật callGeminiVisionDirector (Đặc quyền Cảnh 2 & Quy tắc chuyển động nữ tính)');

// 3. UPDATE generateSingleImage (Scene 1: ONLY 1 reference image = KOC)
const oldSingleGenStart = `  // 1. Tạo 1 Ảnh Đơn Lẻ (Chuỗi tham chiếu Google Flow: Cảnh 1 -> 2,3 -> 4,5,6,7)
  const generateSingleImage = async (frameId) => {
    const cs = stateRef.current;
    if (!cs.koc || !cs.outfit) {
      toast?.warn?.("Vui lòng tải lên cả Gương mặt KOC và Mẫu Trang phục trước!");
      return;
    }`;

const newSingleGenStart = `  // 1. Tạo 1 Ảnh Đơn Lẻ (Chuỗi tham chiếu Google Flow: Cảnh 1 -> 2,3 -> 4,5,6,7)
  const generateSingleImage = async (frameId) => {
    const cs = stateRef.current;
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
    }`;

if (!code.includes(oldSingleGenStart)) {
  console.error('❌ Could not find oldSingleGenStart!');
  process.exit(1);
}
code = code.replace(oldSingleGenStart, newSingleGenStart);

// Also in generateSingleImage refs calculation:
const oldRefsSingle = `      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
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
      const refs = [validKocId, validOutfitId].filter(Boolean);`;

const newRefsSingle = `      const validKocId = await ensureRegisteredAsset(cs.koc, 'koc_face.jpg');
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
      const refs = Number(frameId) === 1 ? [validKocId].filter(Boolean) : [validKocId, validOutfitId].filter(Boolean);`;

if (!code.includes(oldRefsSingle)) {
  console.error('❌ Could not find oldRefsSingle!');
  process.exit(1);
}
code = code.replace(oldRefsSingle, newRefsSingle);
console.log('  ✓ Đã cập nhật generateSingleImage (Cảnh 1 chỉ nạp 1 ảnh tham chiếu KOC)');

// 4. UPDATE generateAllImages (Case 1: refs calculation)
const oldRefsCase1 = `          const finalPrompt = buildSceneImagePrompt(frame.imagePrompt, cs.creativeDirection, cs.technicalStyle);
          const refs = [validKocId, validOutfitId];
          if (frame.id > 1 && validFrame1Id) {
            refs.push(validFrame1Id);
          }
          if (frame.id >= 4 && validFrame3Id) {
            refs.push(validFrame3Id);
          }`;

const newRefsCase1 = `          const finalPrompt = buildSceneImagePrompt(frame.imagePrompt, cs.creativeDirection, cs.technicalStyle);
          // Cảnh 1 chỉ nạp duy nhất 1 ảnh tham chiếu là KOC!
          const refs = Number(frame.id) === 1 ? [validKocId].filter(Boolean) : [validKocId, validOutfitId].filter(Boolean);
          if (frame.id > 1 && validFrame1Id) {
            refs.push(validFrame1Id);
          }
          if (frame.id >= 4 && validFrame3Id) {
            refs.push(validFrame3Id);
          }`;

if (!code.includes(oldRefsCase1)) {
  console.error('❌ Could not find oldRefsCase1!');
  process.exit(1);
}
code = code.replace(oldRefsCase1, newRefsCase1);

// 5. UPDATE generateAllImages (Case 3: f1Job referenceAssetIds)
const oldF1JobRef = `            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            referenceAssetIds: [validKocId, validOutfitId].filter(Boolean),`;

const newF1JobRef = `            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,
            ratio: "9:16",
            aspectRatio: "9:16",
            // 🎯 CẢNH 1 CHỈ NẠP DUY NHẤT 1 ẢNH THAM CHIẾU LÀ GƯƠNG MẶT KOC (KHÔNG NẠP OUTFIT)
            referenceAssetIds: [validKocId].filter(Boolean),`;

if (!code.includes(oldF1JobRef)) {
  console.error('❌ Could not find oldF1JobRef!');
  process.exit(1);
}
code = code.replace(oldF1JobRef, newF1JobRef);
console.log('  ✓ Đã cập nhật generateAllImages (Cảnh 1 chỉ nạp duy nhất 1 ảnh KOC)');

// 6. UPDATE analyzeMotion actions
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

const newActionsStart = `      let action = "";
      switch (Number(frame.id)) {
        case 1: action = "Gently and excitedly unboxing the courier bag with calm feminine poise, delicate package opening, looking at camera with a soft closed-mouth smile."; break;
        case 2: action = "Standing in place, takes 1 gentle step closer to the camera to inspect garment quality, slowly turning and rotating the dress front and back, gently rubbing and feeling the fabric texture between her fingers, and holding it against herself to clearly showcase the rich fabric material and fine craftsmanship, smiling gracefully with mouth strictly closed."; break;
        case 3: action = "Graceful, slow-paced fashion runway walk towards camera with gentle poised strides, smiling warmly with mouth closed, showing full outfit in smooth motion."; break;
        case 4: action = "Slow, elegant 360-degree turn with smooth gentle movement (strictly no fast spinning), showcasing the dress drape and silhouette from all angles with feminine poise."; break;
        case 5: action = "Slow, graceful over-the-shoulder look, delicate touch of hair, calm steady gaze directly at lens with mouth closed (no abrupt head turns or shaking)."; break;
        case 6: action = "Poised and feminine stance, subtle gentle sway highlighting the garment fit, calm confident posture with mouth closed."; break;
        case 7: action = "Gentle, slow wave goodbye and calm step back with a genuine, soft closed-mouth smile."; break;
        default: action = "Calm, gentle, and graceful feminine fashion posing movements with soft poise and mouth strictly closed.";
      }`;

if (!code.includes(oldActionsStart)) {
  console.error('❌ Could not find oldActionsStart!');
  process.exit(1);
}
code = code.replace(oldActionsStart, newActionsStart);
console.log('  ✓ Đã cập nhật actions trong analyzeMotion (Cảnh 2 kiểm tra chất lượng váy & động tác nữ tính từ tốn)');

fs.writeFileSync(targetFile, code, 'utf8');
console.log('[*] File VideoFactoryStudio.js đã được lưu thành công. Length:', code.length);

// Verify syntax
try {
  execSync(`node --check "${targetFile}"`, { stdio: 'pipe' });
  console.log('✅ Syntax Check PASSED 100%!');
} catch (e) {
  console.error('❌ Syntax Error in VideoFactoryStudio.js:', e.message);
  process.exit(1);
}
