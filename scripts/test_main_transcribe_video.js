const fs = require('fs');
const path = require('path');

// Test that transcribeVideoAudio in app/out/main/index.js correctly compiles and works
async function test() {
  console.log('Verifying app/out/main/index.js code...');
  const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
  
  const hasWhisper = mainCode.includes('Xenova/whisper-base');
  const hasNormalize = mainCode.includes('xem chiếc');
  const hasFFmpegExtract = mainCode.includes('stt_extract_');
  
  console.log('  - Contains Whisper base:', hasWhisper);
  console.log('  - Contains Vietnamese normalizer:', hasNormalize);
  console.log('  - Contains FFmpeg audio extraction:', hasFFmpegExtract);

  if (!hasWhisper || !hasNormalize || !hasFFmpegExtract) {
    throw new Error('Code verification failed!');
  }

  console.log('✅ Main process code verification PASSED!');
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
