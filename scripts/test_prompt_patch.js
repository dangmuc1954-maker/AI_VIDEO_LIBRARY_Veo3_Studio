const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../app/out/renderer/assets/index-BS7vgKVV.js');
const indexCode = fs.readFileSync(indexPath, 'utf8');

const targetDs = 'function Ds(n,a,r){return{id:n,index:a,prompt:"",';
console.log('index-BS7vgKVV.js has targetDs:', indexCode.includes(targetDs));

const targetAddPrompt = 'addPromptList:r=>{const i=r.map(c=>c.trim()).filter(Boolean);';
console.log('index-BS7vgKVV.js has targetAddPrompt:', indexCode.includes(targetAddPrompt));
