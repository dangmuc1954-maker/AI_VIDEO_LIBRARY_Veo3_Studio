const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(file, 'utf8');

// 1. In generateSingleImage:
const singleTarget = `const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));`;

const singleReplacement = `const liveSessions = (window.aiforge?.browser?.listSessions?.() || window.aivideo?.browser?.listSessions?.() || []);
      const effectiveAccs = (accounts && accounts.length > 0) ? accounts : liveSessions;
      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = effectiveAccs.filter(a => (a.providerId === 'banana' || a.provider === 'Banana') && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
      if (activeBananaAccs.length === 0) activeBananaAccs = effectiveAccs.filter(a => a.providerId === 'banana' || a.provider === 'Banana');`;

if (code.includes(singleTarget)) {
  code = code.replace(singleTarget, singleReplacement);
  console.log('✅ Updated generateSingleImage with liveSessions fallback');
}

// 2. In generateAllImages:
const allTarget = `const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
    let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));`;

const allReplacement = `const liveSessionsAll = (window.aiforge?.browser?.listSessions?.() || window.aivideo?.browser?.listSessions?.() || []);
    const effectiveAccsAll = (accounts && accounts.length > 0) ? accounts : liveSessionsAll;
    const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
    let activeBananaAccs = effectiveAccsAll.filter(a => (a.providerId === 'banana' || a.provider === 'Banana') && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
    if (activeBananaAccs.length === 0) activeBananaAccs = effectiveAccsAll.filter(a => a.providerId === 'banana' || a.provider === 'Banana');`;

if (code.includes(allTarget)) {
  code = code.replace(allTarget, allReplacement);
  console.log('✅ Updated generateAllImages with liveSessions fallback');
}

fs.writeFileSync(file, code, 'utf8');
console.log('🎉 Live account fallback successfully applied to VideoFactoryStudio.js!');
