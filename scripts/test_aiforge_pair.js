const fs = require('fs');
const vm = require('vm');

const zuCode = fs.readFileSync('scripts/aiforge_zu.js', 'utf8');
const nlCode = fs.readFileSync('scripts/aiforge_nl.js', 'utf8');

const Sn = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const Ec = Sn;
const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };

const fnZu = new Function('Sn', 'qe', zuCode + '; return zu;')(Sn, qe);
const zuScript = fnZu({ params: { prompt: "test prompt", projectId: "real-proj" } });
new vm.Script(zuScript);
console.log('✅ aiforge_zu is 100% valid JavaScript!');

const fnNl = new Function('Ec', 'qe', nlCode + '; return nl;')(Ec, qe);
const nlScript = fnNl({ params: { prompt: "test prompt", projectId: "real-proj", mode: "R2V", referenceMediaIds: ["ref1"] } });
new vm.Script(nlScript);
console.log('✅ aiforge_nl is 100% valid JavaScript!');
