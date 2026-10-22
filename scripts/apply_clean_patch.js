const fs = require('fs');
const path = require('path');
const vm = require('vm');

const origJs = fs.readFileSync(path.join(__dirname, 'extracted_original/out/main/index.js'), 'utf8');

function testCode(code, name) {
  try {
    new vm.SourceTextModule(code);
    console.log(`[PASS] ${name}`);
    return true;
  } catch (err) {
    console.log(`[FAIL] ${name}:`, err.message);
    return false;
  }
}

let code = origJs;

// 1. isDevBypassEnabled -> return true
const oldDevBypass = 'isDevBypassEnabled(){return!this.options.isPackaged&&process.env.AFS_LICENSE_DEV_ALLOW==="1"}';
const newDevBypass = 'isDevBypassEnabled(){return true;}';
if (!code.includes(oldDevBypass)) {
  console.log('Warning: oldDevBypass string not found exactly!');
}
code = code.replace(oldDevBypass, newDevBypass);
testCode(code, '1. isDevBypassEnabled');

// 2. Rw() devtools unlock
const oldRw = 'function Rw(){G.isPackaged&&G.on("web-contents-created",(r,e)=>{e.on("before-input-event",(t,o)=>{Tw(o)&&t.preventDefault()}),e.on("devtools-opened",()=>{e.closeDevTools()})})}';
const newRw = 'function Rw(){}';
code = code.replace(oldRw, newRw);
testCode(code, '2. DevTools enabled (Rw)');

// 3. Tw() keybindings
const oldTw = 'function Tw(r){const e=r.key.toLowerCase();return e==="f12"||e==="i"&&r.control&&r.shift||e==="j"&&r.control&&r.shift||e==="c"&&r.control&&r.shift||e==="i"&&r.meta&&r.alt||e==="j"&&r.meta&&r.alt||e==="c"&&r.meta&&r.alt}';
const newTw = 'function Tw(r){return false;}';
code = code.replace(oldTw, newTw);
testCode(code, '3. Keybindings unrestricted (Tw)');

console.log('\n--- FINAL VALIDATION ---');
if (testCode(code, 'Complete Patched & Unlocked AIForge Main Process')) {
  const destDir = path.join(__dirname, 'app');
  fs.writeFileSync(path.join(destDir, 'out/main/index.js'), code, 'utf8');
  console.log('Successfully written to app/out/main/index.js!');
}
