const fs = require('fs');
const path = require('path');

const zip3Dir = 'scratch/zip3_source_app/resources/app/out/renderer/assets';
const files = fs.readdirSync(zip3Dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const content = fs.readFileSync(path.join(zip3Dir, f), 'utf8');
  ['transition', 'chuyển cảnh', 'xfade', 'between', 'khựng', 'offset'].forEach(w => {
    let pos = 0;
    while ((pos = content.indexOf(w, pos)) !== -1) {
      if (pos > 500 && (w === 'chuyển cảnh' || w === 'xfade' || content.includes('transition'))) {
        console.log(`[${f}] Found "${w}" at ${pos}:`);
        console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 250)));
        console.log('----------------------------------------------------');
        break;
      }
      pos += w.length + 10;
    }
  });
});
