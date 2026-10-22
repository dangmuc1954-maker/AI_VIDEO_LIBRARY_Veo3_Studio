const fs = require('fs');

const curr = fs.readFileSync('app/out/main/index.js', 'utf8');

const fIdx = curr.indexOf('async fetchAccessToken(');
if (fIdx !== -1) {
    console.log('=== CURRENT fetchAccessToken ===');
    console.log(curr.substring(fIdx, fIdx + 1500));
}

const dIdx = curr.indexOf('deferProviderApiRecovery(');
if (dIdx !== -1) {
    console.log('=== CURRENT deferProviderApiRecovery ===');
    console.log(curr.substring(dIdx, dIdx + 700));
}

console.log('startUrls in current:', curr.match(/startUrl:\s*["'][^"']+["']/g));
