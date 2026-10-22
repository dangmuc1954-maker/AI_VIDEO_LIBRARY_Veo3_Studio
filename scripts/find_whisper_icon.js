const fs = require('fs');
for (const f of fs.readdirSync('app/out/renderer/assets')) {
  if (f.endsWith('.js')) {
    const c = fs.readFileSync('app/out/renderer/assets/' + f, 'utf8');
    if (c.includes('whisper.optimized')) {
      console.log('whisper in:', f);
      let pos = c.indexOf('whisper.optimized');
      console.log(c.substring(Math.max(0, pos - 100), Math.min(c.length, pos + 200)));
    }
  }
}
