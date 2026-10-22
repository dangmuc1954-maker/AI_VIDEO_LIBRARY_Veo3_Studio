const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const start = orig.indexOf('const mn=');
const topLevel = orig.slice(0, start);

const ids = [
  'Ke', 'He', 'B', 'l', 'Us', 'zs', 'go', 'bo', '_s', 'vo', 'cn', 'fo', 'Ht', 'm', 'e', 'rt', 'yo', 'A',
  'un', 'Ws', 'dn', 'to', 'tr', '_e', 'xs', 'Ci', 'cs', 'ps', 'Js', 'ms', 'Jt',
  'pr', 'Ho', 'Si', 'Ni', 'Qo', 'qo', 'Po', 'wo', 'ji', 'jo', 'it', 'Xs', 'ki', 'Cr', 'Pr', 'cr'
];

ids.forEach(id => {
  // Check if it is an import
  const impRegex = new RegExp(`import\\{([^}]*)\\b([a-zA-Z0-9_$]+ as ${id}|${id})\\b([^}]*)\\}from"([^"]+)"`);
  const impMatch = topLevel.match(impRegex);
  if (impMatch) {
    console.log(`IMPORT: ${id} <- from "${impMatch[4]}" (original token: ${impMatch[2]})`);
    return;
  }
  // Check if it is const or function
  const declRegex = new RegExp(`(?:const|function|let)\\s+${id}\\b[=|(]`);
  const declMatch = topLevel.match(declRegex);
  if (declMatch) {
    console.log(`DECL: ${id} declared in file`);
    return;
  }
  console.log(`UNKNOWN: ${id}`);
});
