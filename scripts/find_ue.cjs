const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

// Find where ue is created, look before index 815000
const sub = content.substring(805000, 815000);
console.log('Snippet before 815000:');
console.log(sub);
