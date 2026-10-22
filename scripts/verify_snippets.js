const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('--- 1. un title render snippet ---');
const unIdx = content.indexOf('title:o?`Prompt #${o.index}`:m("videoStudio.inspectorTitle")');
console.log('un title idx:', unIdx);
if (unIdx !== -1) {
  console.log(content.slice(unIdx - 50, unIdx + 120));
}

console.log('--- 2. Bi function snippet ---');
const biIdx = content.indexOf('function Bi(t,s=[]){const n=Lr(s);return t.flatMap(o=>{if(o.type!=="Video")return[];const w=Ee(o.payload,"prompt")||o.title,k=Ee(o.payload,"promptId")||o.id');
console.log('biIdx:', biIdx);
if (biIdx !== -1) {
  console.log(content.slice(biIdx, biIdx + 200));
}

console.log('--- 3. Gi function snippet ---');
const giIdx = content.indexOf('function Gi(t,s){const n=new Map(s.map((o,w)=>[o.id,o.index||w+1]));return[...t].sort');
console.log('giIdx:', giIdx);
if (giIdx !== -1) {
  console.log(content.slice(giIdx, giIdx + 200));
}

console.log('--- 4. Grid card snippet ---');
const gridCardSnippet = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",children:x.prompt.trim()||S("videoStudio.blankPrompt")})';
const gridIdx = content.indexOf(gridCardSnippet);
console.log('gridIdx:', gridIdx);

console.log('--- 5. List item snippet ---');
const listSnippet = 'e.jsx("div",{className:"truncate text-base font-semibold text-text-primary",children:F.prompt.trim()||S("videoStudio.blankPrompt")})';
const listIdx = content.indexOf(listSnippet);
console.log('listIdx:', listIdx);

console.log('--- 6. Table prompt snippet ---');
const tablePromptSnippet = 'children:F?p.prompt:e.jsx("span",{className:"italic text-text-muted",children:P("videoStudio.blankPrompt")})';
const tableIdx = content.indexOf(tablePromptSnippet);
console.log('tableIdx:', tableIdx);

console.log('--- 7. Download snippet ---');
const dlSnippet = 'r.download=`video-${Ne.promptOrder||Ne.promptId}.mp4`';
const dlIdx = content.indexOf(dlSnippet);
console.log('dlIdx:', dlIdx);
