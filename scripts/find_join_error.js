const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

// Find banner injection site
const bIdx = code.indexOf('Lồng Tiếng ElevenLabs (Auto-Dubbing)');
if (bIdx !== -1) {
  console.log('=== BANNER SITE ===');
  console.log('BEFORE BANNER:');
  console.log(code.slice(bIdx - 120, bIdx));
  console.log('AFTER BANNER:');
  const bEnd = code.indexOf('max-h-[312px]', bIdx);
  console.log(code.slice(bEnd - 120, bEnd + 50));
}

// Find inspector injection site
const iIdx = code.indexOf('Mã Voice ID / Link ElevenLabs');
if (iIdx !== -1) {
  console.log('=== INSPECTOR SITE ===');
  console.log('BEFORE INSPECTOR:');
  const secStart = code.lastIndexOf('e.jsxs("section"', iIdx);
  console.log(code.slice(secStart - 120, secStart + 50));
  console.log('AFTER INSPECTOR:');
  const secEnd = code.indexOf('Model TTS:', iIdx);
  console.log(code.slice(secEnd + 50, secEnd + 200));
}
