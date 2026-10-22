const fs = require('fs');

const code = fs.readFileSync('./extracted_original/out/main/index.js', 'utf8');

const match = code.match(/evaluateCurrentTokenSync\(\)\s*\{[\s\S]*?return\s*\{[\s\S]*?\}\s*\}/);
console.log('evaluateCurrentTokenSync:', match ? match[0] : 'not found');
