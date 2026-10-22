const fs = require('fs');
const code = fs.readFileSync('license_server/admin/index.html', 'utf8');

const idx = code.indexOf('renderMachines');
if (idx !== -1) {
  console.log(code.slice(idx, idx + 1500));
} else {
  console.log('renderMachines not found, searching machinesTable');
  const idx2 = code.indexOf('machinesTable');
  console.log(code.slice(idx2, idx2 + 1500));
}
