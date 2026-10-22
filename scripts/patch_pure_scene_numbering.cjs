const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  // =========================================================================
  // 1. Update StudioFailedBulkActions-Zv2NpUPy.js:
  //    - Ensure function Je(t) always renumbers index and sceneName (Cảnh 1, Cảnh 2...)
  //    - Ensure Le maps title to pure "Cảnh " + N
  // =========================================================================
  const sPath = path.join(root, 'out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
  if (fs.existsSync(sPath)) {
    let sCode = fs.readFileSync(sPath, 'utf8');

    // Update function Je(t)
    const oldJe = 'function Je(t){return t.map((n,a)=>({...n,index:a+1}))}';
    const newJe = 'function Je(t){return t.map((n,a)=>{const s=a+1;return{...n,index:s,sceneName:"Cảnh "+s,title:"Cảnh "+s}})}';
    if (sCode.includes(oldJe)) {
      sCode = sCode.replace(oldJe, newJe);
      console.log('Updated function Je in', sPath);
    }

    // Update Le mapping title
    const oldLeTitle = 'title:D(r.payload,"title")||(N?("Cảnh "+N):"")';
    const newLeTitle = 'title:N?("Cảnh "+N):(D(r.payload,"sceneName")||D(r.payload,"title")||"Cảnh")';
    if (sCode.includes(oldLeTitle)) {
      sCode = sCode.replace(oldLeTitle, newLeTitle);
      console.log('Updated Le title in', sPath);
    }

    fs.writeFileSync(sPath, sCode, 'utf8');
    try {
      execSync(`node --check "${sPath}"`);
      console.log('✅ StudioFailedBulkActions syntax valid in', sPath);
    } catch (e) {
      console.error('❌ StudioFailedBulkActions syntax error:', e.message);
    }
  }

  // =========================================================================
  // 2. Update ImageStudio-4nmpUX3j.js:
  //    - Row table badge: always "Cảnh " + a.index
  //    - Grid card title: ONLY "Cảnh " + (m.promptOrder || 1) (NO prompt text)
  //    - List view title: ONLY "Cảnh " + (M.promptOrder || 1) (NO prompt text)
  //    - Inspector header title: ONLY "Cảnh " + order (NO prompt text)
  //    - Download filename: ONLY "Cảnh " + order + ".png"
  // =========================================================================
  const isPath = path.join(root, 'out/renderer/assets/ImageStudio-4nmpUX3j.js');
  if (fs.existsSync(isPath)) {
    let isCode = fs.readFileSync(isPath, 'utf8');

    // 2.1 Table row badge: always strictly based on a.index
    const oldRowBadge = 'children:a.sceneName||("Cảnh "+a.index)';
    const newRowBadge = 'children:"Cảnh "+a.index';
    if (isCode.includes(oldRowBadge)) {
      isCode = isCode.replace(oldRowBadge, newRowBadge);
      console.log('Updated table row badge in', isPath);
    }

    // 2.2 Grid card title: ONLY "Cảnh X" (remove m.prompt)
    // Find grid card title container
    const oldGridTitle = 'children:[e.jsx("span",{className:"mr-1.5 rounded bg-[#a3e635] px-1.5 py-0.5 text-[9.5px] font-black text-black shadow-xs",children:m.title||(m.promptOrder?("Cảnh "+m.promptOrder):"Cảnh")}),m.prompt]}';
    const newGridTitle = 'children:[e.jsx("span",{className:"rounded bg-[#a3e635] px-2 py-0.5 text-[10.5px] font-black text-black shadow-xs",children:"Cảnh "+(m.promptOrder||1)})]}';
    if (isCode.includes(oldGridTitle)) {
      isCode = isCode.replace(oldGridTitle, newGridTitle);
      console.log('Updated grid card title to pure Cảnh X in', isPath);
    }

    // 2.3 List view title: ONLY "Cảnh X" (remove M.prompt)
    const oldListTitle = 'children:[e.jsx("span",{className:"rounded bg-[#a3e635] px-1.5 py-0.5 text-xs font-black text-black shadow-xs shrink-0",children:M.title||(M.promptOrder?("Cảnh "+M.promptOrder):"Cảnh")}),e.jsx("span",{className:"truncate text-sm font-semibold text-text-primary",children:M.prompt.trim()||"Blank image prompt"})]}';
    const newListTitle = 'children:[e.jsx("span",{className:"rounded bg-[#a3e635] px-2 py-0.5 text-xs font-black text-black shadow-xs shrink-0",children:"Cảnh "+(M.promptOrder||1)})]}';
    if (isCode.includes(oldListTitle)) {
      isCode = isCode.replace(oldListTitle, newListTitle);
      console.log('Updated list view title to pure Cảnh X in', isPath);
    }

    // 2.4 Inspector header title: ONLY "Cảnh X"
    const oldInspectorTitle = 'Ee=((o?.sceneName||o?.title||n?.title||(n?.promptOrder?("Cảnh "+n.promptOrder):""))?(o?.sceneName||o?.title||n?.title||("Cảnh "+n.promptOrder))+": ":"")+(o?.prompt||n.prompt||"Blank image prompt")';
    const newInspectorTitle = 'Ee="Cảnh "+(o?.index||n?.promptOrder||1)';
    if (isCode.includes(oldInspectorTitle)) {
      isCode = isCode.replace(oldInspectorTitle, newInspectorTitle);
      console.log('Updated inspector title in', isPath);
    }

    // 2.5 Download filename: ONLY "Cảnh X.png"
    const oldDownloadFn = '_rawTitle=(He?.sceneName||He?.title||re?.title||("Cảnh "+_sn)).trim().replace(/[\\/:*?"<>|]/g,"_").replace(/\\.png$/i,"")';
    const newDownloadFn = '_rawTitle="Cảnh "+_sn';
    if (isCode.includes(oldDownloadFn)) {
      isCode = isCode.replace(oldDownloadFn, newDownloadFn);
      console.log('Updated download filename to pure Cảnh X in', isPath);
    }

    fs.writeFileSync(isPath, isCode, 'utf8');
    try {
      execSync(`node --check "${isPath}"`);
      console.log('✅ ImageStudio syntax valid in', isPath);
    } catch (e) {
      console.error('❌ ImageStudio syntax error:', e.message);
    }
  }

  // =========================================================================
  // 3. Update main/index.js:
  //    - _getGenName helper must ALWAYS use "Canh_" + promptOrder + ".png"
  //      if promptOrder exists! NEVER fallback to prompt text if scene is known.
  // =========================================================================
  const mainPath = path.join(root, 'out/main/index.js');
  if (fs.existsSync(mainPath)) {
    let mainCode = fs.readFileSync(mainPath, 'utf8');

    // Replace _getGenName with strict scene numbering logic
    const oldHelperRegex = /function _getGenName\([^)]*\)\{[^}]*\}/;
    const newHelper = 'function _getGenName(e,m){const o=e?.payload?.promptOrder;if(typeof o==="number"||(typeof o==="string"&&o))return"Canh_"+o+".png";const s=e?.payload?.sceneName||e?.payload?.title||(e?.title&&/^Cảnh\\s*\\d+/i.test(e.title)?e.title:void 0);if(s){const match=s.match(/\\d+/);if(match)return"Canh_"+match[0]+".png";return or(s,m)}return or(typeof e?.payload?.prompt=="string"?e.payload.prompt:e?.title,m)}';

    if (oldHelperRegex.test(mainCode)) {
      mainCode = mainCode.replace(oldHelperRegex, newHelper);
      console.log('Updated _getGenName helper in', mainPath);
    }

    fs.writeFileSync(mainPath, mainCode, 'utf8');
    try {
      execSync(`node --check "${mainPath}"`);
      console.log('✅ Main syntax valid in', mainPath);
    } catch (e) {
      console.error('❌ Main syntax error:', e.message);
    }
  }
}
