const fs = require('fs');
const code = fs.readFileSync('license_server/admin/index.html', 'utf8');

function showFunc(fn) {
  const idx = code.indexOf(`function ${fn}`);
  if (idx !== -1) {
    console.log(`=== FUNCTION: ${fn} ===`);
    console.log(code.slice(idx, idx + 600));
  } else {
    console.log(`=== NOT FOUND: ${fn} ===`);
  }
}

showFunc('banMachine');
showFunc('banIp');
showFunc('resetHwid');
