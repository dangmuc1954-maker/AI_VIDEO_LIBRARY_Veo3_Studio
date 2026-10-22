const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const p = content.indexOf('const eRunner=this.runtimes.get("elevenlabs","TTS");');
console.log(content.substring(p - 100, p + 1800));
