const fs = require('fs');

const orig = fs.readFileSync('app/out_backup_prior_to_pristine_0909/main/index.js', 'utf8');
const curr = fs.readFileSync('app/out/main/index.js', 'utf8');

function findIn(content, name) {
  let pos = 0;
  while ((pos = content.indexOf('missingCapabilityForJob', pos)) !== -1) {
    console.log(`[${name}] missingCapabilityForJob at ${pos}:`);
    console.log(content.slice(Math.max(0, pos - 50), pos + 200));
    pos += 23;
  }
}
findIn(orig, 'ORIG');
findIn(curr, 'CURR');
