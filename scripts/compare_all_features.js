const fs = require('fs');

const origMain = fs.readFileSync('scratch/original_aiforge_out/out/main/index.js', 'utf8');
const appMain = fs.readFileSync('app/out/main/index.js', 'utf8');

function extractChannels(content) {
  const channels = new Set();
  const regex = /\.(?:handle|on)\s*\(\s*["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    if (m[1].length < 60 && !m[1].includes(' ') && (m[1].includes(':') || m[1].includes('-') || m[1].includes('.'))) {
      channels.add(m[1]);
    }
  }
  return Array.from(channels).sort();
}

const origChannels = extractChannels(origMain);
const appChannels = extractChannels(appMain);

console.log('Orig main IPC channels count:', origChannels.length);
console.log('App main IPC channels count:', appChannels.length);

const missingChannels = origChannels.filter(c => !appChannels.includes(c));
const addedChannels = appChannels.filter(c => !origChannels.includes(c));

console.log('\n--- Channels in Original Main but MISSING in App Main (' + missingChannels.length + ') ---');
console.log(missingChannels);

console.log('\n--- Channels in App Main ADDED (' + addedChannels.length + ') ---');
console.log(addedChannels);
