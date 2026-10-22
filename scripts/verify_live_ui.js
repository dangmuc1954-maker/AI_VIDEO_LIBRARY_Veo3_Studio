const fs = require('fs');

const img = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');
const vid = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const mImg = img.match(/import\{([^}]+)\}from"\.\/licenseCapabilities-HpsCBvbh\.js"/);
const mVid = vid.match(/import\{([^}]+)\}from"\.\/licenseCapabilities-HpsCBvbh\.js"/);

console.log('ImageStudio import:', mImg ? mImg[0] : 'not found');
console.log('VideoStudio import:', mVid ? mVid[0] : 'not found');
