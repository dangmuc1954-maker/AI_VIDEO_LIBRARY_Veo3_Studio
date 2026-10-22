const fs = require('fs');

const code = fs.readFileSync('./extracted_original/out/main/index.js', 'utf8');

// Search for evaluateCurrentToken
const evalMatch = code.match(/evaluateCurrentToken[^{]*\{[^}]*\}/);
console.log('evaluateCurrentToken:', evalMatch ? evalMatch[0] : 'not found');

// Search for where status is constructed in evaluateCurrentToken
const evalFull = code.match(/evaluateCurrentToken[\s\S]*?notifyStatusChanged/);
console.log('evalFull:', evalFull ? evalFull[0].slice(0, 500) : 'not found');
