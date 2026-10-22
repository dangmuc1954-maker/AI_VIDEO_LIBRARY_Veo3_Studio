const fs = require('fs');
const path = require('path');
const os = require('os');

const appData = process.env.APPDATA || '';
const localAppData = process.env.LOCALAPPDATA || '';

function searchLogs(baseDir) {
  if (!fs.existsSync(baseDir)) return [];
  const res = [];
  try {
    const files = fs.readdirSync(baseDir, { withFileTypes: true });
    for (const f of files) {
      const p = path.join(baseDir, f.name);
      if (f.isDirectory() && (f.name.toLowerCase().includes('log') || f.name.toLowerCase().includes('ai'))) {
        res.push(...searchLogs(p));
      } else if (f.isFile() && (f.name.endsWith('.log') || f.name.endsWith('.txt'))) {
        res.push(p);
      }
    }
  } catch {}
  return res;
}

console.log('Searching logs in AppData...');
const dirsToCheck = [
  path.join(appData, 'AI_VIDEO_LIBRARY_DATA'),
  path.join(appData, 'AI VIDEO LIBRARY'),
  path.join(localAppData, 'AI VIDEO LIBRARY'),
  path.join(localAppData, 'Programs', 'AI VIDEO LIBRARY')
];

for (const d of dirsToCheck) {
  const found = searchLogs(d);
  console.log(`Logs in ${d}:`, found);
  for (const f of found) {
    const st = fs.statSync(f);
    console.log(`  ${f} (modified: ${new Date(st.mtimeMs).toLocaleTimeString()}, size: ${st.size})`);
  }
}
