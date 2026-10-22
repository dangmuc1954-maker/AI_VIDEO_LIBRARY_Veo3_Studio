const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// Look for download in vo
const idx = s.indexOf('vo=()=>');
if (idx !== -1) {
  console.log('vo definition:');
  console.log(s.substring(idx, idx + 400));
} else {
  console.log('Could not find vo=()=>');
}

// Look for bulk import in ImageStudio
const importIdx = s.indexOf('importPrompt');
console.log('importPrompt in ImageStudio:', importIdx);
if (importIdx !== -1) {
  console.log(s.substring(importIdx - 100, importIdx + 300));
}

// Look for where promptRows are generated or added in ImageStudio
const addPromptIdx = s.indexOf('addPrompt');
console.log('addPrompt in ImageStudio:', addPromptIdx);
