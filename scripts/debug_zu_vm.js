const fs = require('fs');
const vm = require('vm');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const zuStart = content.indexOf('function zu(r){');
const endIdx = content.indexOf('function Ku(r){', zuStart);
const zuCode = content.slice(zuStart, endIdx);
const Sn = '6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV';
const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };
eval(zuCode);
const script = zu({ params: { prompt: 'test', projectId: '123' } });

fs.writeFileSync('scripts/generated_zu_script.js', script, 'utf8');

try {
  new vm.Script(script);
  console.log("Valid script!");
} catch(e) {
  console.log("VM Syntax error:", e.message);
  console.log(e.stack);
}
