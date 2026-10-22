const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const start = orig.indexOf('const mn=');
const end = orig.indexOf('So=500,xn=Gr(Wi)');
const mnCode = orig.slice(start, end);

// Let's find all identifiers used in mnCode
const idMatches = mnCode.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
const uniqueIds = Array.from(new Set(idMatches));

// Check in original file what each identifier is imported from or declared as
const topImports = orig.slice(0, start);

const importedTokens = [];
uniqueIds.forEach(id => {
  const r = new RegExp('([a-zA-Z0-9_$]+ as ' + id + '|\\b' + id + '\\b)[^}]*\\}from"([^"]+)"');
  const m = topImports.match(r);
  if (m) {
    importedTokens.push({ id, imp: m[0], file: m[2] });
  }
});

console.log('Imported tokens used in mn:');
importedTokens.forEach(t => console.log(t.id, '<-', t.imp, 'from', t.file));
