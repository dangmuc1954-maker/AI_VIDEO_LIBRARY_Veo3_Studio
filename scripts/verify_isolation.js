const { spawnSync } = require('child_process');
const path = require('path');
const electronExe = path.join(__dirname, '../electron_bin/electron.exe');
const appDir = path.join(__dirname, '../app');

console.log('Testing App Launch with smoke test flag...');
const res = spawnSync(electronExe, [appDir, '--smoke-test'], {
  encoding: 'utf8',
  timeout: 10000,
  env: { ...process.env, AFS_LICENSE_DEV_ALLOW: '1' }
});

console.log('Exit code:', res.status);
console.log('Stdout:', res.stdout);
console.log('Stderr:', res.stderr);
