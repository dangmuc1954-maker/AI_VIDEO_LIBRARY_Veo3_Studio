const fs = require('fs');
const s = JSON.parse(fs.readFileSync('C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/browser-sessions.json', 'utf8'));
const X = Array.isArray(s) ? s : (s.sessions || []);

console.log('Total sessions in file:', X.length);
X.forEach(sess => {
  console.log('Session:', sess.accountId, '| providerId:', sess.providerId, '| provider:', sess.provider, '| accountName:', sess.accountName, '| authStatus:', sess.authStatus);
});

const museAccounts = X.filter(r => r.providerId === 'muse' || r.providerId === 'muse-ai' || (r.provider && r.provider.toLowerCase().includes('muse')) || (r.startUrl && r.startUrl.includes('muse.ai')));

console.log('Filtered museAccounts count:', museAccounts.length);
if (museAccounts.length > 0) {
  const acc = museAccounts[0];
  console.log('Found muse account:', acc.accountName, 'includes "1":', [String(acc.accountName), String(acc.accountDisplayName), String(acc.accountEmail)].includes('1'));
}
