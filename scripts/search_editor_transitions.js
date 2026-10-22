const fs = require('fs');

const content = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/aiforge_video_editor_automerge.js', 'utf8');

// Find transition rendering on timeline
let pos = 0;
while ((pos = content.indexOf('transition', pos)) !== -1) {
  if (pos > 10000) {
    console.log(`=== pos ${pos} ===`);
    console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
  }
  pos += 10;
}
