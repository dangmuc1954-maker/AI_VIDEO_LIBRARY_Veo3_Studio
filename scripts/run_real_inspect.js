const { spawn } = require('child_process');
const path = require('path');

const electronExe = path.join(__dirname, '..', 'electron_bin', 'electron.exe');
const script = path.join(__dirname, 'inspect_muse_real_session.js');

const child = spawn(electronExe, [script], {
  stdio: 'pipe'
});

child.stdout.on('data', d => console.log(d.toString()));
child.stderr.on('data', d => console.error(d.toString()));
child.on('close', code => console.log('Process exited with code:', code));
