const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const start = orig.indexOf('const mn=');
const end = orig.indexOf('So=500,xn=Gr(Wi)');
const mnCode = orig.slice(start, end);

// Let's find all identifiers used in mnCode
const idMatches = mnCode.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g);
const uniqueIds = Array.from(new Set(idMatches));

// Find identifiers that are declared inside mn
// e.g. let, const, var, function, params
console.log('Total unique identifiers in mn:', uniqueIds.length);

// Check which top-level imports or declarations in VideoStudio-CbTMj2SN.js are referenced in mn:
const topLevelBeforeMn = orig.slice(0, start);

const referencedFromTop = [];
uniqueIds.forEach(id => {
  // if id is a top level import or const/function before mn
  const isImport = new RegExp('\\b' + id + '\\b').test(orig.slice(0, 1500));
  const isDeclaredBefore = topLevelBeforeMn.includes('const ' + id + '=') || 
                           topLevelBeforeMn.includes('function ' + id + '(') ||
                           topLevelBeforeMn.includes('let ' + id + '=');
  if (isImport || isDeclaredBefore) {
    referencedFromTop.push(id);
  }
});

console.log('Referenced from top-level or imports:', referencedFromTop);
