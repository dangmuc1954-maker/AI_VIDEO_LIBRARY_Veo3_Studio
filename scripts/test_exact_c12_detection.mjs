import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find function Og
const idxStart = content.indexOf('const te=new Map');
const idxEnd = content.indexOf('function mP(');
const block = content.substring(idxStart, idxEnd);

// Run inside an async or new Function
const fn = new Function('rgba', `
${block}
const testCandidates = [];
for (const m of [72, 73, 76, 78, 80, 89, 91, 92, 94, 95, 96, 97, 100, 105, 115, 120, 146, 192]) {
  for (const v of ['48-outline', '48-image', '48', '48-video', '96-outline-dark', '96-outline-light', '96-image-scaled']) {
    testCandidates.push({ size: v.startsWith('96') ? 96 : 48, marginRight: m, marginBottom: m, alphaVariant: v });
  }
}

let matches = [];
for (const cand of testCandidates) {
  try {
    const res = Og({ width: 1536, height: 2752, data: rgba }, { mediaType: 'image', candidates: [cand] });
    if (res.detected) {
      matches.push({ m: cand.marginRight, v: cand.alphaVariant, conf: res.confidence, x: res.x, y: res.y, size: res.size });
    }
  } catch(e) {}
}
return matches;
`);

const rgba = fs.readFileSync('test_raw.rgba');
const results = fn(rgba);
console.log('Detected matches on 2K Cảnh 12:', results);
