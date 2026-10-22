const fs = require('fs');
const path = require('path');
const roaming = process.env.APPDATA;

const dirs = ['aiforge-studio', 'AI VIDEO LIBRARY', 'ai-video-library', 'AI_VIDEO_LIBRARY_DATA'];

for (const d of dirs) {
  const dirPath = path.join(roaming, d);
  console.log(`\n=================== DIR: ${d} ===================`);
  if (!fs.existsSync(dirPath)) {
    console.log('Does not exist');
    continue;
  }
  const sessionFile = path.join(dirPath, 'browser-sessions.json');
  if (fs.existsSync(sessionFile)) {
    try {
      const data = JSON.parse(fs.readFileSync(sessionFile, 'utf8'));
      const list = data.sessions || [];
      console.log(`Found ${list.length} sessions in ${sessionFile}:`);
      for (const s of list) {
        console.log(`  - [${s.providerId || s.provider}] ${s.accountName || s.accountDisplayName || s.accountEmail} | Status: ${s.authStatus} | Partition: ${s.partition}`);
      }
    } catch (e) {
      console.log('Error reading session file:', e.message);
    }
  } else {
    console.log('No browser-sessions.json found');
  }

  // Check Partitions folder
  const partDir = path.join(dirPath, 'Partitions');
  if (fs.existsSync(partDir)) {
    const parts = fs.readdirSync(partDir);
    console.log(`Partitions (${parts.length}):`, parts.slice(0, 10));
  } else {
    console.log('No Partitions folder');
  }
}
