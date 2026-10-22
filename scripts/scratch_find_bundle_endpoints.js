const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

const regex = /["'](\/[a-zA-Z0-9_\-\.\/]+)["']/g;
let m;
const endpoints = new Set();
while ((m = regex.exec(code)) !== null) {
  const s = m[1];
  if (s.includes('video') || s.includes('generate') || s.includes('media') || s.includes('project') || s.includes('sandbox') || s.includes('flow') || s.includes('veo') || s.includes('api')) {
    endpoints.add(s);
  }
}

console.log('Endpoints found in bundle:', Array.from(endpoints).slice(0, 50));
