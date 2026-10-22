const fs = require('fs');
const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

// Find all URLs
const urlRegex = /https?:\/\/[^\s"'`<>]+/g;
const matches = new Set(code.match(urlRegex) || []);
console.log('--- URLs found ---');
for (const u of matches) {
  if (!u.includes('w3.org') && !u.includes('schema.org') && !u.includes('google.com/recaptcha')) {
    console.log(u);
  }
}

console.log('\n--- Keyword Counts ---');
const keywords = [
  'batchGenerate', 'flowMedia', 'generateVideo', 'VideoFx', 'FlowService', 
  'aisandbox', 'StreamGenerateContent', 'credits', 'Credit', 'GetCredits',
  'video', 'operation', 'operations', 'polling', 'grpc', 'rpc', 'batchexecute',
  'Authorization', 'SAPISID', 'SAPISIDHASH', 'X-Goog', 'OAuth', 'access_token', 'token'
];

for (const kw of keywords) {
  let count = 0;
  let idx = 0;
  while ((idx = code.indexOf(kw, idx)) !== -1) {
    count++;
    idx += kw.length;
  }
  console.log(`${kw}: ${count}`);
}
