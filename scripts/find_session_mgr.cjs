const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find constructor of SessionManager or BrowserHub
const p = mainCode.indexOf('class SessionManager') !== -1 ? mainCode.indexOf('class SessionManager') : mainCode.indexOf('this.sessions=');
console.log('p:', p);
if (p !== -1) {
  console.log(mainCode.slice(p - 100, p + 500));
}
