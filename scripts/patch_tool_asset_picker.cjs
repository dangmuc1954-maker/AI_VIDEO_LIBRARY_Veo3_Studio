const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const filePath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Ensure bD as To is imported from ./index-BS7vgKVV.js
if (!code.includes('bD as To')) {
  code = code.replace(
    'import{a4 as E,bL as L,bn as h,b4 as e,X as B,b as V,I as X,l as Y}from"./index-BS7vgKVV.js";',
    'import{a4 as E,bL as L,bn as h,b4 as e,X as B,b as V,I as X,l as Y,bD as To}from"./index-BS7vgKVV.js";'
  );
  console.log('Added bD as To import');
}

// 2. Locate function Se and update its signature and internal state
const seStart = 'function Se({open:t,onOpenChange:n,onImport:a,studioType:r}){';
if (!code.includes(seStart)) {
  console.error('Could not find function Se start!');
  process.exit(1);
}

// Check if already patched
if (code.includes('toolPickerOpen')) {
  console.log('Already has toolPickerOpen, skipping state insertion');
} else {
  const newSeStart = `function Se({open:t,onOpenChange:n,onImport:a,studioType:r,assets:propAssets}){
  const {t:s}=L(),
  [i,o]=h.useState(""),
  [imageFiles,setImageFiles]=h.useState([]),
  [matchMode,setMatchMode]=h.useState("name"),
  [customOverrides,setCustomOverrides]=h.useState({}),
  [isUploading,setIsUploading]=h.useState(!1),
  [uploadStatus,setUploadStatus]=h.useState(""),
  [toolPickerOpen,setToolPickerOpen]=h.useState(!1),
  [toolSearch,setToolSearch]=h.useState(""),
  [toolSourceFilter,setToolSourceFilter]=h.useState("all"),
  [selectedToolIds,setSelectedToolIds]=h.useState([]),
  [liveAssets,setLiveAssets]=h.useState([]),

  storeAssets=(typeof To==="function"?To(st=>st.assets):null)||[],

  // Refresh live assets when modal opens
  _fetchLive=h.useEffect(()=>{
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
  },[t]),

  // Merge and sort all available tool assets
  availableToolAssets=h.useMemo(()=>{
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
  },[propAssets,storeAssets,liveAssets]),

  handleAddToolAssets=(assetsToAdd)=>{
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
  },`;

  code = code.replace(
    seStart + '\n  const {t:s}=L(),\n  [i,o]=h.useState(""),\n  [imageFiles,setImageFiles]=h.useState([]),\n  [matchMode,setMatchMode]=h.useState("name"), // "name" | "oneToOne" | "allOne"\n  [customOverrides,setCustomOverrides]=h.useState({}),\n  [isUploading,setIsUploading]=h.useState(!1),\n  [uploadStatus,setUploadStatus]=h.useState(""),',
    newSeStart
  );
  console.log('Replaced function Se state');
}

// 3. Update import handler j to bypass upload for tool assets (which already have assetId)
const oldJUpload = 'const importBridge = window.aiforge?.assets?.importReference || window.aivideo?.assets?.importReference;\n\n      if (importBridge && imageFiles.length > 0) {\n        for (let idx = 0; idx < imageFiles.length; idx++) {\n          const item = imageFiles[idx];\n          setUploadStatus(`Nạp ảnh ${idx + 1}/${imageFiles.length}: ${item.name}...`);\n          try {\n            const dataUrl = await fileToDataUrl(item.file);\n            const assetRes = await importBridge({\n              name: item.name,\n              mimeType: item.type || "image/png",\n              dataUrl: dataUrl\n            });\n            if (assetRes && (assetRes.id || assetRes.assetId)) {\n              uploadMap.set(item.name + \'_\' + item.size, assetRes.id || assetRes.assetId);\n            }\n          } catch (err) {\n            console.warn("Could not import asset:", item.name, err);\n          }\n        }\n      }';

const newJUpload = `const importBridge = window.aiforge?.assets?.importReference || window.aivideo?.assets?.importReference;

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
      }`;

if (code.includes(oldJUpload)) {
  code = code.replace(oldJUpload, newJUpload);
  console.log('Replaced import handler j upload logic');
}

// 4. Update the aid lookup in j
const oldAid = 'const key = matchedImg.name + \'_\' + matchedImg.size;\n          const aid = uploadMap.get(key);\n          if (aid) refIds.push(aid);';
const newAid = 'const key = (matchedImg.assetId || matchedImg.name) + \'_\' + matchedImg.size;\n          const aid = uploadMap.get(key) || matchedImg.assetId;\n          if (aid) refIds.push(aid);';

if (code.includes(oldAid)) {
  code = code.replace(oldAid, newAid);
  console.log('Replaced aid lookup in j');
}

fs.writeFileSync(filePath, code, 'utf8');
console.log('Written base updates');

// Verify syntax so far
execSync(`node --check "${filePath}"`);
console.log('✅ Syntax verified!');
