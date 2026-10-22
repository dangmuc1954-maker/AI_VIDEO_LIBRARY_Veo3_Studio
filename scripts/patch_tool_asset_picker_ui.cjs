const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Locate the dropzone and insert the Action Buttons above it
const targetDropzone = `// Drag and drop zone
            e.jsxs("div",{onDragOver:onDragOver,onDrop:onDropImages,className:"group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/25 p-4 text-center transition-all hover:border-[#a3e635]/50 hover:bg-[#a3e635]/5",children:[`;

if (!code.includes(targetDropzone)) {
  console.error('Target dropzone string not found!');
  process.exit(1);
}

const actionButtonsAndDropzone = `// Source Selection Action Bar
            e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[
              e.jsxs("button",{type:"button",onClick:()=>document.getElementById("aiforge-batch-ref-input")?.click(),className:"flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-all hover:scale-[1.01] cursor-pointer",children:[
                "📁 Tải từ máy tính"
              ]}),
              e.jsxs("button",{type:"button",onClick:()=>setToolPickerOpen(!0),className:"flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#a3e635]/40 bg-gradient-to-r from-[#8b5cf6]/20 to-[#a3e635]/20 hover:from-[#8b5cf6]/30 hover:to-[#a3e635]/30 text-xs font-black text-[#d9f99d] shadow-[0_0_15px_rgba(163,230,53,0.15)] transition-all hover:scale-[1.01] cursor-pointer",children:[
                "🖼️ Thư viện Tool (", availableToolAssets.length, ")"
              ]}),
              availableToolAssets.length>0&&e.jsxs("button",{type:"button",onClick:()=>handleAddToolAssets(availableToolAssets),title:"Nạp nhanh toàn bộ ảnh trong tool theo thứ tự Cảnh",className:"px-3 py-2 rounded-xl border border-purple-500/40 bg-purple-500/15 hover:bg-purple-500/25 text-xs font-bold text-purple-200 transition-all hover:scale-[1.01] cursor-pointer",children:[
                "⚡ Tất cả (", availableToolAssets.length, ")"
              ]})
            ]}),

            // Drag and drop zone
            e.jsxs("div",{onDragOver:onDragOver,onDrop:onDropImages,className:"group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/25 p-4 text-center transition-all hover:border-[#a3e635]/50 hover:bg-[#a3e635]/5",children:[`;

code = code.replace(targetDropzone, actionButtonsAndDropzone);
console.log('Inserted Action Buttons above dropzone');

// 2. Insert Tool Picker Dialog at the end of function Se (before the return closing bracket)
const targetDialogEnd = `    ]})
  ]})
})}`;

if (!code.includes(targetDialogEnd)) {
  console.error('Target dialog end string not found!');
  process.exit(1);
}

const toolPickerModalJsx = `,
    toolPickerOpen&&e.jsx("div",{className:"fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4",onClick:ev=>{if(ev.target===ev.currentTarget)setToolPickerOpen(!1)},children:e.jsxs("div",{className:"flex h-[min(720px,90vh)] w-[min(1000px,94vw)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-[#16122d] shadow-[0_25px_80px_rgba(0,0,0,0.9)]",children:[
      e.jsxs("div",{className:"flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#211b42] px-6",children:[
        e.jsxs("div",{className:"flex items-center gap-3",children:[
          e.jsx("div",{className:"flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 text-lg border border-purple-500/30",children:"🖼️"}),
          e.jsxs("div",{children:[
            e.jsx("h3",{className:"text-base font-extrabold text-white",children:"Thư viện Ảnh trong Tool"}),
            e.jsxs("p",{className:"text-xs text-slate-300",children:["Tích chọn ảnh có sẵn để ghép tự động vào các Cảnh video (Tìm thấy ",availableToolAssets.length," ảnh)"]})
          ]})
        ]}),
        e.jsx("button",{type:"button",onClick:()=>setToolPickerOpen(!1),className:"flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-lg",children:"✕"})
      ]}),
      e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#1b1638] px-6 py-3",children:[
        e.jsxs("div",{className:"relative flex-1 min-w-[200px] max-w-md",children:[
          e.jsx("input",{type:"text",value:toolSearch,onChange:ev=>setToolSearch(ev.target.value),placeholder:"Tìm theo tên ảnh, prompt cảnh...",className:"w-full rounded-xl border border-white/15 bg-black/30 px-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-[#a3e635] focus:outline-none"}),
          toolSearch&&e.jsx("button",{type:"button",onClick:()=>setToolSearch(""),className:"absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer",children:"✕"})
        ]}),
        e.jsxs("div",{className:"flex items-center gap-2",children:[
          e.jsx("button",{type:"button",onClick:()=>{const f=availableToolAssets.filter(x=>{if(!toolSearch.trim())return!0;const q=toolSearch.toLowerCase();return(x.name||"").toLowerCase().includes(q)||(x.prompt||"").toLowerCase().includes(q)});setSelectedToolIds(f.map(x=>x.id))},className:"rounded-lg border border-[#a3e635]/40 bg-[#a3e635]/15 px-3 py-1.5 text-xs font-bold text-[#d9f99d] hover:bg-[#a3e635]/25 transition-all cursor-pointer",children:"✓ Chọn tất cả"}),
          e.jsx("button",{type:"button",onClick:()=>setSelectedToolIds([]),className:"rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10 transition-all cursor-pointer",children:"Bỏ chọn"})
        ]})
      ]}),
      e.jsx("div",{className:"flex-1 min-h-0 overflow-y-auto p-5 [scrollbar-gutter:stable]",children:(()=>{
        const filtered=availableToolAssets.filter(x=>{if(!toolSearch.trim())return!0;const q=toolSearch.toLowerCase();return(x.name||"").toLowerCase().includes(q)||(x.prompt||"").toLowerCase().includes(q)});
        if(filtered.length===0){
          return e.jsxs("div",{className:"flex h-full flex-col items-center justify-center p-8 text-center text-slate-400",children:[
            e.jsx("div",{className:"text-4xl mb-2",children:"🖼️"}),
            e.jsx("div",{className:"text-sm font-bold text-slate-200",children:"Không tìm thấy ảnh nào trong tool"}),
            e.jsx("div",{className:"text-xs text-slate-400 mt-1",children:"Hãy tạo ảnh trong Studio Ảnh AI hoặc tải ảnh lên thư viện tài sản trước."})
          ]});
        }
        return e.jsx("div",{className:"grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5",children:filtered.map((asset,aIdx)=>{
          const selIdx=selectedToolIds.indexOf(asset.id),isSelected=selIdx!==-1;
          const sceneMatch=asset.name?.match(/^(c[aả]nh|scene)\\s*\\d+/i)||asset.sceneName;
          return e.jsxs("div",{key:asset.id,onClick:()=>{setSelectedToolIds(prev=>{const cur=[...prev],idx=cur.indexOf(asset.id);if(idx!==-1)cur.splice(idx,1);else cur.push(asset.id);return cur})},className:\`group relative flex flex-col overflow-hidden rounded-2xl border transition-all cursor-pointer select-none \${isSelected?"border-[#a3e635] ring-2 ring-[#a3e635]/50 bg-[#a3e635]/10 shadow-[0_0_20px_rgba(163,230,53,0.2)]":"border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"}\`,children:[
            e.jsxs("div",{className:"relative aspect-square w-full overflow-hidden bg-black/60",children:[
              e.jsx("img",{src:asset.thumbnailUrl||asset.url,alt:asset.name||"Asset",className:"h-full w-full object-cover transition-transform group-hover:scale-105"}),
              e.jsx("div",{className:\`absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-black shadow-md transition-all \${isSelected?"bg-[#a3e635] text-black scale-110":"bg-black/60 text-white/60 border border-white/30"}\`,children:isSelected?("#"+(selIdx+1)):"+"}),
              sceneMatch&&e.jsx("div",{className:"absolute top-2 left-2 rounded-md bg-[#a3e635] px-1.5 py-0.5 text-[9.5px] font-black text-black shadow-sm",children:asset.sceneName||sceneMatch[0]})
            ]}),
            e.jsxs("div",{className:"p-2 min-w-0",children:[
              e.jsx("div",{className:\`truncate text-xs font-bold \${isSelected?"text-[#d9f99d]":"text-white"}\`,title:asset.name,children:asset.name||("Ảnh "+(aIdx+1))}),
              asset.prompt&&e.jsx("div",{className:"truncate text-[10px] text-slate-400 mt-0.5",title:asset.prompt,children:asset.prompt})
            ]})
          ]});
        })});
      })()}),
      e.jsxs("div",{className:"flex h-16 shrink-0 items-center justify-between border-t border-white/10 bg-[#211b42] px-6",children:[
        e.jsxs("div",{className:"text-xs font-semibold text-slate-300",children:["Đã chọn: ",e.jsxs("span",{className:"text-[#a3e635] font-extrabold text-sm ml-1",children:[selectedToolIds.length," ảnh"]})]}),
        e.jsxs("div",{className:"flex items-center gap-3",children:[
          e.jsx("button",{type:"button",onClick:()=>setToolPickerOpen(!1),className:"rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer",children:"Hủy"}),
          e.jsx("button",{type:"button",disabled:selectedToolIds.length===0,onClick:()=>{const map=new Map(availableToolAssets.map(x=>[x.id,x]));const chosen=selectedToolIds.map(x=>map.get(x)).filter(Boolean);handleAddToolAssets(chosen);setToolPickerOpen(!1)},className:"flex items-center gap-2 rounded-xl bg-[#a3e635] px-6 py-2 text-xs font-black text-black shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:bg-[#b7f245] hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer",children:"✨ Nạp "+selectedToolIds.length+" ảnh đã chọn"})
        ]})
      ]})
    ]})
  })
    ]})
  ]})
})}`;

code = code.replace(targetDialogEnd, toolPickerModalJsx);
console.log('Inserted Tool Picker Dialog Modal into JSX');

// 3. Update the thumbnail strip to show Tool vs File badge
const oldStripCaption = 'e.jsx("span",{className:"truncate px-1 py-0.5 text-[9px] text-slate-300 font-mono text-center bg-black/60",title:img.name,children:img.name})';
const newStripCaption = 'e.jsxs("span",{className:"truncate px-1 py-0.5 text-[9px] text-slate-300 font-mono text-center bg-black/60",title:img.name,children:[img.isToolAsset?"🖼️ ":"📁 ",img.name]})';

if (code.includes(oldStripCaption)) {
  code = code.replace(oldStripCaption, newStripCaption);
  console.log('Updated thumbnail strip caption with tool/file icon');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved changes to StudioFailedBulkActions-Zv2NpUPy.js');

// 4. Update VideoStudio-frcr8V6s.js to pass assets:We
const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let vsCode = fs.readFileSync(vsPath, 'utf8');

const oldVsImportModal = 'e.jsx($r,{open:yo,onOpenChange:bt,onImport:r=>{fe(r),z.success(t("importPrompt.successToastVideo",{count:r.length}))},studioType:"video"})';
const newVsImportModal = 'e.jsx($r,{open:yo,onOpenChange:bt,onImport:r=>{fe(r),z.success(t("importPrompt.successToastVideo",{count:r.length}))},studioType:"video",assets:We})';

if (vsCode.includes(oldVsImportModal)) {
  vsCode = vsCode.replace(oldVsImportModal, newVsImportModal);
  fs.writeFileSync(vsPath, vsCode, 'utf8');
  console.log('Updated VideoStudio-frcr8V6s.js with assets:We prop');
} else {
  console.log('VideoStudio already has assets prop or signature differed');
}

// 5. Verify syntax with node --check
execSync(`node --check "${filePath}"`);
console.log('✅ StudioFailedBulkActions syntax is 100% valid!');
execSync(`node --check "${vsPath}"`);
console.log('✅ VideoStudio syntax is 100% valid!');
