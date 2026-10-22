const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

function extractFunc(name) {
  const start = code.indexOf(`function ${name}(`);
  if (start === -1) {
    console.log(`function ${name} not found`);
    return;
  }
  // find next function
  const nextFunc = code.indexOf('\nfunction ', start + 10) !== -1 ? code.indexOf('\nfunction ', start + 10) : code.indexOf('function ', start + 10);
  console.log(`=== FUNCTION ${name} ===`);
  console.log(code.slice(start, nextFunc !== -1 ? nextFunc : start + 3000));
}

extractFunc('nl'); // Video script generator
extractFunc('zu'); // Image script generator
extractFunc('Lu'); // Image response parser
extractFunc('Xu'); // Video response parser
