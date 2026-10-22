const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../app/out/main/index.js'),
  path.resolve(process.env.LOCALAPPDATA, 'Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js')
];

const pubKeyPem = "-----BEGIN PUBLIC KEY-----\\nMCowBQYDK2VwAyEAMAXS0Ql/9WdX8ZAQQQwG4ZG/RYbkegjO2+C8Gptn4mo=\\n-----END PUBLIC KEY-----\\n";

for (const filePath of targetFiles) {
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist, skipping:', filePath);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const startIdx = content.indexOf('function Ow()');
  if (startIdx === -1) {
    console.log('function Ow() not found in:', filePath);
    continue;
  }

  const endIdx = content.indexOf('function Na()', startIdx);
  if (endIdx === -1) {
    console.log('function Na() not found in:', filePath);
    continue;
  }

  const oldOw = content.substring(startIdx, endIdx);
  console.log('Found Ow in', filePath, 'length:', oldOw.length);

  const newOw = `function Ow(){const _k={"2026-q3":"${pubKeyPem}"};const r=process.env.AIVIDEO_LICENSE_PUBLIC_KEYS_JSON;if(r)try{const n=JSON.parse(r);if(n&&typeof n=="object"&&!Array.isArray(n))return Object.assign({},_k,Object.fromEntries(Object.entries(n).filter(s=>typeof s[1]=="string"&&s[1].trim().length>0)))}catch(n){b("license","unable to parse public key registry",{error:T(n)})}const e=process.env.AIVIDEO_LICENSE_PUBLIC_KEY_ED25519?.replace(/\\\\n/g,"\\n"),t=process.env.AIVIDEO_LICENSE_PUBLIC_KEY_ID||"2026-q3";if(e)return Object.assign({},_k,{[t]:e});const o=Lc()?.licensePublicKeys;return o&&typeof o=="object"?Object.assign({},_k,Object.fromEntries(Object.entries(o).filter(n=>typeof n[1]=="string"&&n[1].trim().length>0))):_k}`;

  content = content.substring(0, startIdx) + newOw + content.substring(endIdx);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Successfully patched Ow() in:', filePath);
}
