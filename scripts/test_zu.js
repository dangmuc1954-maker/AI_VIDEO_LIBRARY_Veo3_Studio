const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const zuStart = content.indexOf('function zu(r){');
const endIdx = content.indexOf('function Ku(r){', zuStart);
const zuCode = content.slice(zuStart, endIdx);

try {
  const Sn = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
  const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };
  eval(zuCode);
  const testScript = zu({ params: { prompt: "test", projectId: "123" } });
  console.log("Script successfully generated, length:", testScript.length);
  new Function(testScript);
  console.log("Syntax check passed!");
} catch(err) {
  console.error("Syntax or runtime error in zu:", err);
}
