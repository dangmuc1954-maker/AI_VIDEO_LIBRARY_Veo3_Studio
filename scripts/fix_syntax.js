const fs = require('fs');
const file = 'app/out/renderer/assets/VideoStudio-BZY_1pM8.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('[K,v]=l.useState("none");const transRef=l.useRef("none");transRef.current=K;', '[K,v]=l.useState("none"),');
if (!content.includes('transRef=l.useRef("none"),')) {
  content = content.replace('Xe=l.useRef(null),', 'Xe=l.useRef(null),transRef=l.useRef("none"),');
}
if (!content.includes('transRef.current=K,')) {
  content = content.replace('ce.current=mt,', 'ce.current=mt,transRef.current=K,');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed declaration chain successfully!');
