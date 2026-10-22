const fs = require('fs');
const content = fs.readFileSync('scratch/shop_app_unpacked/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');

const idx = content.indexOf('videoAssetsTitle');
console.log(content.substring(idx - 1500, idx - 400));
