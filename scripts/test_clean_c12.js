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

const testScript = `
  const candidate = { size: 48, marginRight: 89, marginBottom: 89, alphaVariant: '48-image' };
  const r = Og(testRgba, { mediaType: 'image', candidates: [candidate] });
  console.log('Detection with 48-image:', { detected: r.detected, conf: r.confidence, spatial: r.spatialScore, grad: r.gradientScore, x: r.x, y: r.y });

  const forceDetected = { ...r, detected: true };
  const verified = lP(testRgba, forceDetected);
  console.log('lP Verification result with 48-image:', verified);
`;

vm.runInContext(testScript, sandbox);

fs.writeFileSync('test_cleaned_48image.rgba', sandbox.testRgba.data);
const ffmpeg = 'C:/Users/admin/Downloads/ffmpeg/ffmpeg/bin/ffmpeg.exe';
child_process.execSync(`"${ffmpeg}" -y -f rawvideo -pix_fmt rgba -s 1536x2752 -i test_cleaned_48image.rgba -frames:v 1 test_cleaned_48image.jpg`);
child_process.execSync(`"${ffmpeg}" -y -i test_cleaned_48image.jpg -filter:v "crop=300:300:1236:2452" test_cleaned_48image_crop.jpg`);
console.log('Finished generating test_cleaned_48image_crop.jpg');
