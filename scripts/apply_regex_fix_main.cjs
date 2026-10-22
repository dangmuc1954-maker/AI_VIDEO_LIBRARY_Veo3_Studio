const fs = require('fs');
const vm = require('vm');
const path = require('path');

const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Replace both occurrences of match(/\/project\/([a-zA-Z0-9_-]+)/)
const searchStr = 'match(/\\/project\\/([a-zA-Z0-9_-]+)/)';
const replaceStr = "match(new RegExp('/project/([a-zA-Z0-9_-]+)'))";

console.log('Occurrences of searchStr:', content.split(searchStr).length - 1);
content = content.split(searchStr).join(replaceStr);

// Clear cooldowns
try {
  const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : null);
  if (appData) {
    const sessionFile = path.join(appData, 'AI_VIDEO_LIBRARY_DATA', 'browser-sessions.json');
    if (fs.existsSync(sessionFile)) {
      const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      const list = Array.isArray(data) ? data : (data.sessions || []);
      for (const s of list) {
        if (s.diagnostics) {
          delete s.diagnostics.cooldownUntil;
          delete s.diagnostics.cooldownReason;
          delete s.diagnostics.lastProviderErrorCode;
          s.healthScore = 100;
          s.healthLabel = "Excellent";
        }
      }
      fs.writeFileSync(sessionFile, JSON.stringify(data, null, 2), 'utf8');
      console.log('✅ Cleared all cooldowns in browser-sessions.json');
    }
  }
} catch(e) {
  console.warn('Cooldown clear error:', e.message);
}

fs.writeFileSync(mainPath, content, 'utf8');

// Test zu and nl with VM
const zuStart = content.indexOf('function zu(r){');
const zuEnd = content.indexOf('function Ku(r){', zuStart);
const zuCode = content.slice(zuStart, zuEnd);
const Sn = "6LdsFiUsAAAAAIjVDZcuLhaHiDn5nnHVXVRQGeMV";
const qe = { recaptcha: { siteKey: Sn }, clientContext: {}, rpcIds: {}, image: {} };
eval(zuCode);
const zuScript = zu({ params: { prompt: "test", projectId: "123" } });
new vm.Script(zuScript);
console.log('🎉 zu in-page script is 100% VALID SYNTAX!');

const nlStart = content.indexOf('function nl(r){');
const nlEnd = content.indexOf('function al(r){', nlStart);
const nlCode = content.slice(nlStart, nlEnd);
eval(nlCode);
const nlScript = nl({ params: { prompt: "test", projectId: "123" } });
new vm.Script(nlScript);
console.log('🎉 nl in-page script is 100% VALID SYNTAX!');
