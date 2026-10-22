const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const p = content.indexOf('this.ttsClient.generateAudio({');
console.log(content.substring(p - 100, p + 500));
