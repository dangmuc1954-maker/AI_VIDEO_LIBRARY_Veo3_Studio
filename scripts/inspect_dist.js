const fs = require('fs');

const mainFile = './dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js';
const code = fs.readFileSync(mainFile, 'utf8');

console.log('Size:', code.length);

// Search for license URL
const matches = code.match(/https?:\/\/[a-zA-Z0-9\.\:\-]+/g);
console.log('URLs:', [...new Set(matches)]);

// Search for activate endpoint or client call
const actMatches = code.match(/\/v1\/licenses\/[a-zA-Z0-9\-\_]+/g);
console.log('Endpoints:', [...new Set(actMatches)]);

// Search for where plans or license status is returned
const planMatches = code.match(/plan:\s*['"][a-zA-Z0-9\-_]+['"]/g);
console.log('Plan matches in main code:', planMatches);
