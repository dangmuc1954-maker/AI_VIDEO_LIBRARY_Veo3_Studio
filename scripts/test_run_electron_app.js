const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const testScript = `
const { app, session } = require('electron');

app.whenReady().then(async () => {
  console.log('[ELECTRON TEST] Electron ready!');
  const dataDir = path.join(app.getPath('appData'), 'AI_VIDEO_LIBRARY_DATA');
  console.log('[ELECTRON TEST] Data dir:', dataDir);
  app.quit();
});
`;

fs.writeFileSync('temp_electron_test.cjs', testScript);
const exe = 'C:\\Users\\admin\\AppData\\Local\\Programs\\AI VIDEO LIBRARY\\AI VIDEO LIBRARY.exe';

const child = spawn(exe, [path.resolve('temp_electron_test.cjs')], {
  stdio: 'pipe'
});

child.stdout.on('data', d => console.log('stdout:', d.toString()));
child.stderr.on('data', d => console.log('stderr:', d.toString()));
child.on('close', code => {
  console.log('Exited with code:', code);
  if (fs.existsSync('temp_electron_test.cjs')) fs.unlinkSync('temp_electron_test.cjs');
});
