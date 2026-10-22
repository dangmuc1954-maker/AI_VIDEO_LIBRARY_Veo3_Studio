// scripts/inspect_providers.js
const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

const bananaIdx = code.indexOf('"banana"');
console.log('banana index:', bananaIdx);

const veo3Idx = code.indexOf('"veo3"');
console.log('veo3 index:', veo3Idx);

// Look for definitions of banana and veo3
const defs = code.match(/definition:\{id:"[^"]+",name:"[^"]+"[^}]*\}/g);
console.log('Definitions found:', defs);
