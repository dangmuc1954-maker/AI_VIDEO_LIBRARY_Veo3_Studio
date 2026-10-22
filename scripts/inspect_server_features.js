const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../vercel_server/api/index.js'), 'utf8');

function showContext(title, query, len = 700) {
  const pos = content.indexOf(query);
  console.log(`\n==================== ${title} ====================`);
  if (pos !== -1) {
    console.log(content.slice(pos, pos + len));
  } else {
    console.log('Not found');
  }
}

showContext('1. Activation handler', "/licenses/activate'");
showContext('2. Check-In BAN check', 'bannedMachines.has(cleanMachine)');
showContext('3. Ban machine endpoint', "/api/admin/machines/ban'");
showContext('4. Ban IP endpoint', "/api/admin/ips/ban'");
showContext('5. Revoke Key endpoint', "'/revoke'");
showContext('6. Hydrate & Cloud Store', "function hydrateFromCloud");
