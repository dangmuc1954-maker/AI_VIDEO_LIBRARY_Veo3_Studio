const { execSync } = require('child_process');

try {
  const out = execSync('node --check "app/out/main/index.js"', { stdio: 'pipe' });
  console.log('✅ SYNTAX VALID 100%!');
} catch (e) {
  const errText = e.stderr ? e.stderr.toString() : e.message;
  console.log('Error output:');
  console.log(errText);
}
