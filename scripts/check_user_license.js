const fs = require('fs');
const path = require('path');

const dirs = fs.readdirSync(process.env.APPDATA).filter(d => d.toLowerCase().includes('video') || d.toLowerCase().includes('veo') || d.toLowerCase().includes('studio') || d.toLowerCase().includes('aiforge'));

for (const d of dirs) {
  for (const f of ['license-state.json', 'license-state.production.json', 'license-state.development.json']) {
    const p = path.join(process.env.APPDATA, d, f);
    if (fs.existsSync(p)) {
      console.log('Found', p);
      try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        console.log('License data:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.log('Error reading:', e.message);
      }
    }
  }
}
