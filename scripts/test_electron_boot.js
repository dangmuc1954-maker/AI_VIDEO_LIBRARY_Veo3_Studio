const { spawn } = require('child_process');
const path = require('path');

const electronExe = path.join(__dirname, '..', 'electron_bin', 'electron.exe');
const appDir = path.join(__dirname, '..', 'app');

console.log('Spawning electron from', appDir);
const child = spawn(electronExe, [appDir], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'pipe'
});

let errors = [];

child.stdout.on('data', d => {
  const str = d.toString();
  console.log('[stdout]', str.trim());
});

child.stderr.on('data', d => {
  const str = d.toString();
  console.error('[stderr]', str.trim());
  if (str.includes('Error') || str.includes('Syntax') || str.includes('ReferenceError')) {
    errors.push(str);
  }
});

setTimeout(() => {
  child.kill();
  console.log('Killed electron test run after 4s.');
  if (errors.length > 0) {
    console.error('Errors found:', errors);
    process.exit(1);
  } else {
    console.log('✅ Clean launch test passed with 0 crashes!');
    process.exit(0);
  }
}, 4000);
