const fs = require('fs');

const code = fs.readFileSync('temp_original_main.js', 'utf8');

// Find all occurrences of "veo3"
let pos = 0;
while (true) {
    const idx = code.indexOf('"veo3"', pos);
    if (idx === -1) break;
    console.log(`\n=== Occurrence at ${idx} ===`);
    console.log(code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 400)));
    pos = idx + 6;
}
