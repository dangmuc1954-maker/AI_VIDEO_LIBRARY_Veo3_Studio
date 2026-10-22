const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const target1 = 'Po=r=>{if(r.account!=="Auto")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))}';
const target2 = 'if(v.provider==="Grok"){';

console.log('target1 found:', content.includes(target1));
console.log('target2 found:', content.includes(target2));

const idx1 = content.indexOf(target1);
console.log('around target1:');
console.log(content.slice(idx1, idx1 + 300));

const idx2 = content.indexOf(target2);
console.log('around target2:');
console.log(content.slice(idx2, idx2 + 800));
