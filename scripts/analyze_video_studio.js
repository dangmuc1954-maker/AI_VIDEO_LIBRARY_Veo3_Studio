const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');
const indexDqhu = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/index-DqhuWq2K.js', 'utf-8');
const mainIndex = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/main/index.js', 'utf-8');

function findSnippets(content, term, radius = 300) {
  let idx = 0;
  const results = [];
  while ((idx = content.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - radius);
    const end = Math.min(content.length, idx + term.length + radius);
    results.push(content.substring(start, end));
    idx += term.length;
  }
  return results;
}

console.log('=== SNIPPETS FOR "Biên tập video" in indexDqhu ===');
findSnippets(indexDqhu, 'Biên tập video').forEach((s, i) => console.log(`[${i}]:\n${s}\n---`));

console.log('=== SNIPPETS FOR "Ghép tự động" in indexDqhu ===');
findSnippets(indexDqhu, 'Ghép tự động').forEach((s, i) => console.log(`[${i}]:\n${s}\n---`));

console.log('=== SNIPPETS FOR "Ghép nối" in indexDqhu ===');
findSnippets(indexDqhu, 'Ghép nối').forEach((s, i) => console.log(`[${i}]:\n${s}\n---`));
