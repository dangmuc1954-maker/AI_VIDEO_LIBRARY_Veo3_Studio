const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

const isFile = path.join(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let isCode = fs.readFileSync(isFile, 'utf8');

// 1. Top prompt table cell
const oldCell = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-text-primary",children:ge?a.prompt:e.jsx("span",{className:"italic text-text-muted",children:v("imageStudio.blankPrompt")})})';
const newCell = 'e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[e.jsx("span",{className:"flex h-5 shrink-0 items-center rounded bg-[#a3e635]/20 border border-[#a3e635]/40 px-1.5 text-[10px] font-extrabold text-[#d9f99d]",children:a.sceneName||("Cảnh "+a.index)}),e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-text-primary",children:ge?a.prompt:e.jsx("span",{className:"italic text-text-muted",children:v("imageStudio.blankPrompt")})})]})';

if (isCode.includes(oldCell)) {
  isCode = isCode.replace(oldCell, newCell);
  console.log('✓ Patched top prompt table cell with [Cảnh X] badge');
}

// 2. Grid card prompt display
const oldGrid = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",children:m.prompt})';
const newGrid = 'e.jsxs("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",title:m.prompt,children:[e.jsx("span",{className:"mr-1.5 rounded bg-[#a3e635] px-1.5 py-0.5 text-[9.5px] font-black text-black shadow-xs",children:m.title||(m.promptOrder?("Cảnh "+m.promptOrder):"Cảnh")}),m.prompt]})';

if (isCode.includes(oldGrid)) {
  isCode = isCode.replace(oldGrid, newGrid);
  console.log('✓ Patched grid card with [Cảnh X] badge');
}

// 3. List view prompt display
const oldList = 'e.jsx("div",{className:"truncate text-sm font-semibold text-text-primary",children:M.prompt.trim()||"Blank image prompt"})';
const newList = 'e.jsxs("div",{className:"flex items-center gap-2 truncate",children:[e.jsx("span",{className:"rounded bg-[#a3e635] px-1.5 py-0.5 text-xs font-black text-black shadow-xs shrink-0",children:M.title||(M.promptOrder?("Cảnh "+M.promptOrder):"Cảnh")}),e.jsx("span",{className:"truncate text-sm font-semibold text-text-primary",children:M.prompt.trim()||"Blank image prompt"})]})';

if (isCode.includes(oldList)) {
  isCode = isCode.replace(oldList, newList);
  console.log('✓ Patched list view with [Cảnh X] badge');
}

// 4. Modal header title
const oldModal = 'Ee=o?.prompt||n.prompt||"Blank image prompt"';
const newModal = 'Ee=((o?.sceneName||o?.title||n?.title||(n?.promptOrder?("Cảnh "+n.promptOrder):""))?(o?.sceneName||o?.title||n?.title||("Cảnh "+n.promptOrder))+": ":"")+(o?.prompt||n.prompt||"Blank image prompt")';

if (isCode.includes(oldModal)) {
  isCode = isCode.replace(oldModal, newModal);
  console.log('✓ Patched modal header title with Cảnh X prefix');
}

// Verify syntax of ImageStudio
console.log('Testing Acorn parse of ImageStudio-4nmpUX3j.js...');
acorn.parse(isCode, { ecmaVersion: 'latest', sourceType: 'module' });
console.log('✓ ImageStudio-4nmpUX3j.js is 100% syntactically valid JS!');

fs.writeFileSync(isFile, isCode, 'utf8');
console.log('✓ Successfully saved ImageStudio-4nmpUX3j.js');
