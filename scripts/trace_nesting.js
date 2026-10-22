const fs = require('fs');

const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const qnStart = code.indexOf('function Qn(){');
const qnCode = code.slice(qnStart);
const retIdx = qnCode.indexOf('return e.');
const retCode = qnCode.slice(retIdx);

const stack = [];
for (let i = 0; i < retCode.length; i++) {
  const ch = retCode[i];
  if (ch === '(' || ch === '[' || ch === '{') {
    stack.push({ ch, i });
  } else if (ch === ')' || ch === ']' || ch === '}') {
    if (stack.length === 0) {
      console.log('Extra closing', ch, 'at offset', i, 'snippet:', retCode.slice(Math.max(0, i - 20), i + 20));
      continue;
    }
    const top = stack.pop();
    if (i > retCode.length - 80) {
      console.log(`Matched closing ${ch} at ${i} with opening ${top.ch} at ${top.i}`);
    }
  }
}
console.log('Remaining unclosed in stack:', stack.length);
