const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/LicenseCenter-D-RJQ6lX.js', 'utf8');

const idx = content.indexOf('No active plan');
if (idx !== -1) {
  console.log(content.substring(idx - 200, idx + 400));
}
