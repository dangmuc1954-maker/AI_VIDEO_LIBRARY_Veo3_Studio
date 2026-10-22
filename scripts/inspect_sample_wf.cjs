const fs = require('fs');

const p1 = 'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY\\workflows-v2\\fbf0ac85fb42e51e7e0afdd1e4a2f9d5c64565d5a72c2c1f228a01d5b4ec9da0.json';
const p2 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\workflows-v2\\7ae4df463397bb615dc7b16a0a24872f6ef21574ef4e2d449067c6d475693b18.json';
const p3 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\workflows-v2\\1a46f038556f20a3df33ec6d3d6310db693ccfb55087d5520757a04a12e9a08c.json';

if (fs.existsSync(p1)) {
  console.log('=== Template 1 ===');
  console.log(fs.readFileSync(p1, 'utf-8'));
}

if (fs.existsSync(p3)) {
  console.log('=== Workflow 1a46 (5 nodes) ===');
  const d3 = JSON.parse(fs.readFileSync(p3, 'utf-8'));
  console.log('Keys:', Object.keys(d3));
  console.log('Nodes count:', d3.nodes?.length);
  console.log('Nodes summary:', d3.nodes?.map(n => ({ id: n.id, type: n.type, title: n.title, inputs: n.inputs, outputs: n.outputs, config: n.config })));
  console.log('Connections:', d3.connections);
}
