const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

function printFullFunc(name, endName) {
  const start = code.indexOf(`function ${name}(`);
  const end = code.indexOf(`function ${endName}(`, start);
  console.log(`=== FULL FUNCTION ${name} ===`);
  console.log(code.slice(start, end !== -1 ? end : start + 6000));
}

printFullFunc('nl', 'ol');
printFullFunc('zu', 'Ku');
