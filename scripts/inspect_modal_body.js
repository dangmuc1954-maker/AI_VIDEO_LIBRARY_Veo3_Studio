const fs = require('fs');

const dump = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/mini_editor_dump.js', 'utf-8');

// Find where the modal begins and ends
const titleIdx = dump.indexOf('miniEditorTitle');
console.log('--- MODAL BODY (next 6000 chars after header) ---');
console.log(dump.substring(titleIdx + 1500, titleIdx + 8500));
