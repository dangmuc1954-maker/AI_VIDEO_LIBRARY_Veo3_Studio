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
  const candidate = { size: 48, marginRight: 89, marginBottom: 89, alphaVariant: '48-outline' };
  const r = Og(testRgba, { mediaType: 'image', candidates: [candidate] });
  console.log('r.darkPolarity from Og:', r.darkPolarity);
  
  const samplePoints = [
    { name: 'center', x: r.x + 24, y: r.y + 24 },
    { name: 'outline_top', x: r.x + 24, y: r.y + 10 },
    { name: 'outline_bottom', x: r.x + 24, y: r.y + 38 },
    { name: 'outline_left', x: r.x + 10, y: r.y + 24 },
    { name: 'outline_right', x: r.x + 38, y: r.y + 24 },
    { name: 'outside', x: r.x - 5, y: r.y - 5 },
  ];
  
  console.log('BEFORE kg:');
  for (const pt of samplePoints) {
    const idx = (pt.y * testRgba.width + pt.x) * 4;
    const alphaVal = r.alphaMap[(pt.y - r.y) * 48 + (pt.x - r.x)] || 0;
    console.log(pt.name, 'RGBA:', testRgba.data[idx], testRgba.data[idx+1], testRgba.data[idx+2], 'alpha:', alphaVal.toFixed(3));
  }
  
  // Test with darkPolarity = true (logoValue = 0)
  kg(testRgba, r.alphaMap, { x: r.x, y: r.y, width: r.size, height: r.size }, { logoValue: 0 });
  
  console.log('AFTER kg with logoValue = 0:');
  for (const pt of samplePoints) {
    const idx = (pt.y * testRgba.width + pt.x) * 4;
    console.log(pt.name, 'RGBA:', testRgba.data[idx], testRgba.data[idx+1], testRgba.data[idx+2]);
  }
`;
vm.runInContext(script, sandbox);

fs.writeFileSync('test_cleaned_dark.rgba', sandbox.testRgba.data);
const child_process = require('child_process');
const ffmpeg = 'C:/Users/admin/Downloads/ffmpeg/ffmpeg/bin/ffmpeg.exe';
child_process.execSync(`"${ffmpeg}" -y -f rawvideo -pix_fmt rgba -s 1536x2752 -i test_cleaned_dark.rgba -frames:v 1 test_cleaned_dark.jpg`);
child_process.execSync(`"${ffmpeg}" -y -i test_cleaned_dark.jpg -filter:v "crop=300:300:1236:2452" test_cleaned_dark_crop.jpg`);
console.log('Done test_cleaned_dark_crop.jpg');
