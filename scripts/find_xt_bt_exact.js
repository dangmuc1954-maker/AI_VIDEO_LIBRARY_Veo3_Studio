const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/accountUtils-D3T9h8tk.js', 'utf8');

const regex = /(?:const|let|var)\s+(?:xt|bt)\s*=/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m[0], 'at', m.index);
  console.log(content.slice(m.index, m.index + 200));
}
if (!regex.exec(content)) {
  const r2 = /(?:function)\s+(?:xt|bt)\b/g;
  while ((m = r2.exec(content)) !== null) {
    console.log(m[0], 'at', m.index);
    console.log(content.slice(m.index, m.index + 200));
  }
}
