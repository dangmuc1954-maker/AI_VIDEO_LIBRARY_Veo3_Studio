const fs = require('fs');

const file = 'app/out/renderer/assets/VideoFactoryStudio.js';
const code = fs.readFileSync(file, 'utf8');

console.log('1. Check getEffectiveKocProfile:');
const kocProfIdx = code.indexOf('function getEffectiveKocProfile(');
if (kocProfIdx !== -1) {
  console.log(code.substring(kocProfIdx, kocProfIdx + 450));
}

console.log('\n2. Check buildEnhancedVideoPrompt:');
const buildIdx = code.indexOf('function buildEnhancedVideoPrompt(');
if (buildIdx !== -1) {
  console.log(code.substring(buildIdx, buildIdx + 600));
}

console.log('\n3. Check Muse referenceAssetIds in handleGenerateSingleVideo:');
const singleIdx = code.indexOf('const handleGenerateSingleVideo =');
if (singleIdx !== -1) {
  const refIdx = code.indexOf('referenceAssetIds: [],', singleIdx);
  console.log('Found in handleGenerateSingleVideo at', refIdx);
}

console.log('\n4. Check Muse referenceAssetIds in handleGenerateAllVideos:');
const allIdx = code.indexOf('const handleGenerateAllVideos =');
if (allIdx !== -1) {
  const refIdx = code.indexOf('referenceAssetIds: [],', allIdx);
  console.log('Found in handleGenerateAllVideos at', refIdx);
}
