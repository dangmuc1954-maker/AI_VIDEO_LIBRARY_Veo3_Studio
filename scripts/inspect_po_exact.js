const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('Po=r=>{if(r.account!=="Auto")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))}');
console.log('Po pos:', idx);
console.log(content.slice(idx, idx + 1000));
