const fs = require('fs');

const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js', 'utf8');

// Find all occurrences of "merge" as a node type
const matches = [...editor.matchAll(/([a-zA-Z0-9_$.]+\s*===\s*["']merge["']|["']merge["']\s*:\s*|\.type\s*===\s*["']merge["'])/g)];
console.log('Matches for merge in editor:', matches.length);
matches.forEach(m => {
  const idx = m.index;
  console.log('--- At', idx, '---');
  console.log(editor.slice(Math.max(0, idx - 100), Math.min(editor.length, idx + 300)));
});
