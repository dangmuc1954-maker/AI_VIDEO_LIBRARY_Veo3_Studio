const fs = require('fs');
const path = require('path');

// We can extract Kt from main index.js and run it
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find Kt definition
const startKt = mainCode.indexOf('class Kt{');
const endKt = mainCode.indexOf('class zP{'); // next class
console.log('Kt code length:', endKt - startKt);

const ktSnippet = mainCode.substring(startKt, endKt);
// Let's see what Kt depends on
console.log('Kt snippet start:', ktSnippet.substring(0, 300));
