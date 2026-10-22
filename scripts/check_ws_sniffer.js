const fs = require('fs');
const p = 'C:/Users/admin/Desktop/MUSE_API_SNIFFER.txt';
if (fs.existsSync(p)) {
  const content = fs.readFileSync(p, 'utf8');
  const ws = content.match(/wss?:[^\s"']+/g);
  console.log("WebSocket matches:", ws ? [...new Set(ws)] : "None");
}
