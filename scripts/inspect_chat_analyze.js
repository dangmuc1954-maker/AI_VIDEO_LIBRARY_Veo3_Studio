const fs = require('fs');

const origMain = fs.readFileSync('scratch/original_aiforge_out/out/main/index.js', 'utf8');

const idx = origMain.indexOf('chat:analyze');
if (idx !== -1) {
  console.log('--- chat:analyze handler in original main ---');
  console.log(origMain.slice(Math.max(0, idx - 100), Math.min(origMain.length, idx + 1000)));
} else {
  console.log('chat:analyze not found directly');
}
