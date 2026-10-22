const fs = require('fs');

const code = fs.readFileSync('temp_original_main.js', 'utf8');

// Search for `class ba`
const match = code.match(/class ba\s*\{/);
if (match) {
    const idx = match.index;
    console.log('=== CLASS ba FOUND AT ===', idx);
    console.log(code.substring(idx, idx + 4000));
} else {
    // Search for ba=class
    const m2 = code.match(/ba\s*=\s*class/);
    if (m2) {
        console.log('=== ba = class FOUND AT ===', m2.index);
        console.log(code.substring(m2.index, m2.index + 4000));
    } else {
        console.log('class ba not matched directly, searching for references to ("veo3"');
    }
}
