const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const p = content.indexOf('d?.tts?.enabled ? e.jsxs("div"');
console.log(content.substring(p, p + 4000));
