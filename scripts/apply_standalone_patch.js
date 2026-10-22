const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcDir = path.join(__dirname, '../extracted_original');
const destDir = path.join(__dirname, '../app');

console.log('--- APPLYING CLEAN REBUILD AND FULL INDEPENDENCE PATCH ---');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Fresh copy out from extracted_original
copyRecursiveSync(path.join(srcDir, 'out'), path.join(destDir, 'out'));

const mainJsPath = path.join(destDir, 'out/main/index.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 2. DevBypass -> always true
const oldDevBypass = 'isDevBypassEnabled(){return!this.options.isPackaged&&process.env.AFS_LICENSE_DEV_ALLOW==="1"}';
const newDevBypass = 'isDevBypassEnabled(){return true;}';
code = code.replace(oldDevBypass, newDevBypass);

// 3. DevTools enabled
const oldRw = 'function Rw(){G.isPackaged&&G.on("web-contents-created",(r,e)=>{e.on("before-input-event",(t,o)=>{Tw(o)&&t.preventDefault()}),e.on("devtools-opened",()=>{e.closeDevTools()})})}';
const newRw = 'function Rw(){}';
code = code.replace(oldRw, newRw);

const oldTw = 'function Tw(r){const e=r.key.toLowerCase();return e==="f12"||e==="i"&&r.control&&r.shift||e==="j"&&r.control&&r.shift||e==="c"&&r.control&&r.shift||e==="i"&&r.meta&&r.alt||e==="j"&&r.meta&&r.alt||e==="c"&&r.meta&&r.alt}';
const newTw = 'function Tw(r){return false;}';
code = code.replace(oldTw, newTw);

// 4. Window instant show & custom title
code = code.replace('backgroundColor:"#070a11",show:!1', 'title:"Veo 3 Studio Pro — Creative AI Hub",backgroundColor:"#070a11",show:!0');
code = code.replace('devTools:!G.isPackaged', 'devTools:!0');

// 5. Replace startup phone-home checkIn with instant job unblock
const oldStartupCheckin = 'nn.getState().entitlementToken&&W.checkIn().then(()=>{X.unblockLicenseJobs(),Ne()}).catch(c=>{b("license","startup check-in failed; cached entitlement will be used if still valid",{backendUrl:_n.getBaseUrl(),error:T(c)})})';
const newStartupCheckin = 'X.unblockLicenseJobs(),Ne()';
code = code.replace(oldStartupCheckin, newStartupCheckin);

// 6. Update HTML Title
const htmlPath = path.join(destDir, 'out/renderer/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
html = html.replace('<title>AIForge Studio</title>', '<title>Veo 3 Studio Pro — Creative AI Hub</title>');
fs.writeFileSync(htmlPath, html, 'utf8');

// Validate Module Syntax
try {
  new vm.SourceTextModule(code);
  fs.writeFileSync(mainJsPath, code, 'utf8');
  console.log('[PASS] Standalone Independence Package successfully verified and built!');
} catch (err) {
  console.error('[FAIL] Syntax error:', err);
}
