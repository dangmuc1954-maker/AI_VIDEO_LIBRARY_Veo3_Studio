const fs = require('fs');

const orig = fs.readFileSync('extracted_original_20260912/out/main/index.js', 'utf8');
const ours = fs.readFileSync('app/out/main/index.js', 'utf8');

function extractMethod(code, name) {
  const idx = code.indexOf(name);
  if (idx === -1) return null;
  return code.slice(idx, idx + 1000);
}

['executeFlowUpscaleImageRpc', 'executeFlowVideoUpscaleRpc', 'function Ju(', 'function il(', 'removeImageWatermark', 'removeVideoWatermark'].forEach(name => {
  const origM = extractMethod(orig, name);
  const ourM = extractMethod(ours, name);
  if (!origM) console.log(`Orig missing ${name}`);
  if (!ourM) console.log(`Ours missing ${name}`);
  if (origM && ourM) {
    const isSame = origM === ourM;
    console.log(`Method ${name} is identical: ${isSame}`);
    if (!isSame) {
      console.log('Orig diff snippet:', origM.slice(0, 200));
      console.log('Ours diff snippet:', ourM.slice(0, 200));
    }
  }
});
