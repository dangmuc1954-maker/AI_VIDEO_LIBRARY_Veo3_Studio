const fs = require('fs');

console.log('--- Custom scripts in app/out/renderer ---');
const rendererFiles = fs.readdirSync('app/out/renderer');
console.log('Root renderer files:', rendererFiles);

const assetFiles = fs.readdirSync('app/out/renderer/assets');
const customAssets = assetFiles.filter(f => f.startsWith('aiforge_') || f.startsWith('custom_') || f.startsWith('veo3_') || f.startsWith('elevenlabs_'));
console.log('Custom asset files:', customAssets);

// Check index-8u8DZic4.js for customizations
const appIndex = fs.readFileSync('app/out/renderer/assets/index-8u8DZic4.js', 'utf8');
console.log('appIndex length:', appIndex.length);
console.log('Contains automerge:', appIndex.includes('automerge'));
console.log('Contains elevenlabs:', appIndex.includes('elevenlabs'));
console.log('Contains veo3:', appIndex.includes('veo3') || appIndex.includes('Veo 3'));
