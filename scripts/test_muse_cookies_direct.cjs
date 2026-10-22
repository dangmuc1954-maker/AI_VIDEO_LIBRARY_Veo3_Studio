const { app, session } = require('electron');
const path = require('path');
const fs = require('fs');

const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
app.setPath('userData', appDataDir);

app.whenReady().then(async () => {
  const out = [];
  try {
    const p1 = 'persist:aivideo:muse:muse-1791770852638';
    const ses1 = session.fromPartition(p1);
    const c1 = await ses1.cookies.get({});
    const m1 = c1.filter(c => c.domain.includes('muse'));
    out.push(`Session 1: total = ${c1.length}, muse cookies = ${m1.length}: ${JSON.stringify(m1.map(c => ({ name: c.name, domain: c.domain })))}`);

    const p2 = 'persist:aivideo:muse:muse-1791782221593';
    const ses2 = session.fromPartition(p2);
    const c2 = await ses2.cookies.get({});
    const m2 = c2.filter(c => c.domain.includes('muse'));
    out.push(`Session 2: total = ${c2.length}, muse cookies = ${m2.length}: ${JSON.stringify(m2.map(c => ({ name: c.name, domain: c.domain })))}`);
  } catch (e) {
    out.push(`Error: ${e.message}`);
  }

  const outPath = path.resolve('scripts/cookie_results.txt');
  fs.writeFileSync(outPath, out.join('\n'), 'utf8');
  console.log('Saved to', outPath);
  app.quit();
});
