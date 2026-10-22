const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'index-DqhuWq2K.js');
const content = fs.readFileSync(file, 'utf8');

// Find vi-VN localization keys starting with videoStudio
const idx = content.indexOf('miniEditorTitle:');
console.log('miniEditorTitle at:', idx);
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 500), Math.min(content.length, idx + 2500)));
}
