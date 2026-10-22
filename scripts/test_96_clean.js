const fs = require('fs');
const vm = require('vm');
const child_process = require('child_process');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const sandbox = { console, Float32Array, Uint8Array, Buffer, Math, Set, Map, WeakMap, Number, String, Array };
vm.createContext(sandbox);

const startEngine = 542554;
const endIdx = mainCode.indexOf('function mP(');
vm.runInContext(mainCode.substring(startEngine, endIdx), sandbox);

const rgba = fs.readFileSync('test_raw.rgba');
sandbox.testRgba = { width: 1536, height: 2752, data: Buffer.from(rgba) };

const script = `
  const candidate = { size: 96, marginRight: 90, marginBottom: 118, alphaVariant: '96-outline-light' };
  const r = Og(testRgba, { mediaType: 'image', candidates: [candidate] });
  r.detected = true;
  console.log('r detection:', {
    detected: r.detected,
    conf: r.confidence,
    spatial: r.spatialScore,
    grad: r.gradientScore,
    x: r.x,
    y: r.y,
    darkPolarity: r.darkPolarity
  });
  
  const cleanedResult = lP(testRgba, r);
  console.log('lP returned:', cleanedResult);
`;

vm.runInContext(script, sandbox);

fs.writeFileSync('test_cleaned_96_actually.rgba', sandbox.testRgba.data);
const raw = fs.readFileSync('test_raw.rgba');
console.log('Modified now?:', !raw.equals(sandbox.testRgba.data));

const ffmpeg = 'C:/Users/admin/Downloads/ffmpeg/ffmpeg/bin/ffmpeg.exe';
child_process.execSync(`"${ffmpeg}" -y -f rawvideo -pix_fmt rgba -s 1536x2752 -i test_cleaned_96_actually.rgba -frames:v 1 test_cleaned_96_actually.jpg`);
child_process.execSync(`"${ffmpeg}" -y -i test_cleaned_96_actually.jpg -filter:v "crop=300:300:1236:2452" test_cleaned_96_actually_crop.jpg`);
console.log('Saved test_cleaned_96_actually_crop.jpg');
