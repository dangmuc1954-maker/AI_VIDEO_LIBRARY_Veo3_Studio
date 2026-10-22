const { execSync } = require('child_process');

const exe = 'C:\\Users\\admin\\AppData\\Local\\Programs\\AI VIDEO LIBRARY\\AI VIDEO LIBRARY.exe';
const out = execSync(`"${exe}" -v`, {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
}).toString();
console.log('Node version in Electron:', out);
