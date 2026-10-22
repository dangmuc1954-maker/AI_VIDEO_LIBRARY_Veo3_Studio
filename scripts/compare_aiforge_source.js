const fs = require('fs');
const path = require('path');

console.log('=== COMPARING AIForge Studio WITH OUR APP ===\n');

const origMain = 'extracted_aiforge_studio_new/out/main/index.js';
const ourMain = 'app/out/main/index.js';

console.log('Original Main size:', fs.statSync(origMain).size);
console.log('Our Main size:', fs.statSync(ourMain).size);

// Check if temp_original_main.js is identical to extracted_aiforge_studio_new
if (fs.existsSync('temp_original_main.js')) {
  const tempSize = fs.statSync('temp_original_main.js').size;
  console.log('temp_original_main.js size:', tempSize);
  console.log('Is identical to temp_original_main:', fs.readFileSync(origMain).equals(fs.readFileSync('temp_original_main.js')));
}

// Compare renderer files
const origRendererDir = 'extracted_aiforge_studio_new/out/renderer/assets';
const ourRendererDir = 'app/out/renderer/assets';

const origFiles = fs.readdirSync(origRendererDir);
const ourFiles = fs.readdirSync(ourRendererDir);

console.log(`Original assets count: ${origFiles.length}, Our assets count: ${ourFiles.length}`);

// Check specific VideoStudio asset file in both
const origVS = origFiles.find(f => f.startsWith('VideoStudio-'));
const ourVS = ourFiles.find(f => f.startsWith('VideoStudio-'));
console.log('Original VideoStudio:', origVS);
console.log('Our VideoStudio:', ourVS);

// Check provider manifests in orig vs our
const origProviders = fs.readFileSync(origMain, 'utf8').match(/startUrl:"[^"]+"/g);
console.log('\nOriginal startUrls:', origProviders);
