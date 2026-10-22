const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Remove the large fixed overlay popup modal completely
const popupStartStr = ',\n    toolPickerOpen&&e.jsx("div",{className:"fixed inset-0 z-[120]';
const p1 = code.indexOf(popupStartStr);
if (p1 !== -1) {
  const pEnd = code.indexOf('const le={image:{title:"Generating image"', p1);
  if (pEnd !== -1) {
    // Find the closing brackets of Se before const le
    // Original closing was:
    //         ]})
    //       ]})
    //     ]})
    //   ]})
    // })}
    const cleanClose = `        ]})
      ]})
    ]})
  ]})
})}
`;
    // Find where the footer buttons end
    const footerButtonsEnd = code.lastIndexOf('isUploading?"Đang nạp ảnh & tạo phân cảnh...":v\n          ]})\n        ]})\n      ]})', p1);
    if (footerButtonsEnd !== -1) {
      const cutPoint = footerButtonsEnd + 'isUploading?"Đang nạp ảnh & tạo phân cảnh...":v\n          ]})\n        ]})\n      ]})'.length;
      code = code.slice(0, cutPoint) + '\n    ]})' + '\n  ]})' + '\n})' + '}\n' + code.slice(pEnd);
      console.log('Successfully removed the blocking fixed overlay popup modal!');
    }
  }
}

// 2. Add activeSourceTab state to function Se if not present
if (!code.includes('activeSourceTab,setActiveSourceTab')) {
  code = code.replace(
    '[toolPickerOpen,setToolPickerOpen]=h.useState(!1),',
    '[activeSourceTab,setActiveSourceTab]=h.useState("computer"),'
  );
  console.log('Added activeSourceTab state');
}

// 3. Replace the Action Bar & Dropzone with the 100% INLINE Switcher
const oldActionBarAndDropzoneStart = '// Source Selection Action Bar';
const pActionBar = code.indexOf(oldActionBarAndDropzoneStart);
const pThumbStrip = code.indexOf('// Image Thumbnails Strip');

if (pActionBar !== -1 && pThumbStrip !== -1) {
  const inlineComponentJsx = `// Source Selection Inline Tabs
            e.jsxs("div",{className:"flex items-center gap-1.5 mb-2",children:[
              e.jsxs("button",{type:"button",onClick:()=>setActiveSourceTab("computer"),className:\`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer \${activeSourceTab==="computer"?"border-white/30 bg-white/15 text-white shadow-sm":"border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}\`,children:[
                "📁 Tải từ máy tính"
              ]}),
              e.jsxs("button",{type:"button",onClick:()=>setActiveSourceTab("tool"),className:\`flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl border text-xs font-black transition-all cursor-pointer \${activeSourceTab==="tool"?"border-[#a3e635] bg-[#a3e635]/20 text-[#d9f99d] shadow-[0_0_12px_rgba(163,230,53,0.2)]":"border-[#a3e635]/30 bg-[#a3e635]/5 text-slate-300 hover:text-white hover:bg-[#a3e635]/10"}\`,children:[
                "🖼️ Thư viện Tool (", availableToolAssets.length, ")"
              ]})
            ]}),

            // INLINE SOURCE BOX (NO OVERLAY, NEVER COVERS ANYTHING)
            activeSourceTab==="computer"?e.jsxs("div",{onDragOver:onDragOver,onDrop:onDropImages,className:"group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/25 p-4 text-center transition-all hover:border-[#a3e635]/50 hover:bg-[#a3e635]/5",children:[
              e.jsx("input",{type:"file",multiple:!0,accept:"image/*",id:"aiforge-batch-ref-input",onChange:ev=>handleAddFiles(ev.target.files),className:"absolute inset-0 cursor-pointer opacity-0 z-10"}),
              e.jsx("div",{className:"mb-1 text-2xl group-hover:scale-110 transition-transform",children:"📂"}),
              e.jsx("div",{className:"text-xs font-bold text-slate-200",children:"Kéo thả danh sách ảnh vào đây (hoặc click để chọn từ máy tính)"}),
              e.jsx("div",{className:"mt-0.5 text-[11px] text-slate-400",children:"Hỗ trợ đặt tên: 1.png, 2.png, canh1.png hoặc Nam.png, Lan.png..."})
            ]}):e.jsxs("div",{className:"rounded-xl border border-white/15 bg-black/35 p-2.5 flex flex-col gap-2 shadow-inner",children:[
              e.jsxs("div",{className:"flex items-center justify-between gap-2 px-1",children:[
                e.jsxs("span",{className:"text-[11px] font-bold text-slate-200",children:[
                  "Kho ảnh trong Tool (", availableToolAssets.length, "):"
                ]}),
                e.jsxs("div",{className:"flex items-center gap-1.5",children:[
                  availableToolAssets.length>0&&e.jsx("button",{type:"button",onClick:()=>handleAddToolAssets(availableToolAssets),className:"rounded-lg border border-[#a3e635]/50 bg-[#a3e635]/20 px-2 py-0.5 text-[10px] font-black text-[#d9f99d] hover:bg-[#a3e635]/30 cursor-pointer transition-all",children:"⚡ Nạp tất cả"}),
                  imageFiles.some(f=>f.isToolAsset)&&e.jsx("button",{type:"button",onClick:()=>setImageFiles(prev=>prev.filter(f=>!f.isToolAsset)),className:"rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-300 hover:bg-red-500/20 cursor-pointer transition-all",children:"Bỏ ảnh tool"})
                ]})
              ]}),
              availableToolAssets.length===0?e.jsxs("div",{className:"flex h-20 flex-col items-center justify-center text-center text-slate-400",children:[
                e.jsx("span",{className:"text-xs font-semibold text-slate-300",children:"Chưa có ảnh nào trong tool"}),
                e.jsx("span",{className:"text-[10px] text-slate-400 mt-0.5",children:"Hãy tạo ảnh trong Studio Ảnh AI trước."})
              ]}):e.jsx("div",{className:"flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]",children:availableToolAssets.map((asset,aIdx)=>{
                const isAdded=imageFiles.some(f=>f.assetId===asset.id);
                const sceneMatch=asset.name?.match(/^(c[aả]nh|scene)\\s*\\d+/i)||asset.sceneName;
                return e.jsxs("div",{key:asset.id,onClick:()=>{
                  if(isAdded){
                    setImageFiles(prev=>prev.filter(f=>f.assetId!==asset.id));
                  }else{
                    handleAddToolAssets([asset]);
                  }
                },className:\`group relative flex h-20 w-24 shrink-0 flex-col overflow-hidden rounded-xl border transition-all cursor-pointer \${isAdded?"border-[#a3e635] ring-2 ring-[#a3e635]/50 bg-[#a3e635]/15":"border-white/15 bg-black/50 hover:border-white/40"}\`,children:[
                  e.jsx("img",{src:asset.thumbnailUrl||asset.url,alt:asset.name||"Asset",className:"h-14 w-full object-cover"}),
                  e.jsx("div",{className:\`absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black \${isAdded?"bg-[#a3e635] text-black":"bg-black/70 text-white/50 border border-white/20"}\`,children:isAdded?"✓":"+"}),
                  sceneMatch&&e.jsx("div",{className:"absolute top-1 left-1 rounded bg-[#a3e635] px-1 py-0.2 text-[8px] font-black text-black",children:asset.sceneName||sceneMatch[0]}),
                  e.jsx("span",{className:\`truncate px-1 py-0.5 text-[8.5px] font-bold text-center \${isAdded?"text-[#d9f99d] bg-black/80":"text-slate-300 bg-black/60"}\`,title:asset.name,children:asset.name||("Ảnh "+(aIdx+1))})
                ]});
              })})
            ]}),

            `;

  code = code.slice(0, pActionBar) + inlineComponentJsx + code.slice(pThumbStrip);
  console.log('Replaced with 100% INLINE Tool Library Box!');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Saved changes to StudioFailedBulkActions-Zv2NpUPy.js');

try {
  execSync(`node --check "${filePath}"`);
  console.log('✅ Syntax valid for StudioFailedBulkActions-Zv2NpUPy.js');
} catch (err) {
  console.error('❌ Syntax error:', err.message);
  process.exit(1);
}
