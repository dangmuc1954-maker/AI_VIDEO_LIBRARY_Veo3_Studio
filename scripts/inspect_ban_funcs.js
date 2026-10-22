const fs = require('fs');
const code = fs.readFileSync('license_server/db.js', 'utf8');

function showFunc(fn) {
  const idx = code.indexOf(fn);
  if (idx !== -1) {
    console.log(`=== FUNCTION: ${fn} ===`);
    console.log(code.slice(idx, idx + 400));
  } else {
    console.log(`=== NOT FOUND: ${fn} ===`);
  }
}

showFunc('isMachineBanned');
showFunc('isIpBanned');
showFunc('banMachine');
showFunc('banIp');
