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

const testScript = `
const c = { size: 48, marginRight: 89, marginBottom: 89, alphaVariant: '48-image' };
const res = Og(testRgba, { mediaType: 'image', candidates: [c] });
console.log('res:', res.x, res.y, res.confidence, 'alphaMap length:', res.alphaMap?.length);

// Force detected to true and set amplitude
res.detected = true;
const amp = _g(testRgba, res);
console.log('amp:', amp);

const u = lP(testRgba, res);
console.log('lP returned:', u);
`;

vm.runInContext(testScript, sandbox);

// Save cleaned corner
const { execFileSync } = require('child_process');
const ffmpeg = 'C:\\\\Users\\\\admin\\\\Downloads\\\\ffmpeg\\\\ffmpeg\\\\bin\\\\ffmpeg.exe';
fs.writeFileSync('cleaned_raw.rgba', sandbox.testRgba.data);
execFileSync(ffmpeg, ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', '1536x2752', '-i', 'cleaned_raw.rgba', '-filter_complex', 'crop=300:300:in_w-300:in_h-300', 'cleaned_corner_test.jpg']);
console.log('Saved cleaned_corner_test.jpg');
fs.copyFileSync('cleaned_corner_test.jpg', 'C:\\\\Users\\\\admin\\\\.gemini\\\\antigravity-ide\\\\brain\\\\fe326fda-c808-453b-a329-10ad2212c4e6\\\\cleaned_corner_test.jpg');
