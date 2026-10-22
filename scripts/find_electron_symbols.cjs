const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');

// Check electron imports
const m = c.match(/import\s*\{([^}]+)\}\s*from\s*['"]electron['"]/);
if (m) {
  console.log('Electron imports:', m[1]);
} else {
  console.log('No direct import match, checking require or default import');
  const m2 = c.match(/import\s*([a-zA-Z0-9_$]+)\s*from\s*['"]electron['"]/);
  if (m2) console.log('Default import:', m2[0]);
}

// Find G, Se, BrowserWindow, session, app symbols
const symbols = ['BrowserWindow', 'WebContentsView', 'session', 'app', 'ipcMain'];
for (const s of symbols) {
  let idx = 0;
  let count = 0;
  while ((idx = c.indexOf(s, idx)) !== -1) {
    count++;
    idx += s.length;
  }
  console.log(`${s} count: ${count}`);
}
