const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const p = content.indexOf('d.tts?.voiceId');
console.log('Select list around pos', p, ':');
console.log(content.substring(Math.max(0, p - 300), Math.min(content.length, p + 2000)));
