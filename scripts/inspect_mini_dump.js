const fs = require('fs');

const dump = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/mini_editor_dump.js', 'utf-8');

// Let's find component function definition around miniEditorTitle
console.log('--- START 2000 chars around miniEditorTitle ---');
const idx = dump.indexOf('miniEditorTitle');
console.log(dump.substring(Math.max(0, idx - 1000), Math.min(dump.length, idx + 2500)));
