const fs = require('fs');
const original = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js.bak_before_scene_title', 'utf8');

const pos = original.indexOf('k=Ee(o.payload,"promptId")||o.id');
console.log('Right after k=...:');
console.log(original.slice(pos, pos + 100));
