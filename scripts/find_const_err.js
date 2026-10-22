const fs = require('fs');
const line790 = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8').split('\n')[790];

// Let's find all 'const' positions in line 790
const re = /\bconst\b/g;
let m;
const positions = [];
while ((m = re.exec(line790)) !== null) {
  positions.push(m.index);
}

console.log('Total const in line 790:', positions.length);

// For each const, check if parsing up to it or around it reveals an issue
for (let i = 0; i < positions.length; i++) {
  const pos = positions[i];
  // Test code up to pos + 50 wrapped in function
  const snippet = line790.slice(Math.max(0, pos - 100), Math.min(line790.length, pos + 100));
  try {
    new Function(line790.slice(0, pos) + ';');
  } catch (e) {
    if (e.message.includes('Unexpected token')) {
      console.log(`Error BEFORE or AT const #${i} at pos ${pos}:`);
      console.log(line790.slice(Math.max(0, pos - 150), pos + 50));
      break;
    }
  }
}
