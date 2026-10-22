const { execSync } = require('child_process');

try {
  const out = execSync('tasklist /FI "IMAGENAME eq electron.exe"', { encoding: 'utf8' });
  console.log(out);
} catch (e) {
  console.log('Error checking tasklist:', e.message);
}
