const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const data = require('../vercel_server/api/workflowsData.json');

const targetDirs = [
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\workflows-v2',
  'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY\\workflows-v2',
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio\\workflows-v2'
];

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const indexPath = path.join(dir, 'index.json');
  let indexData = { version: 3, workflows: [] };
  if (fs.existsSync(indexPath)) {
    try {
      indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
      if (!Array.isArray(indexData.workflows)) indexData.workflows = [];
    } catch(e) {}
  }

  for (const prod of data.products) {
    const def = data.definitions[prod.id];
    if (!def) continue;

    const wfId = `store-${prod.id}`;
    const wfObj = {
      id: wfId,
      createdAt: new Date().toISOString(),
      name: prod.name,
      description: prod.description || prod.summary || '',
      steps: def.nodes.length,
      status: 'active',
      lastRun: 'Never',
      runCount: 0,
      lastLogs: [],
      runHistory: [],
      nodes: def.nodes,
      connections: def.connections,
      delayBetweenNodes: 0,
      stopOnError: false
    };

    // 1. Write file <sha256>.json
    const filename = `${sha256(wfId)}.json`;
    const fullPath = path.join(dir, filename);
    fs.writeFileSync(fullPath, JSON.stringify(wfObj, null, 2), 'utf-8');

    // 2. Update index
    const preview = {
      id: wfId,
      createdAt: wfObj.createdAt,
      name: wfObj.name,
      description: wfObj.description,
      steps: wfObj.steps,
      status: wfObj.status,
      lastRun: wfObj.lastRun,
      runCount: wfObj.runCount,
      lastLogs: wfObj.lastLogs,
      runHistory: wfObj.runHistory,
      nodes: [],
      connections: []
    };

    const existingIdx = indexData.workflows.findIndex(w => w.id === wfId);
    if (existingIdx !== -1) {
      indexData.workflows[existingIdx] = preview;
    } else {
      indexData.workflows.unshift(preview);
    }
  }

  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
  console.log(`Updated 10 workflows into: ${dir} (Total workflows: ${indexData.workflows.length})`);
}
