const fs = require('fs');

const p1 = 'app/out/main/index.js';
const p2 = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js';

[p1, p2].forEach(p => {
  console.log('--- Checking:', p);
  if (!fs.existsSync(p)) {
    console.log('File does NOT exist:', p);
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  console.log('1. Concurrency limit = ko (500):', content.includes('model==="muse-video"') && content.includes('return ko;'));
  console.log('2. Scheduler getLimit = ko (500):', content.includes('providerId==="muse"') && content.includes('return ko;return Math.max(1,Math.floor(this.resolveLimit(e)||1))'));
  console.log('3. Dynamic Load Balancing (global.__muse_dispatch_counter):', content.includes('global.__muse_dispatch_counter'));
  console.log('4. Active cookie check (cookieCount: c.length):', content.includes('activeMuseSessions.push({ ...s, cookieCount: c.length })'));
  console.log('5. Round-robin split across active accounts:', content.includes('session = activeMuseSessions[(global.__muse_dispatch_counter - 1) % activeMuseSessions.length];'));
});
