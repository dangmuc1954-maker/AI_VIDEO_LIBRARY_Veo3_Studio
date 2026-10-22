const fs = require('fs');

const lcFile = './extracted_original/out/renderer/assets/LicenseCenter-D-RJQ6lX.js';
const code = fs.readFileSync(lcFile, 'utf8');

// Find de function or plan mapping
const deMatch = code.match(/function\s+de\s*\([^)]*\)\s*\{[^}]*\}/);
console.log('de function:', deMatch ? deMatch[0] : 'not found');

// Search for 'Pro' in LicenseCenter
const proMatches = code.match(/['"]Pro['"]/g);
console.log('Pro in LicenseCenter:', proMatches);

// Search for where plan cards or hero is rendered
const heroMatch = code.match(/lc-plan-name[^;]+;/);
console.log('Hero match:', heroMatch ? heroMatch[0] : 'not found');
