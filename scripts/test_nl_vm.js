const fs = require('fs');
const vm = require('vm');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const nlStart = content.indexOf('function nl(r){');
const endIdx = content.indexOf('function al(r){', nlStart);
const nlCode = content.slice(nlStart, endIdx);
const Ec = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const qe = { recaptcha: { siteKey: Ec }, clientContext: {}, rpcIds: {} };
eval(nlCode);
const script = nl({ params: { prompt: 'test', projectId: '123' } });

try {
  new vm.Script(script);
  console.log("nl Script is valid!");
} catch(e) {
  console.log("nl VM Syntax error:", e.message);
  const lines = script.split('\n');
  lines.forEach((l, idx) => { if (l.includes('match(//') || l.includes('matchAll(//')) console.log((idx+1) + ': ' + l.trim()); });
}
