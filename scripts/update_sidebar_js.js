const fs = require('fs');
const filePath = 'app/out/renderer/assets/index-BS7vgKVV.js';
let content = fs.readFileSync(filePath, 'utf8');

const oldPat = /w-60 h-screen bg-linear-to-b from-\[[^\]]+\](?:\/95)? via-\[[^\]]+\](?:\/95)? to-\[[^\]]+\][^\"]*/;
const newStr = 'w-60 h-screen bg-linear-to-b from-[#0e1424] via-[#090e1a] to-[#060913] border-r border-cyan-500/25 shadow-2xl shadow-black/70';

if (oldPat.test(content)) {
  content = content.replace(oldPat, newStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Sidebar classes updated successfully in index-BS7vgKVV.js');
} else {
  console.log('Pattern not found in index-BS7vgKVV.js');
}
