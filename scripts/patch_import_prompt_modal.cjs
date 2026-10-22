const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

const sfbPath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(sfbPath, 'utf8');

const sIdx = code.indexOf('function Se(');
const eIdx = code.indexOf('const le={image:', sIdx);

if (sIdx === -1 || eIdx === -1) {
  console.error('❌ Could not locate Se bounds in StudioFailedBulkActions-Zv2NpUPy.js');
  process.exit(1);
}

// Build the upgraded Se function
const upgradedSe = `function Se({open:t,onOpenChange:n,onImport:a,studioType:r,assets:propAssets}){
  const {t:s}=L(),
  [i,o]=h.useState(""),
  [imageFiles,setImageFiles]=h.useState([]),
  [matchMode,setMatchMode]=h.useState("name"),
  [customOverrides,setCustomOverrides]=h.useState({}),
  [isUploading,setIsUploading]=h.useState(!1),
  [uploadStatus,setUploadStatus]=h.useState(""),
  [activeSourceTab,setActiveSourceTab]=h.useState("computer"),
  [liveAssets,setLiveAssets]=h.useState([]);

  const storeAssets=(typeof To==="function"?To(st=>st.assets):null)||[];

  h.useEffect(()=>{
    if(t){
      let mounted=!0;
      const getList=async()=>{
        try{
          const res=await(window.aiforge?.assets?.list?.()||window.aivideo?.assets?.list?.());
          if(mounted&&Array.isArray(res))setLiveAssets(res);
        }catch(_){}
      };
      getList();
      return()=>{mounted=!1};
    }
  },[t]);

  const availableToolAssets=h.useMemo(()=>{
    const map=new Map();
    if(Array.isArray(propAssets))propAssets.forEach(x=>{if(x&&x.id)map.set(x.id,x)});
    if(Array.isArray(storeAssets))storeAssets.forEach(x=>{if(x&&x.id)map.set(x.id,x)});
    if(Array.isArray(liveAssets))liveAssets.forEach(x=>{if(x&&x.id)map.set(x.id,x)});
    return Array.from(map.values()).filter(x=>x&&(x.type==="image"||!x.type||x.mimeType?.startsWith("image/"))&&(x.thumbnailUrl||x.url||x.localPath)).sort((x1,x2)=>{
      const n1=x1.name||x1.sceneName||"",n2=x2.name||x2.sceneName||"";
      const cmp=n1.localeCompare(n2,undefined,{numeric:!0,sensitivity:"base"});
      if(cmp!==0)return cmp;
      return new Date(x2.createdAt||0)-new Date(x1.createdAt||0);
    });
  },[propAssets,storeAssets,liveAssets]);

  const handleAddToolAssets=(assetsToAdd)=>{
    if(!assetsToAdd||assetsToAdd.length===0)return;
    const readItems=assetsToAdd.map((itm,idx)=>{
      let cName=itm.name||itm.sceneName||"";
      if(!cName||cName.startsWith("generated-image-")||cName.startsWith("asset-")){
        cName=(itm.prompt?itm.prompt.slice(0,30).trim():("Cảnh "+(idx+1)))+".png";
      }
      return{
        assetId:itm.id,
        name:cName,
        size:itm.bytes||0,
        type:itm.mimeType||"image/png",
        previewUrl:itm.thumbnailUrl||itm.url,
        isToolAsset:!0,
        prompt:itm.prompt||""
      };
    });
    setImageFiles(prev=>{
      const merged=[...prev,...readItems];
      const map=new Map();
      merged.forEach(item=>{
        const key=(item.assetId||item.name)+'_'+item.size;
        if(!map.has(key))map.set(key,item);
      });
      const unique=Array.from(map.values());
      unique.sort((f1,f2)=>f1.name.localeCompare(f2.name,undefined,{numeric:!0,sensitivity:"base"}));
      return unique;
    });
  };

  const d=h.useMemo(()=>{
    if (!i || !i.trim()) return [];
    const trimmed = i.trim();
    let rawList;
    if (/\\r?\\n\\s*\\r?\\n/.test(trimmed)) {
      rawList = trimmed.split(/\\r?\\n\\s*\\r?\\n+/);
    } else {
      rawList = trimmed.split(/\\r?\\n+/);
    }
    return rawList.map(item => {
      return item.replace(/^\\s*(?:c[aả]nh|scene|ph[aâ]n\\s*c[aả]nh)?\\s*\\d+[:.)\\/\\-\\s]\\s*/i, '').trim();
    }).filter(p => p.length > 0);
  },[i]);

  const m=i.length;
  const x=i?i.split(/\\r?\\n/).length:0;

  const handleAddFiles = (files) => {
    if (!files || files.length === 0) return;
    const newArr = Array.from(files).filter(f => f && f.type && f.type.startsWith("image/"));
    if (newArr.length === 0) return;

    const readItems = newArr.map(f => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      previewUrl: URL.createObjectURL(f)
    }));

    setImageFiles(prev => {
      const merged = [...prev, ...readItems];
      const map = new Map();
      merged.forEach(item => {
        const key = item.name + '_' + item.size;
        if (!map.has(key)) map.set(key, item);
      });
      const unique = Array.from(map.values());
      unique.sort((f1, f2) => f1.name.localeCompare(f2.name, undefined, { numeric: true, sensitivity: 'base' }));
      return unique;
    });
  };

  const onDragOver = e => { e.preventDefault(); e.stopPropagation(); };
  const onDropImages = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer && e.dataTransfer.files) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  const getMatchedImageForScene = (sceneIndex, promptText) => {
    if (customOverrides[sceneIndex] !== undefined) {
      return customOverrides[sceneIndex];
    }
    if (!imageFiles || imageFiles.length === 0) return null;

    if (matchMode === "allOne") {
      return imageFiles[0] || null;
    }

    if (matchMode === "oneToOne") {
      return imageFiles[sceneIndex] || null;
    }

    const sceneNum = sceneIndex + 1;
    const nStr = String(sceneNum);

    let matched = imageFiles.find(img => {
      const raw = img.name.replace(/\\.[a-zA-Z0-9]+$/, '').toLowerCase();
      const r1 = new RegExp('(canh|cảnh|scene|p|c|phancanh)[_\\s-]*0*' + nStr + '([^0-9]|$)', 'i');
      if (r1.test(raw)) return true;
      const r2 = new RegExp('(^|[^0-9])0*' + nStr + '([^0-9]|$)');
      if (r2.test(raw)) return true;
      return false;
    });
    if (matched) return matched;

    const pLower = (promptText || '').toLowerCase();
    for (const img of imageFiles) {
      const base = img.name.replace(/\\.[a-zA-Z0-9]+$/, '').trim();
      const baseLower = base.toLowerCase();
      if (pLower.includes('@' + baseLower) || pLower.includes('[' + img.name.toLowerCase() + ']') || pLower.includes('[' + baseLower + ']')) {
        return img;
      }
    }

    const charMatched = imageFiles.find(img => {
      const charName = img.name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_-]/g, ' ').trim().toLowerCase();
      if (charName.length >= 2 && !/^\d+$/.test(charName)) {
        const wordRegex = new RegExp('(^|[^a-zA-Z0-9\\u00C0-\\u024F\\u1EA0-\\u1EF9])' + charName + '([^a-zA-Z0-9\\u00C0-\\u024F\\u1EA0-\\u1EF9]|$)', 'i');
        return wordRegex.test(pLower) || pLower.includes(charName);
      }
      return false;
    });
    if (charMatched) return charMatched;

    return null;
  };

  const u=async()=>{try{const c=await navigator.clipboard.readText();c&&o(l=>l.trim()?\`\${l.trim()}\\n\\n\${c.trim()}\`:c.trim())}catch{}};
  const b=()=>{o(""); setImageFiles([]); setCustomOverrides({});};
  const P=()=>{
    o(s(r==="video"?"importPrompt.sampleVideo":r==="tts"?"importPrompt.sampleTts":"importPrompt.sampleImage"));
  };
  const w=c=>{const l=d.filter((f,g)=>g!==c);o(l.join("\\n\\n"))};

  const j=async()=>{
    if (d.length === 0) return;
    setIsUploading(!0);
    setUploadStatus("Đang nạp ảnh lên thư viện...");

    try {
      const uploadMap = new Map();
      const fileToDataUrl = file => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });

      const importBridge = window.aiforge?.assets?.importReference || window.aivideo?.assets?.importReference;

      if (imageFiles.length > 0) {
        for (let idx = 0; idx < imageFiles.length; idx++) {
          const item = imageFiles[idx];
          const key = (item.assetId || item.name) + '_' + item.size;
          if (item.assetId) {
            uploadMap.set(key, item.assetId);
            continue;
          }
          if (importBridge && item.file) {
            setUploadStatus(\`Nạp ảnh \${idx + 1}/\${imageFiles.length}: \${item.name}...\`);
            try {
              const dataUrl = await fileToDataUrl(item.file);
              const assetRes = await importBridge({
                name: item.name,
                mimeType: item.type || "image/png",
                dataUrl: dataUrl
              });
              if (assetRes && (assetRes.id || assetRes.assetId)) {
                uploadMap.set(key, assetRes.id || assetRes.assetId);
              }
            } catch (err) {
              console.warn("Could not import asset:", item.name, err);
            }
          }
        }
      }

      const payload = d.map((pText, idx) => {
        const sceneNum = idx + 1;
        const matchedImg = getMatchedImageForScene(idx, pText);
        let refIds = [];
        if (matchedImg) {
          const key = (matchedImg.assetId || matchedImg.name) + '_' + matchedImg.size;
          const aid = uploadMap.get(key) || matchedImg.assetId;
          if (aid) refIds.push(aid);
        }
        return {
          prompt: pText,
          referenceAssetIds: refIds,
          sceneName: \`Cảnh \${sceneNum}\`
        };
      });

      a(payload);
      o("");
      setImageFiles([]);
      setCustomOverrides({});
      n(!1);
    } catch (err) {
      console.error("Error during importPrompt:", err);
      a(d);
      n(!1);
    } finally {
      setIsUploading(!1);
      setUploadStatus("");
    }
  };

  const N=s(r==="video"?"importPrompt.modalTitleVideo":r==="tts"?"importPrompt.modalTitleTts":"importPrompt.modalTitleImage");
  const p=r==="tts"?s("importPrompt.foundScriptsCount",{count:d.length}):s("importPrompt.foundPromptsCount",{count:d.length});
  const v=r==="tts"?s("importPrompt.importActionTts",{count:d.length}):s("importPrompt.importAction",{count:d.length});

  return e.jsx($,{open:t,onOpenChange:n,children:e.jsxs(O,{children:[
    e.jsx(Z,{className:"fixed inset-0 z-[var(--layer-dialog-overlay)] bg-black/85 backdrop-blur-md transition-opacity",onClick:()=>n(!1)}),
    e.jsxs(Q,{
      className:"fixed left-1/2 top-1/2 z-[var(--layer-dialog)] flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#16122d] text-text-primary shadow-[0_25px_90px_rgba(0,0,0,0.92)] outline-none",
      style:{height:"88vh",maxHeight:"88vh",width:"95vw",maxWidth:"1380px",display:"flex",flexDirection:"column",overflow:"hidden"},
      children:[
        // 1. PINNED HEADER WITH UNMISSABLE CLOSE BUTTON
        e.jsxs("header",{className:"flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#241d47] via-[#1f193d] to-[#241d47] px-6 backdrop-blur-xl select-none",children:[
          e.jsxs("div",{className:"flex min-w-0 items-center gap-3",children:[
            e.jsx("div",{className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#a3e635]/35 bg-[#a3e635]/15 text-[#d9f99d] shadow-[0_0_12px_rgba(163,230,53,0.2)]",children:e.jsx(T,{size:18,strokeWidth:2.4})}),
            e.jsxs("div",{className:"min-w-0",children:[
              e.jsx(U,{className:"truncate text-sm font-black text-white sm:text-base tracking-wide",children:N||"NHẬP DANH SÁCH PROMPT & ẢNH THAM CHIẾU HÀNG LOẠT"}),
              e.jsx(ee,{className:"truncate text-[11px] font-medium text-slate-300",children:r==="video"?"Tự động phân cảnh 1, 2, 3... & ghép ảnh tham chiếu chuẩn từng cảnh":s("importPrompt.modalDesc")})
            ]})
          ]}),
          // NÚT ĐÓNG TO RÕ RÀNG
          e.jsx("button",{
            type:"button",
            onClick:()=>n(!1),
            "aria-label":"Đóng",
            title:"Đóng cửa sổ (Esc)",
            className:"flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 text-xs font-bold text-slate-200 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-white active:scale-95 shadow-sm",
            children:[
              e.jsx(B,{size:16,strokeWidth:2.5,className:"text-red-400"}),
              e.jsx("span",{className:"font-bold",children:"Đóng"})
            ]
          })
        ]}),

        // 2. MAIN 2-COLUMN BODY (STRICT HEIGHT WITH INDEPENDENT SCROLLING)
        e.jsxs("div",{
          className:"grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-2",
          style:{minHeight:0,flex:"1 1 0%",height:"calc(88vh - 112px)"},
          children:[
            // LEFT COLUMN: Prompts Input & Image Reference
            e.jsxs("div",{
              className:"flex min-h-0 flex-col overflow-y-auto border-b border-white/10 bg-[#141028] p-4 md:border-b-0 md:border-r [scrollbar-gutter:stable]",
              style:{minHeight:0,overflowY:"auto",height:"100%"},
              children:[
                // Section 1: Prompts Input
                e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-2",children:[
                  e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-black tracking-wide uppercase text-slate-200",children:[
                    e.jsx(R,{size:15,className:"text-[#a3e635]"}),
                    e.jsx("span",{children:"1. " + s("importPrompt.rawInputLabel")})
                  ]}),
                  e.jsxs("div",{className:"flex items-center gap-1.5",children:[
                    e.jsxs("button",{type:"button",onClick:u,className:"inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 text-[11px] font-bold text-slate-200 shadow-sm transition-all hover:border-[#a3e635]/40 hover:bg-[#a3e635]/15 hover:text-[#d9f99d] active:scale-95",children:[e.jsx(te,{size:12,className:"text-[#a3e635]"}),s("importPrompt.pasteClipboard")]}),
                    e.jsxs("button",{type:"button",onClick:P,className:"inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 text-[11px] font-bold text-slate-200 shadow-sm transition-all hover:border-purple-400/40 hover:bg-purple-500/20 hover:text-purple-200 active:scale-95",children:[e.jsx(F,{size:12,className:"text-purple-300"}),s("importPrompt.loadSample")]}),
                    i&&e.jsx("button",{type:"button",onClick:b,className:"inline-flex h-7.5 cursor-pointer items-center gap-1 rounded-lg border border-red-500/25 bg-red-500/10 px-2 text-[11px] font-bold text-red-400 shadow-sm transition-all hover:bg-red-500/20 active:scale-95",title:s("importPrompt.clearAll"),children:e.jsx(re,{size:12})})
                  ]})
                ]}),

                // Textarea Box
                e.jsxs("div",{className:"relative flex h-[160px] shrink-0 flex-col overflow-hidden rounded-xl border border-white/12 bg-[#0e0a20] shadow-inner focus-within:border-[#a3e635]/50 focus-within:ring-2 focus-within:ring-[#a3e635]/20",children:[
                  e.jsx("textarea",{value:i,onChange:c=>o(c.target.value),placeholder:"Dán danh sách prompt vào đây (mỗi prompt một dòng hoặc cách nhau bởi 2 lần Enter)...\\n\\nVí dụ:\\nCảnh 1: Tạo con mèo đang nằm sưởi nắng\\nCảnh 2: Tạo con chó đang chạy trên đồng cỏ\\nCảnh 3: Tạo con hổ dũng mãnh trong rừng sâu...",autoFocus:!0,className:"flex-1 w-full resize-none border-0 bg-transparent p-3 font-sans text-xs leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none"}),
                  e.jsxs("div",{className:"flex h-7 shrink-0 items-center justify-between border-t border-white/8 bg-[#181330] px-3 text-[10.5px] font-mono text-slate-400 select-none",children:[
                    e.jsx("span",{children:s("importPrompt.charLineStats",{chars:m,lines:x})}),
                    e.jsx("span",{className:"font-sans font-medium text-slate-400",children:"Tự động phân cảnh 1, 2, 3..."})
                  ]})
                ]}),

                // Section 2: Batch Reference Images (Only in Video Studio)
                r==="video"&&e.jsxs("div",{className:"mt-3 flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-[#1a1438]/80 p-3.5 shadow-md",children:[
                  e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2",children:[
                    e.jsxs("div",{className:"flex items-center gap-1.5 text-xs font-black tracking-wide uppercase text-slate-200",children:[
                      e.jsx("span",{className:"text-sm",children:"🖼️"}),
                      e.jsx("span",{children:"2. Ảnh Tham Chiếu Hàng Loạt"}),
                      imageFiles.length>0&&e.jsxs("span",{className:"ml-1 rounded-full bg-[#a3e635]/20 px-2 py-0.5 text-[10.5px] font-bold text-[#d9f99d]",children:[imageFiles.length," ảnh"]})
                    ]}),

                    // 3-Mode Selector Buttons
                    e.jsxs("div",{className:"flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10 text-[10.5px]",children:[
                      e.jsx("button",{type:"button",onClick:()=>setMatchMode("name"),className:\`rounded-lg px-2 py-0.5 font-bold transition-all \${matchMode==="name"?"bg-[#a3e635] text-black shadow-sm":"text-slate-300 hover:text-white"}\`,title:"Khớp theo số thứ tự cảnh hoặc tên nhân vật trong prompt",children:"🎯 Theo tên cảnh"}),
                      e.jsx("button",{type:"button",onClick:()=>setMatchMode("oneToOne"),className:\`rounded-lg px-2 py-0.5 font-bold transition-all \${matchMode==="oneToOne"?"bg-[#a3e635] text-black shadow-sm":"text-slate-300 hover:text-white"}\`,title:"Ảnh 1 ➡️ Cảnh 1, Ảnh 2 ➡️ Cảnh 2 theo thứ tự đưa vào",children:"🔗 1 - 1"}),
                      e.jsx("button",{type:"button",onClick:()=>setMatchMode("allOne"),className:\`rounded-lg px-2 py-0.5 font-bold transition-all \${matchMode==="allOne"?"bg-[#a3e635] text-black shadow-sm":"text-slate-300 hover:text-white"}\`,title:"Dùng ảnh đầu tiên cho tất cả các cảnh",children:"👤 1 cho tất cả"})
                    ]})
                  ]}),

                  // Source Selection Tabs
                  e.jsxs("div",{className:"flex items-center gap-1.5",children:[
                    e.jsxs("button",{type:"button",onClick:()=>setActiveSourceTab("computer"),className:\`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer \${activeSourceTab==="computer"?"border-white/30 bg-white/15 text-white shadow-sm":"border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"}\`,children:[
                      "📁 Tải từ máy tính"
                    ]}),
                    e.jsxs("button",{type:"button",onClick:()=>setActiveSourceTab("tool"),className:\`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg border text-[11px] font-black transition-all cursor-pointer \${activeSourceTab==="tool"?"border-[#a3e635] bg-[#a3e635]/20 text-[#d9f99d] shadow-[0_0_12px_rgba(163,230,53,0.2)]":"border-[#a3e635]/30 bg-[#a3e635]/5 text-slate-300 hover:text-white hover:bg-[#a3e635]/10"}\`,children:[
                      "🖼️ Thư viện Tool (", availableToolAssets.length, ")"
                    ]})
                  ]}),

                  // Computer Upload Box
                  activeSourceTab==="computer"?e.jsxs("div",{onDragOver:onDragOver,onDrop:onDropImages,className:"group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-black/25 p-3 text-center transition-all hover:border-[#a3e635]/50 hover:bg-[#a3e635]/5",children:[
                    e.jsx("input",{type:"file",multiple:!0,accept:"image/*",id:"aiforge-batch-ref-input",onChange:ev=>handleAddFiles(ev.target.files),className:"absolute inset-0 cursor-pointer opacity-0 z-10"}),
                    e.jsx("div",{className:"mb-0.5 text-xl group-hover:scale-110 transition-transform",children:"📂"}),
                    e.jsx("div",{className:"text-[11px] font-bold text-slate-200",children:"Kéo thả danh sách ảnh vào đây (hoặc click để chọn từ máy tính)"}),
                    e.jsx("div",{className:"text-[10px] text-slate-400",children:"Đặt tên: 1.png, 2.png, canh1.png hoặc Nam.png, Lan.png..."})
                  ]}):e.jsxs("div",{className:"rounded-xl border border-white/15 bg-black/35 p-2 flex flex-col gap-1.5 shadow-inner",children:[
                    e.jsxs("div",{className:"flex items-center justify-between gap-2 px-1",children:[
                      e.jsxs("span",{className:"text-[10.5px] font-bold text-slate-200",children:[
                        "Kho ảnh trong Tool (", availableToolAssets.length, "):"
                      ]}),
                      e.jsxs("div",{className:"flex items-center gap-1",children:[
                        availableToolAssets.length>0&&e.jsx("button",{type:"button",onClick:()=>handleAddToolAssets(availableToolAssets),className:"rounded border border-[#a3e635]/50 bg-[#a3e635]/20 px-2 py-0.5 text-[9.5px] font-black text-[#d9f99d] hover:bg-[#a3e635]/30 cursor-pointer transition-all",children:"⚡ Nạp tất cả"}),
                        imageFiles.some(f=>f.isToolAsset)&&e.jsx("button",{type:"button",onClick:()=>setImageFiles(prev=>prev.filter(f=>!f.isToolAsset)),className:"rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9.5px] font-medium text-red-300 hover:bg-red-500/20 cursor-pointer transition-all",children:"Bỏ ảnh tool"})
                      ]})
                    ]}),
                    availableToolAssets.length===0?e.jsxs("div",{className:"flex h-16 flex-col items-center justify-center text-center text-slate-400",children:[
                      e.jsx("span",{className:"text-[11px] font-semibold text-slate-300",children:"Chưa có ảnh nào trong tool"}),
                      e.jsx("span",{className:"text-[9.5px] text-slate-400",children:"Hãy tạo ảnh trong Studio Ảnh AI trước."})
                    ]}):e.jsx("div",{className:"flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]",children:availableToolAssets.map((asset,aIdx)=>{
                      const isAdded=imageFiles.some(f=>f.assetId===asset.id);
                      const sceneMatch=asset.name?.match(/^(c[aả]nh|scene)\\s*\\d+/i)||asset.sceneName;
                      return e.jsxs("div",{key:asset.id,onClick:()=>{
                        if(isAdded){
                          setImageFiles(prev=>prev.filter(f=>f.assetId!==asset.id));
                        }else{
                          handleAddToolAssets([asset]);
                        }
                      },className:\`group relative flex h-18 w-20 shrink-0 flex-col overflow-hidden rounded-lg border transition-all cursor-pointer \${isAdded?"border-[#a3e635] ring-2 ring-[#a3e635]/50 bg-[#a3e635]/15":"border-white/15 bg-black/50 hover:border-white/40"}\`,children:[
                        e.jsx("img",{src:asset.thumbnailUrl||asset.url,alt:asset.name||"Asset",className:"h-12 w-full object-cover"}),
                        e.jsx("div",{className:\`absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8.5px] font-black \${isAdded?"bg-[#a3e635] text-black":"bg-black/70 text-white/50 border border-white/20"}\`,children:isAdded?"✓":"+"}),
                        sceneMatch&&e.jsx("div",{className:"absolute top-0.5 left-0.5 rounded bg-[#a3e635] px-1 text-[7.5px] font-black text-black",children:asset.sceneName||sceneMatch[0]}),
                        e.jsx("span",{className:\`truncate px-1 text-[8px] font-bold text-center \${isAdded?"text-[#d9f99d] bg-black/80":"text-slate-300 bg-black/60"}\`,title:asset.name,children:asset.name||("Ảnh "+(aIdx+1))})
                      ]});
                    })})
                  ]}),

                  // Loaded Image Thumbnails Strip
                  imageFiles.length>0&&e.jsxs("div",{className:"space-y-1",children:[
                    e.jsxs("div",{className:"flex items-center justify-between text-[10.5px] text-slate-400",children:[
                      e.jsxs("span",{children:["Đã nạp ",imageFiles.length," ảnh tham chiếu:"]}),
                      e.jsx("button",{type:"button",onClick:()=>setImageFiles([]),className:"text-red-400 hover:underline cursor-pointer text-[10.5px]",children:"Xóa tất cả ảnh"})
                    ]}),
                    e.jsx("div",{className:"flex w-full gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]",children:imageFiles.map((img,fIdx)=>e.jsxs("div",{key:img.name+'_'+fIdx,className:"relative flex h-16 w-20 shrink-0 flex-col overflow-hidden rounded-lg border border-white/15 bg-black/40",children:[
                      e.jsx("img",{src:img.previewUrl,alt:img.name,className:"h-11 w-full object-cover"}),
                      e.jsx("div",{className:"truncate px-1 text-[8.5px] font-mono text-slate-300",title:img.name,children:img.name}),
                      e.jsxs("span",{className:"absolute top-0.5 left-0.5 rounded bg-black/75 px-1 text-[8px] font-black text-[#a3e635]",children:['#',fIdx+1]}),
                      e.jsx("button",{type:"button",onClick:()=>setImageFiles(prev=>prev.filter((_,idx)=>idx!==fIdx)),className:"absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600/80 text-[9px] text-white hover:bg-red-500",children:"×"})
                    ]}))})
                  ]})
                ]})
              ]
            }),

            // RIGHT COLUMN: SCENE PREVIEW LIST (ONLY SHOWS FEW SCENES, SCROLLABLE BY MOUSE WHEEL)
            e.jsxs("div",{
              className:"flex min-h-0 flex-col bg-[#1d183d]/95 p-4",
              style:{minHeight:0,height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"},
              children:[
                // Header with Scene Count & Mouse Wheel Hint
                e.jsxs("div",{className:"mb-2.5 flex shrink-0 items-center justify-between gap-2 border-b border-white/10 pb-2 select-none",children:[
                  e.jsxs("div",{className:"flex items-center gap-2",children:[
                    e.jsx("span",{className:"text-xs font-black tracking-wide uppercase text-slate-100",children:"DANH SÁCH PHÂN CẢNH"}),
                    d.length>0&&e.jsxs("span",{className:"inline-flex items-center rounded-full border border-[#a3e635]/45 bg-[#a3e635]/20 px-2.5 py-0.5 text-xs font-black text-[#d9f99d] shadow-[0_0_10px_rgba(163,230,53,0.2)]",children:[d.length," cảnh"]})
                  ]}),
                  d.length>3&&e.jsxs("div",{className:"flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/8",children:[
                    e.jsx("span",{children:"↕ Cuộn chuột xem tiếp ("}),
                    e.jsx("span",{className:"font-bold text-[#d9f99d]",children:d.length}),
                    e.jsx("span",{children:" cảnh)"})
                  ]})
                ]}),

                // SCROLLABLE LIST OF SCENE CARDS: Mouse wheel scrolls smoothly through scenes
                d.length>0?e.jsx("div",{
                  className:"flex-1 min-h-0 overflow-y-auto space-y-2.5 pr-1.5 [scrollbar-gutter:stable]",
                  style:{minHeight:0,flex:"1 1 0%",overflowY:"auto",maxHeight:"100%"},
                  children:d.map((c,l)=>{
                    const sceneNum = l + 1;
                    const matchedImg = getMatchedImageForScene(l, c);

                    return e.jsxs("div",{
                      key:l,
                      className:"group relative flex flex-col rounded-xl border border-white/10 bg-[#251f47]/85 p-3 shadow-md transition-all hover:bg-[#2c2454] hover:border-[#a3e635]/40 shrink-0",
                      children:[
                        // Card Header: Cảnh X + Match Badge + Delete Button
                        e.jsxs("div",{className:"mb-2 flex items-center justify-between gap-2 border-b border-white/8 pb-1.5",children:[
                          e.jsxs("div",{className:"flex items-center gap-2 min-w-0",children:[
                            e.jsxs("span",{className:"flex h-5 shrink-0 items-center rounded-md border border-[#a3e635]/40 bg-[#a3e635]/20 px-2 text-[11px] font-black text-[#d9f99d]",children:[
                              "Cảnh ", sceneNum
                            ]}),
                            matchedImg?e.jsxs("span",{className:"inline-flex min-w-0 items-center gap-1 rounded-md border border-sky-400/40 bg-sky-500/15 px-2 py-0.5 text-[10.5px] font-semibold text-sky-200",children:[
                              e.jsx("span",{children:"🖼️"}),
                              e.jsx("span",{className:"truncate max-w-[140px]",title:matchedImg.name,children:matchedImg.name})
                            ]}):e.jsx("span",{className:"rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-400 font-mono",children:"Text Only (Không tham chiếu)"})
                          ]}),
                          e.jsx("button",{
                            type:"button",
                            onClick:()=>w(l),
                            title:"Xóa phân cảnh này",
                            className:"flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-500/20 hover:text-red-400",
                            children:e.jsx(W,{size:13})
                          })
                        ]}),

                        // Card Body: Thumbnail & Prompt text
                        e.jsxs("div",{className:"flex gap-2.5 items-start",children:[
                          matchedImg&&e.jsxs("div",{className:"relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 shadow-sm",children:[
                            e.jsx("img",{src:matchedImg.previewUrl,alt:matchedImg.name,className:"h-full w-full object-cover"}),
                            e.jsx("button",{type:"button",onClick:()=>setCustomOverrides(prev=>({...prev,[l]:null})),title:"Bỏ ảnh tham chiếu cho cảnh này",className:"absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-[10px] text-red-300 hover:text-white hover:bg-red-600 cursor-pointer transition-colors",children:"×"})
                          ]}),
                          e.jsx("p",{className:"flex-1 line-clamp-3 text-xs leading-relaxed text-slate-100 select-text font-normal break-words",children:c})
                        ]})
                      ]
                    });
                  })
                }):e.jsxs("div",{className:"flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-[#15112a]/50 p-6 text-center",children:[
                  e.jsx("div",{className:"mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#251f47] text-purple-300 shadow-md",children:e.jsx(R,{size:24})}),
                  e.jsx("h4",{className:"text-sm font-bold text-white",children:"Chưa có phân cảnh nào"}),
                  e.jsx("p",{className:"mt-1 max-w-xs text-xs leading-relaxed text-slate-300",children:"Nhập hoặc dán danh sách prompt ở cột bên trái để hệ thống tự động phân cảnh và ghép ảnh tham chiếu."})
                ]})
              ]
            })
          ]
        }),

        // 3. PINNED FOOTER (ALWAYS VISIBLE AT THE BOTTOM)
        e.jsxs("footer",{className:"flex h-14 shrink-0 items-center justify-between border-t border-white/10 bg-gradient-to-r from-[#241d47] via-[#1f193d] to-[#241d47] px-6 backdrop-blur-xl select-none",children:[
          e.jsxs("div",{className:"hidden sm:flex items-center gap-2 text-xs font-medium text-slate-300",children:[
            e.jsx(F,{size:15,className:"text-[#a3e635] shrink-0"}),
            e.jsx("span",{children:isUploading?uploadStatus:"Sẵn sàng. Bấm nút màu xanh để nạp ảnh & tạo toàn bộ phân cảnh."})
          ]}),
          e.jsxs("div",{className:"flex items-center gap-3 ml-auto",children:[
            e.jsx("button",{type:"button",disabled:isUploading,onClick:()=>n(!1),className:"inline-flex h-9 cursor-pointer items-center rounded-xl border border-white/12 bg-white/[0.06] px-4 text-xs font-bold text-slate-200 shadow-sm transition-all hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50",children:s("common.cancel")||"Hủy bỏ"}),
            e.jsxs("button",{type:"button",disabled:d.length===0||isUploading,onClick:j,className:"inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-[#a3e635] px-5 text-xs font-black text-[#06040c] shadow-[0_0_18px_rgba(163,230,53,0.3)] transition-all hover:bg-[#b7f245] hover:shadow-[0_0_25px_rgba(163,230,53,0.5)] hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none",children:[
              e.jsx(T,{size:15,strokeWidth:2.6}),
              isUploading?"Đang nạp ảnh & tạo phân cảnh...":(v||"Nhập " + d.length + " phân cảnh")
            ]})
          ]})
        ]})
      ]
    })
  ]})
}`;

// Verify syntax of upgradedSe with Acorn
console.log('Testing Acorn parse of upgradedSe...');
try {
  acorn.parse(upgradedSe, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ upgradedSe is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in upgradedSe:', err.message);
  process.exit(1);
}

// Replace in code
code = code.substring(0, sIdx) + upgradedSe + '\n' + code.substring(eIdx);

fs.writeFileSync(sfbPath, code, 'utf8');
console.log('✓ Successfully wrote upgraded Se component to StudioFailedBulkActions-Zv2NpUPy.js!');
