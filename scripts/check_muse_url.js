const fs = require('fs');
const path = require('path');

const p = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'browser-sessions.json');
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
const session = data.sessions.find(s => s.accountId.includes('custom-e618febb'));
console.log('Current URL:', session.currentUrl);
console.log('Start URL:', session.startUrl);
console.log('Page Title:', session.pageTitle);
console.log('Activity (last 10):');
console.log(session.activity.slice(-10));
