const fs = require('fs');

const origPath = 'extracted_aiforge_studio_new/out/main/index.js';
const orig = fs.readFileSync(origPath, 'utf8');

console.log('=== INSPECTING AIForge Studio ORIGINAL SOURCE ===');
console.log('File length:', orig.length);

// 1. Providers definition
const pIdx = orig.indexOf('"veo3"');
console.log('\n--- PROVIDER VEO3 DEFINITION ---');
console.log(orig.slice(Math.max(0, pIdx - 100), Math.min(orig.length, pIdx + 300)));

// 2. All URLs mentioning flow or labs or google
const urlMatches = orig.match(/https?:\/\/[a-zA-Z0-9.-]+\/[^"'\s)]*/g) || [];
const flowUrls = Array.from(new Set(urlMatches.filter(u => u.includes('flow') || u.includes('labs') || u.includes('aisandbox'))));
console.log('\n--- ALL FLOW / LABS / AISANDBOX URLS ---');
console.log(flowUrls);

// 3. fetchAccessToken implementation
const fatIdx = orig.indexOf('fetchAccessToken(e');
if (fatIdx !== -1) {
  console.log('\n--- fetchAccessToken in ORIGINAL ---');
  console.log(orig.slice(fatIdx, fatIdx + 1200));
}

// 4. readSessionToken
let idx = 0;
while ((idx = orig.indexOf('readSessionToken', idx)) !== -1) {
  console.log('\n--- readSessionToken at ' + idx + ' ---');
  console.log(orig.slice(idx, idx + 400));
  idx += 16;
}
