const fs = require('fs');
const path = require('path');

const dir = 'app/out/renderer/assets';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
  const c = fs.readFileSync(path.join(dir, f), 'utf8');
  if (c.includes('licenseCapabilities-HpsCBvbh.js')) {
    console.log('Imports licenseCapabilities:', f);
  }
});
