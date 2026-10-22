const fs = require('fs');

const code = fs.readFileSync('temp_original_main.js', 'utf8');

// Search around Dt = "https://labs.google/fx/api/auth/providers"
const idx = code.indexOf('https://labs.google/fx/api/auth/providers');
console.log('=== AROUND Dt (approx line 60952) ===');
console.log(code.substring(idx - 1000, idx + 2500));
