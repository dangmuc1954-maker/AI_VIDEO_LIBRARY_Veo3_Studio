const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const vsCode = fs.readFileSync(vsPath, 'utf8');

console.log('=== VERIFICATION: VideoStudio UI Elements ===');
console.log('1. Green toggle switch (bg-emerald-500):', vsCode.includes('bg-emerald-500'));
console.log('2. ON/OFF label:', vsCode.includes('"ON"') && vsCode.includes('"OFF"'));
console.log('3. Top Toolbar Auto-Dubbing Title:', vsCode.includes('Lồng Tiếng ElevenLabs (Auto-Dubbing)'));
console.log('4. Auto-detect script placeholder:', vsCode.includes('Để trống để TỰ ĐỘNG nhận diện kịch bản'));
console.log('5. Top Vietnamese Voices (Ninh Đôn, Ethan, Hoàng Đặng, Quang Nguyễn):', vsCode.includes('Ninh Đôn (Tiếng Việt') && vsCode.includes('Quang Nguyễn (Tiếng Việt'));
console.log('6. Saved Voices localStorage memory logic:', vsCode.includes('aiforge.ttsStudio.savedVoices.v1'));
console.log('7. Voice ID search lookup button (🔍):', vsCode.includes('🔍'));
console.log('8. Model Multilingual v2 Default:', vsCode.includes('Multilingual v2 (Chuẩn tiếng Việt'));

const mainPath = path.join(__dirname, '../app/out/main/index.js');
const mainCode = fs.readFileSync(mainPath, 'utf8');
console.log('\n=== VERIFICATION: Main Process Backend Pipeline ===');
console.log('1. Multilingual v2 & Vietnamese prompt sanitizer:', mainCode.includes('hasVietnamese') && mainCode.includes('translations'));
console.log('2. Lip-Sync Duration & Tempo Matcher (atempo):', mainCode.includes('atempo=') && mainCode.includes('clampedTempo'));
console.log('3. Video Lossless Remuxer (-c:v copy):', mainCode.includes('"-c:v","copy"'));
console.log('4. Stability & Similarity Boost for Vietnamese:', mainCode.includes('stability:0.55') && mainCode.includes('similarity_boost:0.85'));
