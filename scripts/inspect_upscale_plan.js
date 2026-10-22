const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('function _o(r){return r==="upscale_image"?"Image Upscale"');
console.log(content.slice(Math.max(0, idx - 400), idx + 1000));
