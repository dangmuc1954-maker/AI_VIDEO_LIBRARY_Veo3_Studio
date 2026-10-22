const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Patch getMe
const tGetMe = 'E.handle("workflowStore:getMe",async A=>(C(A),j.withFreshEntitlement(o=>ue.getMe(o))))';
const rGetMe = 'E.handle("workflowStore:getMe",async A=>(C(A),j.withFreshEntitlement(o=>ue.getMe(o)).catch(async()=>ue.getMe("guest"))))';

// 2. Patch claimFree
const tClaim = 'E.handle("workflowStore:claimFree",async(A,o)=>(C(A),R(o,"workflow product id"),j.withFreshEntitlement(n=>ue.claimFree(o,n))))';
const rClaim = 'E.handle("workflowStore:claimFree",async(A,o)=>(C(A),R(o,"workflow product id"),j.withFreshEntitlement(n=>ue.claimFree(o,n)).catch(async()=>ue.claimFree(o,"guest"))))';

// 3. Patch install download
const tDl = 'const n=await j.withFreshEntitlement(g=>ue.download(o,g)),a=n.definition;';
const rDl = 'const n=await j.withFreshEntitlement(g=>ue.download(o,g)).catch(async()=>ue.download(o,"guest")),a=n.definition;';

// 4. Patch recordInstallation error handling
const tRec = 'try{await j.withFreshEntitlement(g=>ue.recordInstallation({entitlementId:n.entitlementId,versionId:n.versionId,localWorkflowId:s,status:"installed"},g))}catch(g){throw await ie.remove(s),g}';
const rRec = 'try{await j.withFreshEntitlement(g=>ue.recordInstallation({entitlementId:n.entitlementId,versionId:n.versionId,localWorkflowId:s,status:"installed"},g)).catch(()=>{})}catch(g){}';

let count = 0;
if (content.includes(tGetMe)) { content = content.replace(tGetMe, rGetMe); count++; }
if (content.includes(tClaim)) { content = content.replace(tClaim, rClaim); count++; }
if (content.includes(tDl)) { content = content.replace(tDl, rDl); count++; }
if (content.includes(tRec)) { content = content.replace(tRec, rRec); count++; }

console.log(`Patched ${count}/4 targets in app/out/main/index.js`);
fs.writeFileSync(filePath, content, 'utf-8');
