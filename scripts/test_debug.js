const fs = require('fs');
const vm = require('vm');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const sandbox = { console, Float32Array, Uint8Array, Buffer, Math, Set, Map, WeakMap, Number, String, Array };
vm.createContext(sandbox);

const startEngine = 542554;
const endIdx = mainCode.indexOf('function mP(');
vm.runInContext(mainCode.substring(startEngine, endIdx), sandbox);

const rgba = fs.readFileSync('test_raw.rgba');
sandbox.testRgba = { width: 1536, height: 2752, data: Buffer.from(rgba) };

const script = `
  const candidate = { size: 48, marginRight: 89, marginBottom: 89, alphaVariant: '48-image' };
  const e = Og(testRgba, { mediaType: 'image', candidates: [candidate] });
  e.detected = true;
  const r = testRgba;
  const t = _g(r, e);
  console.log('t:', t);
  const A = e.size, o = Sg(A), n = e.darkPolarity ? 0 : 255;
  let a = 0, s = 0;
  for(let i=0; i<A; i++) for(let c=0; c<A; c++) {
    const g = o[i*A+c]; if (g === 0) continue;
    const u = ((e.y+i)*r.width+e.x+c)*4;
    for(let d=0; d<3; d++) {
      const l = (r.data[u+d]-g*n)/(1-g);
      if (l < -16 || l > 271) a++;
      s++;
    }
  }
  console.log('a:', a, 's:', s, 'ratio:', a/s);
  console.log('a > s * 0.02:', a > s * 0.02);
  
  // Now let's test if it passes that check:
  for(let i=0; i<A; i++) for(let c=0; c<A; c++) {
    const g = o[i*A+c]; if (g === 0) continue;
    const u = ((e.y+i)*r.width+e.x+c)*4;
    for(let d=0; d<3; d++) {
      const l = (r.data[u+d]-g*n)/(1-g);
      r.data[u+d] = Math.max(0, Math.min(255, Math.round(l)));
    }
  }
  Ls(r, e, o);
  const after_g = _g(r, e);
  console.log('after_g:', after_g);
  console.log('xg returns:', xg(r, e, t));
`;
vm.runInContext(script, sandbox);
