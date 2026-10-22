const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

// Let's find every occurrence of "const" that could be a syntax error
const re = /const\b/g;
let match;
const positions = [];
while ((match = re.exec(content)) !== null) {
  positions.push(match.index);
}

console.log('Total const tokens:', positions.length);

// Let's test chunks using Function on stripped imports
// First, strip all import ... from ... statements from the beginning
let codeWithoutImports = content.replace(/^import\s+[\s\S]*?;\s*/gm, '');

// Now let's binary search where the syntax error is
function testSyntax(code) {
  try {
    new Function(code);
    return true;
  } catch (e) {
    return e.message;
  }
}

console.log('Test full code without imports:', testSyntax(codeWithoutImports));

// If it fails with unexpected token, let's find the position
try {
  new Function(codeWithoutImports);
} catch (e) {
  console.log('Error message:', e.message);
  // Find line / column if available
  const matchPos = e.stack.match(/:(\d+):(\d+)/);
  console.log('Stack info:', e.stack.slice(0, 300));
}
