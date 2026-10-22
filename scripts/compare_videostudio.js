const fs = require('fs');

const orig = fs.readFileSync('app/out_backup_prior_to_pristine_0909/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const curr = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('Orig length:', orig.length);
console.log('Curr length:', curr.length);

function printMatches(content, name) {
  let pos = 0;
  while ((pos = content.indexOf('upscale_video', pos)) !== -1) {
    console.log(`[${name}] at ${pos}:`, content.slice(Math.max(0, pos - 50), pos + 100));
    pos += 13;
  }
}
printMatches(orig, 'ORIG');
printMatches(curr, 'CURR');
