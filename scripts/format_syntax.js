const fs = require('fs');
let code = fs.readFileSync('scratch/temp_syntax.js', 'utf8');

// Replace semicolons with ;\n (carefully outside strings/regex)
// Or simple regex replace for minified JS
let formatted = '';
let inStr = false, quote = '';
for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (!inStr && (ch === '"' || ch === "'" || ch === '`')) {
    inStr = true;
    quote = ch;
    formatted += ch;
  } else if (inStr && ch === quote && code[i - 1] !== '\\') {
    inStr = false;
    formatted += ch;
  } else if (!inStr && (ch === ';' || ch === '{' || ch === '}')) {
    formatted += ch + '\n';
  } else {
    formatted += ch;
  }
}

fs.writeFileSync('scratch/formatted.js', formatted, 'utf8');

const cp = require('child_process');
const p = cp.spawnSync('node', ['--check', 'scratch/formatted.js'], { encoding: 'utf8' });
console.log('Status:', p.status);
if (p.status !== 0) {
  const errLines = p.stderr.split('\n');
  console.log('Error line info:', errLines.slice(0, 5).join('\n'));
}
