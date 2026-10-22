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
  console.log('Detection:', r.x, r.y, 'spatial:', r.spatialScore);
  
  // Clean with kg ONLY (no Ls inner darkening)
  kg(testRgba, r.alphaMap, { x: r.x, y: r.y, width: r.size, height: r.size }, { logoValue: r.darkPolarity ? 0 : 255 });
`;

vm.runInContext(script, sandbox);

fs.writeFileSync('test_cleaned_pure_outline.rgba', sandbox.testRgba.data);
const ffmpeg = 'C:/Users/admin/Downloads/ffmpeg/ffmpeg/bin/ffmpeg.exe';
child_process.execSync(`"${ffmpeg}" -y -f rawvideo -pix_fmt rgba -s 1536x2752 -i test_cleaned_pure_outline.rgba -frames:v 1 test_cleaned_pure_outline.jpg`);
child_process.execSync(`"${ffmpeg}" -y -i test_cleaned_pure_outline.jpg -filter:v "crop=300:300:1236:2452" test_cleaned_pure_outline_crop.jpg`);
console.log('Saved test_cleaned_pure_outline_crop.jpg');
