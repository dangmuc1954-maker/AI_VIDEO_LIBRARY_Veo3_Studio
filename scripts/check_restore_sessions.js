const fs = require('fs');
const path = require('path');
const p = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
const tmpFile = path.join(p, 'browser-sessions.json.6784.1791680281722.tmp');
const data = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
console.log('Total sessions in tmp:', data.sessions.length);
const partitionDir = path.join(p, 'Partitions');
const existingPartitions = fs.existsSync(partitionDir) ? fs.readdirSync(partitionDir) : [];
console.log('Total partitions on disk:', existingPartitions.length);

data.sessions.forEach((s, idx) => {
  const pName = s.partition.replace('persist:aiforge:', '').replace('persist:aivideo:', '');
  const found = existingPartitions.some(ep => ep.includes(pName) || pName.includes(ep));
  console.log(`${idx + 1}. [${s.providerId}] ${s.accountName} | ${s.authStatus} | Partition: ${s.partition} | Exists: ${found}`);
});
