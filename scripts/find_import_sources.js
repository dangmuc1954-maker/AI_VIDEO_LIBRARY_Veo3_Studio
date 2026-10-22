const fs = require('fs');
const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const top = orig.slice(0, 3000);

const list = ['to', 'tr', '_e', 'xs', 'ps', 'Js', 'ms', 'Jt', 'pr', 'Po', 'it', 'Xs', 'Cr', 'Pr', 'cr', 'm', 'A', 'Ke', 'He', 'B', 'l', 'e'];
list.forEach(name => {
  const imports = orig.match(/import\{([^}]+)\}from"([^"]+)"/g) || [];
  let found = false;
  for (const imp of imports) {
    if (imp.includes(`as ${name}`) || imp.includes(`, ${name}`) || imp.includes(`{${name}`) || imp.includes(`${name},`) || imp.includes(` ${name} `)) {
      console.log(name, '->', imp);
      found = true;
      break;
    }
  }
  if (!found) {
    console.log(name, '-> NOT FOUND IN IMPORTS');
  }
});
