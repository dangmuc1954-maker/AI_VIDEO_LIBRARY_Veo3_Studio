const fs = require('fs');
const vm = require('vm');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const sandbox = { console, Float32Array, Uint8Array, Buffer, Math, Set, Map, WeakMap, Number, String, Array };
vm.createContext(sandbox);

const startEngine = 542554;
const endIdx = mainCode.indexOf('function mP(');
vm.runInContext(mainCode.substring(startEngine, endIdx), sandbox);

const rgba = fs.readFileSync('test_raw.rgba');
sandbox.testRgba = { width: 1536, height: 2752, data: rgba };

const testScript = `
const results = [];
for (const m of [85, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 100, 115, 120, 146]) {
  for (const v of ['48-outline', '48-image', '48', '96-outline-dark', '96-outline-light', '96-image-scaled']) {
    const c = { size: v.startsWith('96') ? 96 : 48, marginRight: m, marginBottom: m, alphaVariant: v };
    const r = Og(testRgba, { mediaType: 'image', candidates: [c] });
    results.push({ m, v, detected: r.detected, conf: r.confidence, spatial: r.spatialScore, grad: r.gradientScore, x: r.x, y: r.y });
  }
}
results.sort((a,b) => b.conf - a.conf);
results.slice(0, 15);
`;

const res = vm.runInContext(testScript, sandbox);
console.log('Top candidates:');
console.log(res);
