const fs = require('fs');
const content = fs.readFileSync('license_server/server.js', 'utf8');

const regex = /lifetime|trọn đời|vĩnh viễn/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  const start = Math.max(0, match.index - 100);
  const end = Math.min(content.length, match.index + 200);
  console.log(`--- Line around pos ${match.index} ---`);
  console.log(content.slice(start, end));
}
