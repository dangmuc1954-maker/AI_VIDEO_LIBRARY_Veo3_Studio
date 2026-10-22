const fs = require('fs');
const path = require('path');
const https = require('https');

// Let's inspect partition folders in AppData
const partitionsDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA', 'Partitions');
console.log('Checking partitions in:', partitionsDir);

if (fs.existsSync(partitionsDir)) {
  const dirs = fs.readdirSync(partitionsDir);
  console.log('Available partitions:', dirs);
}
