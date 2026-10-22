const fs = require('fs');

let studioCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const mnBlock = fs.readFileSync('scripts/generated_mn_block.js', 'utf8');

// 1. Insert mnBlock before function Qn()
const qnTarget = 'function Qn(){';
if (!studioCode.includes(qnTarget)) {
  console.error('function Qn(){ not found!');
  process.exit(1);
}

// Check if already injected
if (!studioCode.includes('// ==================== AIFORGE VIDEO EDITOR HELPERS & ICONS ====================')) {
  studioCode = studioCode.replace(qnTarget, mnBlock + '\n' + qnTarget);
  console.log('Injected mnBlock before function Qn()');
} else {
  console.log('mnBlock already injected');
}

// 2. Add state & global trigger at the beginning of Qn()
const stateTarget = 'function Qn(){const t=F(r=>r.promptRows),';
const stateAddition = 'function Qn(){const [isMergeModalOpen, setIsMergeModalOpen] = h.useState(false);const [mergeModalInitialAssetIds, setMergeModalInitialAssetIds] = h.useState([]);h.useEffect(()=>{window.__openAiforgeVideoEditorModal=(assetIds=[])=>{setMergeModalInitialAssetIds(Array.isArray(assetIds)?assetIds:[]);setIsMergeModalOpen(true);};return ()=>{window.__openAiforgeVideoEditorModal=null;};},[]);const t=F(r=>r.promptRows),';

if (studioCode.includes(stateTarget) && !studioCode.includes('isMergeModalOpen, setIsMergeModalOpen')) {
  studioCode = studioCode.replace(stateTarget, stateAddition);
  console.log('Injected isMergeModalOpen state into Qn()');
} else {
  console.log('State already injected or target modified');
}

// 3. Update the button onClick:
const oldOnClick = 'onClick:()=>{if(window.aiforgeVideoEditor?.open){window.aiforgeVideoEditor.open();}else{alert("Đang khởi tạo trình biên tập video...");}},';
const newOnClick = 'onClick:()=>{setMergeModalInitialAssetIds([]);setIsMergeModalOpen(true);},';
if (studioCode.includes(oldOnClick)) {
  studioCode = studioCode.replace(oldOnClick, newOnClick);
  console.log('Updated [Biên tập video] button onClick');
}

// 4. In the return tree of Qn, add isMergeModalOpen && e.jsx(mn, ...)
const modalTarget = 'isShowingInFolder:O==="showInFolder"})]})})}export{Qn as default};';
const modalAddition = 'isShowingInFolder:O==="showInFolder"}),isMergeModalOpen&&e.jsx(mn,{isOpen:!0,initialAssetIds:mergeModalInitialAssetIds,onClose:()=>setIsMergeModalOpen(!1)},mergeModalInitialAssetIds.join(":")||"manual-merge")';

if (studioCode.includes(modalTarget) && !studioCode.includes('isMergeModalOpen&&e.jsx(mn')) {
  studioCode = studioCode.replace(modalTarget, 'isShowingInFolder:O==="showInFolder"}),isMergeModalOpen&&e.jsx(mn,{isOpen:!0,initialAssetIds:mergeModalInitialAssetIds,onClose:()=>setIsMergeModalOpen(!1)},mergeModalInitialAssetIds.join(":")||"manual-merge")})]})}export{Qn as default};');
  console.log('Injected mn JSX into return of Qn()');
} else {
  console.log('Modal JSX already injected or target modified');
}

fs.writeFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', studioCode, 'utf8');
console.log('Wrote updated VideoStudio-BZY_1pM8.js, new size:', studioCode.length);
