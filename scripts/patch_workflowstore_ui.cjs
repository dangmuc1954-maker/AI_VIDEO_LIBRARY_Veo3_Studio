const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'WorkflowStore-BIvOZ42B.js');
let content = fs.readFileSync(filePath, 'utf-8');

const target = 'await Zt(window.aiforge?.license);const[x,S,z]=await Promise.all([r.getCatalog(),r.getMe(),r.listOrders()]),O=new Map(S.entitlements.map(A=>[A.productId,A]));';

const replacement = 'await Zt(window.aiforge?.license).catch(()=>null);const[x,S,z]=await Promise.all([r.getCatalog(),r.getMe().catch(()=>({entitlements:[],publisher:{enabled:!1}})),r.listOrders().catch(()=>({orders:[]}))]),O=new Map((S?.entitlements||[]).map(A=>[A.productId,A]));';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('Successfully patched WorkflowStore-BIvOZ42B.js!');
} else {
  console.error('Target not found in WorkflowStore-BIvOZ42B.js');
}
