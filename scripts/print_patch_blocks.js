const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function printExact(startPattern, endPattern, label) {
  const startIdx = content.indexOf(startPattern);
  if (startIdx === -1) {
    console.error('NOT FOUND START:', startPattern);
    return;
  }
  const endIdx = content.indexOf(endPattern, startIdx);
  if (endIdx === -1) {
    console.error('NOT FOUND END:', endPattern);
    return;
  }
  console.log('=== ' + label + ' ===');
  console.log(content.slice(startIdx, endIdx + endPattern.length));
  console.log('====================\n');
}

printExact('async validateCachedAccessToken(', 'return o}}', 'validateCachedAccessToken');
printExact('async fetchAccessToken(e,t){', 'return this.store.upsertAccount(i)}', 'fetchAccessToken');
printExact('async readSessionToken(e){', 'return o.value}', 'readSessionToken');
printExact('function Zr(r,e){', 'return ee.set(r,{status:"warming",task:s}),s}', 'Zr');
