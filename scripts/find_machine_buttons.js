const fs = require('fs');
const code = fs.readFileSync('license_server/admin/index.html', 'utf8');

const idx = code.indexOf('machinesTableBody');
let idx2 = code.indexOf('machinesTableBody', idx + 1);
console.log(code.slice(idx2 + 2500, idx2 + 3800));
