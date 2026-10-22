const fs = require('fs');

const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

const snifferStart = `try {
  A.webContents.on("console-message", (evt, level, msg) => {`;

const snifferEnd = `  A.webContents.on("dom-ready", _injectHook);
  A.webContents.on("did-finish-load", _injectHook);
} catch(err) {}`;

const sIdx = content.indexOf(snifferStart);
const eIdx = content.indexOf(snifferEnd);

if (sIdx !== -1 && eIdx !== -1) {
  const fullBlock = content.slice(sIdx, eIdx + snifferEnd.length);
  content = content.replace(fullBlock, '// Sniffer removed cleanly');
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('Successfully removed unsafe sniffer from getOrCreateView!');
} else {
  console.error('Could not find sniffer block: sIdx=' + sIdx + ', eIdx=' + eIdx);
}
