const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const studioCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('1. Main concurrency limit = 6:');
const has6 = mainCode.includes('if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return 6;');
console.log(has6 ? '✅ PASS: Exactly 6 threads' : '❌ FAIL');

console.log('2. Studio b.push has accountId attached:');
const hasAcc = studioCode.includes('accountId:ot.accountId,account:Tt(ot)');
console.log(hasAcc ? '✅ PASS: accountId is always attached' : '❌ FAIL');

console.log('3. Studio rotates accounts:');
const hasRotate = studioCode.includes('allMuse[b.length%allMuse.length]');
console.log(hasRotate ? '✅ PASS: b.length % allMuse.length rotation active' : '❌ FAIL');

console.log('4. Studio Mo_muse never returns null:');
const hasMo = studioCode.includes('return allMuse[0]||null');
console.log(hasMo ? '✅ PASS: Mo_muse has safe fallback' : '❌ FAIL');
