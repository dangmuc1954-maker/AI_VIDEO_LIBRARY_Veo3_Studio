const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');

function findOccurrences(target, pad = 300) {
  console.log('=== TARGET:', target, '===');
  let idx = 0;
  let count = 0;
  while ((idx = c.indexOf(target, idx)) !== -1) {
    count++;
    const start = Math.max(0, idx - pad);
    const end = Math.min(c.length, idx + target.length + pad);
    console.log(`[${count}] at ${idx}:`);
    console.log(c.substring(start, end));
    console.log('-------------------------');
    idx += target.length;
  }
}

findOccurrences('failProviderApiRecovery');
findOccurrences('beginProviderApiRecovery');
findOccurrences('AUTH_REQUIRED');
findOccurrences('Google Flow authentication is no longer valid');
