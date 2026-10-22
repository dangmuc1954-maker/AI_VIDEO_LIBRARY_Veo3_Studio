const fs = require('fs');
const rgba = fs.readFileSync('test_raw.rgba');
const width = 1536, height = 2752;

// Let's search the region from x: 1300..1500, y: 2500..2700
// A 48-star has 4 symmetric points.
// Let's find the exact center by testing correlation with the 48-outline mask at EVERY single integer (x, y) offset!
const vm = require('vm');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const sandbox = { console, Float32Array, Uint8Array, Buffer, Math, Set, Map, WeakMap, Number, String, Array };
vm.createContext(sandbox);
const startEngine = 542554;
const endIdx = mainCode.indexOf('function mP(');
vm.runInContext(mainCode.substring(startEngine, endIdx), sandbox);

const outline = sandbox.Wt('48-outline');
console.log('Got outline, testing all positions...');

let bestScore = -1;
let bestPos = null;

// Search around x: 1380..1420, y: 2600..2640
for (let y = 2590; y <= 2650; y++) {
  for (let x = 1370; x <= 1430; x++) {
    // Extract 48x48 luminance
    let dot = 0, sumImg = 0, sumTmpl = 0;
    let meanImg = 0, meanTmpl = 0;
    
    // First pass mean
    let cnt = 0;
    for (let dy = 0; dy < 48; dy++) {
      for (let dx = 0; dx < 48; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline[dy * 48 + dx];
        meanImg += lum;
        meanTmpl += t;
        cnt++;
      }
    }
    meanImg /= cnt;
    meanTmpl /= cnt;
    
    // Pearson correlation
    let num = 0, den1 = 0, den2 = 0;
    for (let dy = 0; dy < 48; dy++) {
      for (let dx = 0; dx < 48; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline[dy * 48 + dx];
        const dI = lum - meanImg;
        const dT = t - meanTmpl;
        num += dI * dT;
        den1 += dI * dI;
        den2 += dT * dT;
      }
    }
    const corr = num / Math.max(1e-9, Math.sqrt(den1 * den2));
    if (Math.abs(corr) > bestScore) {
      bestScore = Math.abs(corr);
      bestPos = { x, y, corr, sign: corr > 0 ? 'light' : 'dark' };
    }
  }
}

console.log('BEST MATCH FOR 48-outline:', bestPos);

// Also test 96-outline
const outline96 = sandbox.Wt('96-outline-light');
let bestScore96 = -1;
let bestPos96 = null;
for (let y = 2500; y <= 2620; y += 2) {
  for (let x = 1300; x <= 1420; x += 2) {
    let meanImg = 0, meanTmpl = 0, cnt = 0;
    for (let dy = 0; dy < 96; dy++) {
      for (let dx = 0; dx < 96; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline96[dy * 96 + dx];
        meanImg += lum; meanTmpl += t; cnt++;
      }
    }
    meanImg /= cnt; meanTmpl /= cnt;
    let num = 0, den1 = 0, den2 = 0;
    for (let dy = 0; dy < 96; dy++) {
      for (let dx = 0; dx < 96; dx++) {
        const idx = ((y + dy) * width + (x + dx)) * 4;
        const lum = rgba[idx] * 0.2126 + rgba[idx+1] * 0.7152 + rgba[idx+2] * 0.0722;
        const t = outline96[dy * 96 + dx];
        const dI = lum - meanImg; const dT = t - meanTmpl;
        num += dI * dT; den1 += dI * dI; den2 += dT * dT;
      }
    }
    const corr = num / Math.max(1e-9, Math.sqrt(den1 * den2));
    if (Math.abs(corr) > bestScore96) {
      bestScore96 = Math.abs(corr);
      bestPos96 = { x, y, corr, sign: corr > 0 ? 'light' : 'dark' };
    }
  }
}
console.log('BEST MATCH FOR 96-outline:', bestPos96);
