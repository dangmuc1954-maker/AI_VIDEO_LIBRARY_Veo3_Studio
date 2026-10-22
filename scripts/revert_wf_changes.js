const fs = require('fs');
const path = require('path');

// 1. Revert app/out/main/index.js
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainContent = fs.readFileSync(mainPath, 'utf8');

const rGetMe = 'E.handle("workflowStore:getMe",async A=>(C(A),j.withFreshEntitlement(o=>ue.getMe(o)).catch(async()=>ue.getMe("guest"))))';
const tGetMe = 'E.handle("workflowStore:getMe",async A=>(C(A),j.withFreshEntitlement(o=>ue.getMe(o))))';

const rClaim = 'E.handle("workflowStore:claimFree",async(A,o)=>(C(A),R(o,"workflow product id"),j.withFreshEntitlement(n=>ue.claimFree(o,n)).catch(async()=>ue.claimFree(o,"guest"))))';
const tClaim = 'E.handle("workflowStore:claimFree",async(A,o)=>(C(A),R(o,"workflow product id"),j.withFreshEntitlement(n=>ue.claimFree(o,n))))';

const rDl = 'const n=await j.withFreshEntitlement(g=>ue.download(o,g)).catch(async()=>ue.download(o,"guest")),a=n.definition;';
const tDl = 'const n=await j.withFreshEntitlement(g=>ue.download(o,g)),a=n.definition;';

const rRec = 'try{await j.withFreshEntitlement(g=>ue.recordInstallation({entitlementId:n.entitlementId,versionId:n.versionId,localWorkflowId:s,status:"installed"},g)).catch(()=>{})}catch(g){}';
const tRec = 'try{await j.withFreshEntitlement(g=>ue.recordInstallation({entitlementId:n.entitlementId,versionId:n.versionId,localWorkflowId:s,status:"installed"},g))}catch(g){throw await ie.remove(s),g}';

let revertedCount = 0;
if (mainContent.includes(rGetMe)) { mainContent = mainContent.replace(rGetMe, tGetMe); revertedCount++; }
if (mainContent.includes(rClaim)) { mainContent = mainContent.replace(rClaim, tClaim); revertedCount++; }
if (mainContent.includes(rDl)) { mainContent = mainContent.replace(rDl, tDl); revertedCount++; }
if (mainContent.includes(rRec)) { mainContent = mainContent.replace(rRec, tRec); revertedCount++; }

fs.writeFileSync(mainPath, mainContent, 'utf8');
console.log(`Reverted ${revertedCount}/4 patches in app/out/main/index.js`);

// 2. Revert app/out/renderer/assets/WorkflowStore-BIvOZ42B.js
const storePath = path.join(__dirname, '../app/out/renderer/assets/WorkflowStore-BIvOZ42B.js');
if (fs.existsSync(storePath)) {
  let storeContent = fs.readFileSync(storePath, 'utf8');
  const target = 'await Zt(window.aiforge?.license);const[x,S,z]=await Promise.all([r.getCatalog(),r.getMe(),r.listOrders()]),O=new Map(S.entitlements.map(A=>[A.productId,A]));';
  const replacement = 'await Zt(window.aiforge?.license).catch(()=>null);const[x,S,z]=await Promise.all([r.getCatalog(),r.getMe().catch(()=>({entitlements:[],publisher:{enabled:!1}})),r.listOrders().catch(()=>({orders:[]}))]),O=new Map((S?.entitlements||[]).map(A=>[A.productId,A]));';
  if (storeContent.includes(replacement)) {
    storeContent = storeContent.replace(replacement, target);
    fs.writeFileSync(storePath, storeContent, 'utf8');
    console.log('Reverted WorkflowStore-BIvOZ42B.js');
  } else {
    console.log('WorkflowStore replacement string not found (already reverted or unmodified)');
  }
}

// 3. Remove store-* workflows from Roaming directories
const roamingDirs = [
  'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\workflows-v2',
  'C:\\Users\\admin\\AppData\\Roaming\\AI VIDEO LIBRARY\\workflows-v2',
  'C:\\Users\\admin\\AppData\\Roaming\\aiforge-studio\\workflows-v2'
];

for (const dir of roamingDirs) {
  if (!fs.existsSync(dir)) continue;
  const indexPath = path.join(dir, 'index.json');
  if (fs.existsSync(indexPath)) {
    try {
      const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      if (Array.isArray(idx.workflows)) {
        const initialCount = idx.workflows.length;
        const keptWorkflows = [];
        for (const wf of idx.workflows) {
          if (wf.id && wf.id.startsWith('store-')) {
            // Remove json file
            const crypto = require('crypto');
            const h = crypto.createHash('sha256').update(wf.id).digest('hex');
            const fPath = path.join(dir, `${h}.json`);
            if (fs.existsSync(fPath)) {
              try { fs.unlinkSync(fPath); } catch(e){}
            }
          } else {
            keptWorkflows.push(wf);
          }
        }
        idx.workflows = keptWorkflows;
        fs.writeFileSync(indexPath, JSON.stringify(idx, null, 2), 'utf8');
        console.log(`Cleaned ${initialCount - keptWorkflows.length} store-* workflows from ${dir}`);
      }
    } catch(e) {
      console.error(`Error cleaning ${dir}:`, e.message);
    }
  }
}

console.log('Done reverting workflow changes!');
