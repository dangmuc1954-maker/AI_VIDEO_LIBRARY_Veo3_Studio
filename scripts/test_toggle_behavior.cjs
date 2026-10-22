const fs = require('fs');
const assert = require('assert');

console.log('🧪 Testing toggle & folder selection behavior...');

// 1. Check main/index.js selectExportDirectory
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
assert(mainCode.includes('const res='), 'selectExportDirectory must use const res to avoid ReferenceError in strict mode');
assert(mainCode.includes('aiforge_auto_download.image'), 'selectExportDirectory must isolate image directory');
assert(mainCode.includes('aiforge_auto_download.video'), 'selectExportDirectory must isolate video directory');

// 2. Check ImageStudio
const isCode = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');
assert(isCode.includes('setAutoDlDir(dir);setAutoDl(!0)'), 'ImageStudio onPickDir must turn ON autoDl immediately');
assert(isCode.includes('window.localStorage.getItem("aiforge_auto_download_image_dir")'), 'ImageStudio onToggleDl must check localStorage before prompting dialog');

// 3. Check VideoStudio
const vsCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
assert(vsCode.includes('setAutoDlVidDir(dir);setAutoDlVid(!0)'), 'VideoStudio onPickVidDir must turn ON autoDlVid immediately');
assert(vsCode.includes('window.localStorage.getItem("aiforge_auto_download_video_dir")'), 'VideoStudio onToggleVidDl and onToggleAutoMerge must check localStorage before prompting dialog');

console.log('🎉 ALL TOGGLE & FOLDER BEHAVIOR TESTS PASSED 100%!');
