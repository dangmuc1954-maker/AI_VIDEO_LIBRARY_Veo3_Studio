const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

console.log('VideoStudio size:', code.length);

// Check function name
const fnMatches = code.match(/function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/g);
console.log('Total functions:', fnMatches ? fnMatches.length : 0);

// Check mn(dt, X, t) or pe
const mnMatches = [...code.matchAll(/([A-Za-z0-9_$]+)\s*=\s*mn\(([^)]+)\)/g)];
console.log('mn matches:', mnMatches.map(m => m[0]));

// Check Generate button text or icon
const genMatches = [...code.matchAll(/Generate\s+\$\{[^}]+\}/g)];
console.log('Generate button matches:', genMatches.map(m => m[0]));

// Check return statement in main component
const exportDefault = code.match(/export\s*\{\s*([A-Za-z0-9_$]+)\s+as\s+default\s*\}/);
console.log('Default export:', exportDefault ? exportDefault[1] : 'none');
