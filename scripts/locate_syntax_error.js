const fs = require('fs');
const { execSync } = require('child_process');

// Let's test topToolbarBanner alone
const topToolbarBanner = fs.readFileSync('scripts/test_banner_direct.js', 'utf8');

// We test if topToolbarBanner can be parsed by wrapping it in `( ... )`
fs.writeFileSync('temp_banner_check.js', 'const e = { jsx: () => ({}), jsxs: () => ({}) }; const d = { tts: {} }; const V = () => {}; const G = []; const banner = (\n' +
  // Extract just the object
  fs.readFileSync('scripts/test_banner_direct.js', 'utf8').slice(fs.readFileSync('scripts/test_banner_direct.js', 'utf8').indexOf('e.jsxs("div"'), fs.readFileSync('scripts/test_banner_direct.js', 'utf8').lastIndexOf('`') - 1)
+ '\n);');

try {
  execSync('node --check temp_banner_check.js', { stdio: 'inherit' });
  console.log('✅ temp_banner_check.js is valid!');
} catch (e) {
  console.error('❌ temp_banner_check.js error!');
} finally {
  try { fs.unlinkSync('temp_banner_check.js'); } catch (_) {}
}
