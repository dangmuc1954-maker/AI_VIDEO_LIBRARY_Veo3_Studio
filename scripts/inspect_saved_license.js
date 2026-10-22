const fs = require('fs');
const path = require('path');

const pDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY');
const pFile = path.join(pDir, 'license.dat');

if (fs.existsSync(pFile)) {
  console.log('--- FOUND license.dat ---');
  const data = JSON.parse(fs.readFileSync(pFile, 'utf8'));
  console.log('Saved At:', data.savedAt);
  console.log('License Key:', data.licenseKey);
  console.log('Machine Code:', data.machineCode);
  
  if (data.entitlementToken) {
    const parts = data.entitlementToken.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    console.log('TOKEN PAYLOAD:');
    console.log(JSON.stringify(payload, null, 2));
  }
} else {
  console.log('No license.dat found at', pFile);
}
