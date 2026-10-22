const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

console.log('Around 64678:');
console.log(s.substring(64600, 65200));

// Look for where modal is instantiated (like e.jsx($r or e.jsx(Ns)
const modalIdx = s.indexOf('studioType:"image"');
console.log('studioType image index:', modalIdx);
if (modalIdx !== -1) {
  console.log(s.substring(modalIdx - 150, modalIdx + 200));
} else {
  // Search for onImport
  let pos = 0;
  while ((pos = s.indexOf('onImport:', pos + 1)) !== -1) {
    console.log('onImport at', pos, ':', s.substring(pos - 50, pos + 150));
  }
}
