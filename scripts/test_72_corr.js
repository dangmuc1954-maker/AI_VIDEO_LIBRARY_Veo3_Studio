const fs = require('fs');
const rgba = fs.readFileSync('test_raw.rgba');
const width = 1536, height = 2752;

const vm = require('vm');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const sandbox = { console, Float32Array, Uint8Array, Buffer, Math, Set, Map, WeakMap, Number, String, Array };
vm.createContext(sandbox);
const startEngine = 542554;
const endIdx = mainCode.indexOf('function mP(');
vm.runInContext(mainCode.substring(startEngine, endIdx), sandbox);

const outline72 = sandbox.Wt('72-outline');
let bestScore = -1, bestPos = null;

for (let y = 2540; y <= 2650; y++) {
  for (let x = 1360; x <= 1450; x++) {
    let meanImg = 0, meanTmpl = 0, cnt = 0;
    for (let dy = 0; dy < 72; dy++) {
      for (let dx = 0; dx < 72; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline72[dy * 72 + dx];
        meanImg += lum; meanTmpl += t; cnt++;
      }
    }
    meanImg /= cnt; meanTmpl /= cnt;
    let num = 0, den1 = 0, den2 = 0;
    for (let dy = 0; dy < 72; dy++) {
      for (let dx = 0; dx < 72; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline72[dy * 72 + dx];
        const dI = lum - meanImg; const dT = t - meanTmpl;
        num += dI * dT; den1 += dI * dI; den2 += dT * dT;
      }
    }
    const corr = num / Math.max(1e-9, Math.sqrt(den1 * den2));
    if (Math.abs(corr) > bestScore) {
      bestScore = Math.abs(corr);
      bestPos = { x, y, corr, sign: corr > 0 ? 'light' : 'dark' };
    }
  }
}
console.log('BEST MATCH FOR 72-outline:', bestPos);
