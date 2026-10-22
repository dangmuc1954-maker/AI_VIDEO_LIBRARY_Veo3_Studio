const fs = require('fs');
const path = require('path');
const { parse } = require('espree');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

try {
  // Try parsing with ES syntax
  const acorn = require('acorn');
  acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module', locations: true });
  console.log('✅ Acorn: Syntax is 100% valid!');
} catch (e) {
  console.error('❌ Syntax error at line', e.loc ? e.loc.line : '?', 'col', e.loc ? e.loc.column : '?');
  console.error('Message:', e.message);
  if (e.loc) {
    const lines = code.split('\n');
    const errLine = lines[e.loc.line - 1];
    console.error('Line context:', errLine.slice(Math.max(0, e.loc.column - 60), e.loc.column + 60));
    console.error(' '.repeat(Math.min(60, e.loc.column)) + '^');
  }
}
