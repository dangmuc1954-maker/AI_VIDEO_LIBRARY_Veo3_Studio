const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../app/out/renderer/assets/index-BS7vgKVV.js');
const s = fs.readFileSync(p, 'utf8');

console.log('Oy index:', s.indexOf('const Oy=["Veo3","Grok"]'));
console.log('E1 index:', s.indexOf('E1=n=>n==="Grok"?[...Qb]:[...lh]'));
console.log('N1 index:', s.indexOf('N1=n=>n==="grok-imagine-video"?[..._R]:[...sh(n)]'));
console.log('dE index:', s.indexOf('function dE(n,a){return n==="grok-imagine-video"?"grok-imagine-video":Yv(n,a)}'));
console.log('Vd index:', s.indexOf('function Vd(n,a){return a==="grok-imagine-video"?$R(n):Xv(n,a)}'));
