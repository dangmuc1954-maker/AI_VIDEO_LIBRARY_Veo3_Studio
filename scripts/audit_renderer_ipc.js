const fs = require('fs');
const path = require('path');

const appMain = fs.readFileSync('app/out/main/index.js', 'utf8');

// Extract all handlers registered in main
const registeredHandles = new Set();
const regexHandle = /\.handle\(\s*["']([^"']+)["']/g;
let m;
while ((m = regexHandle.exec(appMain)) !== null) {
  registeredHandles.add(m[1]);
}

const registeredOns = new Set();
const regexOn = /\.on\(\s*["']([^"']+)["']/g;
while ((m = regexOn.exec(appMain)) !== null) {
  registeredOns.add(m[1]);
}

console.log('Total handles in main:', registeredHandles.size);
console.log('Total on listeners in main:', registeredOns.size);

// Scan renderer files for ipcRenderer.invoke or ipcRenderer.send
const rendererDir = 'app/out/renderer/assets';
const files = fs.readdirSync(rendererDir).filter(f => f.endsWith('.js'));

const invokedChannels = new Set();
const sentChannels = new Set();

for (const file of files) {
  const content = fs.readFileSync(path.join(rendererDir, file), 'utf8');
  // Match window.electron.ipcRenderer.invoke('channel') or .invoke("channel"
  const invMatches = content.matchAll(/\.invoke\(\s*["']([^"']+)["']/g);
  for (const match of invMatches) {
    if (match[1].length < 60 && !match[1].includes(' ')) {
      invokedChannels.add(match[1]);
    }
  }

  const sendMatches = content.matchAll(/\.send\(\s*["']([^"']+)["']/g);
  for (const match of sendMatches) {
    if (match[1].length < 60 && !match[1].includes(' ')) {
      sentChannels.add(match[1]);
    }
  }
}

console.log('Total unique invoked channels in renderer:', invokedChannels.size);
const missingHandles = Array.from(invokedChannels).filter(c => !registeredHandles.has(c) && !registeredOns.has(c));
console.log('\n--- INVOKED CHANNELS WITH NO HANDLER IN MAIN (' + missingHandles.length + ') ---');
console.log(missingHandles);
