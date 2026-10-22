const fs = require('fs');

const orig = fs.readFileSync('temp_original_main.js', 'utf8');

// Find fetchAccessToken in orig
const fIdx = orig.indexOf('fetchAccessToken(');
if (fIdx !== -1) {
    console.log('=== ORIG fetchAccessToken ===');
    console.log(orig.substring(fIdx - 20, fIdx + 1200));
}

// Find deferProviderApiRecovery in orig
const dIdx = orig.indexOf('deferProviderApiRecovery(');
if (dIdx !== -1) {
    console.log('=== ORIG deferProviderApiRecovery ===');
    console.log(orig.substring(dIdx - 20, dIdx + 700));
}
