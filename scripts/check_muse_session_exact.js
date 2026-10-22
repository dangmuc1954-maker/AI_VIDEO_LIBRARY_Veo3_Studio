const fs = require('fs');
const path = require('path');

const p = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'browser-sessions.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
const session = data.sessions.find(s => s.accountId.includes('custom-e618febb'));
console.log('Session status:');
console.log('accountId:', session.accountId);
console.log('provider:', session.provider);
console.log('providerId:', session.providerId);
console.log('accountName:', session.accountName);
console.log('authStatus:', session.authStatus);
console.log('viewState:', session.viewState);
console.log('disabled:', session.disabled);
