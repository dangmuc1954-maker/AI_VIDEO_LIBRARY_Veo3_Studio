const fs = require('fs');
const code = fs.readFileSync('license_server/server.js', 'utf8');

function showEndpoint(ep) {
  const idx = code.indexOf(ep);
  if (idx !== -1) {
    console.log(`=== ENDPOINT: ${ep} (index ${idx}) ===`);
    console.log(code.slice(idx, idx + 1000));
  } else {
    console.log(`=== NOT FOUND: ${ep} ===`);
  }
}

showEndpoint('/api/admin/keys/reset-hwid');
showEndpoint('/api/admin/machines/ban');
showEndpoint('/api/admin/ips/ban');
showEndpoint('/api/admin/machines/delete');
