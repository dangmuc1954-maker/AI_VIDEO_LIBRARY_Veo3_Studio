const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

const regex = /workflowStore/g;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 200);
  const end = Math.min(content.length, match.index + 500);
  console.log('--- Match at index:', match.index);
  console.log(content.substring(start, end));
  console.log('\n======================================\n');
}
