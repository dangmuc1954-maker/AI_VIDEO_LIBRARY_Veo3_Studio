const fs = require('fs');
const path = require('path');

const origPath = path.join(__dirname, '../extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(origPath, 'utf8');
const headerAnchor = 'e.jsx("span",{children:sr($,"video")})]})]}),';
const startIdx = code.indexOf(headerAnchor);
console.log('Found headerAnchor at:', startIdx);

const after = code.slice(startIdx + headerAnchor.length);
console.log('First 200 chars after headerAnchor:');
console.log(after.slice(0, 200));

// Find where the table section begins
const tableMatch = after.match(/e\.(?:jsx|jsxs)\("div",\{className:"[^"]*(?:table|overflow|min-h|relative|flex-1|grid)/);
if (tableMatch) {
  console.log('\nFound Table anchor at relative offset:', tableMatch.index);
  console.log('Table snippet:', after.slice(tableMatch.index, tableMatch.index + 120));
}
