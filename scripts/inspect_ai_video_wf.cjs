const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\workflows-v2';
if (fs.existsSync(dir)) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'index.json');
  console.log('Workflows in AI_VIDEO_LIBRARY_DATA/workflows-v2:');
  files.forEach(f => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'));
      console.log(`- File: ${f}`);
      console.log(`  ID: ${data.id} | Name: "${data.name}" | Nodes: ${data.nodes ? data.nodes.length : 0} | Status: ${data.status}`);
      if (data.nodes && data.nodes.length > 0) {
        console.log(`  Node titles:`, data.nodes.map(n => n.title || n.type));
      }
    } catch(e) {
      console.error(f, e.message);
    }
  });
}
