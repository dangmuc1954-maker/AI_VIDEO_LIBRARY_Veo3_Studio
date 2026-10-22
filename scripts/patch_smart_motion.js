const fs = require('fs');
const targetFile = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(targetFile, 'utf8');

const target1 = `function getSmartMotionPrompt(sceneId, creativeDirection = '') {
  const loc = creativeDirection ? \`in \${creativeDirection}\` : 'in a luxurious modern bedroom with soft ambient lighting';
  switch (Number(sceneId)) {
    case 1:
      return \`A stylish young female KOC starts in the exact pose shown wearing comfortable pajamas \${loc}. She enthusiastically tears open the black plastic courier shipping bag with both hands, inspecting the newly arrived garment with a confident closed-mouth smile. Handheld smartphone UGC camera motion, subtle authentic shake, warm room lighting. Mouth strictly closed throughout. Soundscape: plastic courier bag tearing and rustling, adhesive tape peel, peaceful room tone.\`;`;

const repl1 = `function getSmartMotionPrompt(sceneId, creativeDirection = '', outfitName = '') {
  const loc = creativeDirection ? \`in \${creativeDirection}\` : 'in a luxury bedroom';
  switch (Number(sceneId)) {
    case 1:
      const garment = outfitName ? \`a gorgeous \${outfitName} matching the reference photo\` : 'the stunning new garment matching the reference outfit';
      return \`A young East Asian woman with long wavy black hair wearing silk pajamas \${loc}, starts in the exact pose shown holding a black shopping bag. Over 8 seconds, she excitedly rips open the bag and pulls out \${garment}. She holds the dress up against herself, beaming with an excited closed-lip smile. Handheld shaky camera. Mouth strictly closed. Soundscape: loud plastic package tearing, crinkling courier bag, soft fabric rustle, ambient room tone.\`;`;

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  content = content.replace(
    'promptToSend = frame.videoPrompt || getSmartMotionPrompt(frameId, cs.creativeDirection);',
    'promptToSend = frame.videoPrompt || getSmartMotionPrompt(frameId, cs.creativeDirection, cs.outfit?.name || cs.outfit?.productName || cs.outfitName);'
  );
  content = content.replace(
    'promptToSend = frame.videoPrompt || getSmartMotionPrompt(frame.id, cs.creativeDirection);',
    'promptToSend = frame.videoPrompt || getSmartMotionPrompt(frame.id, cs.creativeDirection, cs.outfit?.name || cs.outfit?.productName || cs.outfitName);'
  );
  fs.writeFileSync(targetFile, content, 'utf8');
  console.log('Successfully updated getSmartMotionPrompt!');
} else {
  console.log('Target1 not found!');
}
