const { execSync } = require('child_process');
try {
  const out = execSync('tasklist /fi "IMAGENAME eq AI*"').toString();
  console.log(out);
} catch(e) {
  console.log('Error:', e.message);
}
