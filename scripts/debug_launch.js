const { spawn } = require('child_process');
const exe = 'C:\\Users\\admin\\AppData\\Local\\Programs\\AI VIDEO LIBRARY\\AI VIDEO LIBRARY.exe';

const child = spawn(exe, [], {
  stdio: 'pipe',
  env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' }
});

child.stdout.on('data', d => console.log('STDOUT:', d.toString()));
child.stderr.on('data', d => console.log('STDERR:', d.toString()));
child.on('close', code => console.log('CHILD CLOSED WITH CODE:', code));

setTimeout(() => {
  console.log('10s check: pid =', child.pid, 'killed =', child.killed);
}, 10000);
