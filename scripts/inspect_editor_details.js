const fs = require('fs');
const path = require('path');

const originalFile = path.join(__dirname, '..', 'original_editor_formatted.js');
const content = fs.readFileSync(originalFile, 'utf8');

// Let's inspect the sections:
// 1. Hotkeys / Keydown handler
console.log('=== 1. SEARCHING KEYDOWN / SHORTCUTS ===');
const keyIdx = content.indexOf('keydown');
if (keyIdx !== -1) {
  console.log(content.slice(Math.max(0, keyIdx - 100), Math.min(content.length, keyIdx + 1200)));
}

// 2. Split logic
console.log('\n=== 2. SEARCHING SPLIT LOGIC ===');
const splitIdx = content.indexOf('splitPositionInvalid');
if (splitIdx !== -1) {
  console.log(content.slice(Math.max(0, splitIdx - 200), Math.min(content.length, splitIdx + 1200)));
}

// 3. Export logic
console.log('\n=== 3. SEARCHING EXPORT LOGIC ===');
const exportIdx = content.indexOf('editAndMergeVideos');
if (exportIdx !== -1) {
  console.log(content.slice(Math.max(0, exportIdx - 200), Math.min(content.length, exportIdx + 1500)));
}
