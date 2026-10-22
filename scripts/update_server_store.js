const fs = require('fs');
const path = require('path');

const serverFile = path.resolve(__dirname, '../vercel_server/api/index.js');
let code = fs.readFileSync(serverFile, 'utf8');

// 1. Add unlinkedMachines to inMemoryStore if not present
if (!code.includes('unlinkedMachines:')) {
  code = code.replace(
    'bannedMachines: new Set(),',
    'bannedMachines: new Set(),\n  unlinkedMachines: new Set(),'
  );
  console.log('[1] Added unlinkedMachines to inMemoryStore');
}

// 2. Update hydrateFromCloud
if (!code.includes('inMemoryStore.unlinkedMachines.add')) {
  const hydrateTarget = 'if (Array.isArray(d.bannedMachines)) {';
  const hydrateAddition = `if (Array.isArray(d.unlinkedMachines)) {\n          d.unlinkedMachines.forEach(b => { if (b) inMemoryStore.unlinkedMachines.add(String(b).trim()); });\n        }\n        ${hydrateTarget}`;
  code = code.replace(hydrateTarget, hydrateAddition);
  console.log('[2] Updated hydrateFromCloud for unlinkedMachines');
}

// 3. Update triggerSaveToCloud
if (!code.includes('unlinkedMachines: Array.from(inMemoryStore.unlinkedMachines)')) {
  code = code.replace(
    'bannedMachines: Array.from(inMemoryStore.bannedMachines),',
    'bannedMachines: Array.from(inMemoryStore.bannedMachines),\n          unlinkedMachines: Array.from(inMemoryStore.unlinkedMachines),'
  );
  console.log('[3] Updated triggerSaveToCloud for unlinkedMachines');
}

fs.writeFileSync(serverFile, code, 'utf8');
console.log('✅ Base store updated successfully!');
