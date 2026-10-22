const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Update getSmartMotionPrompt case 2
const oldCase2 = `case 2:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, she holds the dress close to the camera, gently rubbing and feeling the fabric texture between her fingers, examining the stitching with an appreciative closed-mouth smile. Handheld smartphone camera with natural slight movement. Mouth strictly closed. Soundscape: soft fabric rubbing, delicate textile rustle, quiet room ambience.\`;`;

const newCase2 = `case 2:
      return \`The same female KOC starts in the exact pose shown \${loc}. Over 8 seconds, while standing in place she takes 1 gentle step closer to the camera to inspect garment quality, slowly turning and rotating the dress front and back, delicately feeling and rubbing the fabric texture between her fingers, and holding it against herself so viewers can clearly perceive the weave and premium material quality. All movements are calm, slow-paced, graceful and feminine (strictly NO rapid spinning or frantic head shaking). Handheld smartphone camera with subtle natural breathing shake. Mouth strictly closed throughout. Soundscape: soft fabric rubbing, delicate textile rustle, quiet room ambience.\`;`;

if (code.includes(oldCase2)) {
  code = code.replace(oldCase2, newCase2);
  console.log('✅ Updated getSmartMotionPrompt case 2');
} else {
  console.log('⚠️ oldCase2 not found directly, checking case 2...');
  const c2Idx = code.indexOf('case 2:');
  const c3Idx = code.indexOf('case 3:', c2Idx);
  if (c2Idx !== -1 && c3Idx !== -1) {
    code = code.substring(0, c2Idx) + newCase2 + '\n    ' + code.substring(c3Idx);
    console.log('✅ Replaced case 2 block in getSmartMotionPrompt');
  }
}

// 2. Update callGeminiVisionDirector with dedicated Scene 2 directive
const targetRule6 = `RULE 6: METICULOUS OUTFIT & SCENE CONTINUITY (Flawless Consistency)
Maintain exact continuity with the reference image: same clothing details, same lighting temperature, same room architecture, same character likeness.`;

const enhancedRules = `RULE 6: METICULOUS OUTFIT & SCENE CONTINUITY (Flawless Consistency)
Maintain exact continuity with the reference image: same clothing details, same lighting temperature, same room architecture, same character likeness.

RULE 7: FEMININE, CALM, SLOW-PACED MOVEMENT (Anti-Frantic Rule)
Every character movement, gesture, and pose transition MUST be calm, gentle, slow-paced, and feminine. Strictly forbid rapid twirling, frantic spinning, or erratic head shaking.
\${Number(frame.id) === 2 ? \`
SPECIAL DIRECTIVE FOR SCENE 2 (GARMENT & FABRIC QUALITY INSPECTION):
The female character stands in place, takes 1 deliberate step forward closer to the camera to inspect dress quality. She gently rotates and displays the dress front and back, rubs and feels the fabric weave texture between her fingers, and holds the garment against her body so viewers can clearly see and appreciate the material quality, fabric drape, and weave details.\` : ''}`;

if (code.includes(targetRule6)) {
  code = code.replace(targetRule6, enhancedRules);
  console.log('✅ Added Rule 7 and dedicated Scene 2 inspection directive to callGeminiVisionDirector');
}

fs.writeFileSync(file, code, 'utf8');
console.log('🎉 VideoFactoryStudio.js updated successfully!');
