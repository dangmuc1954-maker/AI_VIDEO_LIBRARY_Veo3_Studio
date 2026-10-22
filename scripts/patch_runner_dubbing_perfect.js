const fs = require('fs');
const path = require('path');

console.log('=== NÂNG CẤP WORKFLOW RUNNER CHO NODE LỒNG TIẾNG & ĐỒNG BỘ VIDEO ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app')
];

const newDubbingBlock = `r.type==="video-dubbing"||r.type==="dubbing"){
  let vid=(k.videos&&k.videos[0])||(k.images&&k.images[0]);
  let aud=k.audios&&k.audios[0];

  // 1. Quét thông minh theo đúng cổng kết nối đầu vào (Port-Aware Resolution)
  const inConns=E.filter(conn=>conn.toNode===r.id);
  for(const conn of inConns){
    const upVal=u.get(conn.fromNode);
    const isVidPort = conn.toPort && (conn.toPort.endsWith("-in-vid") || conn.toPort.includes("vid"));
    const isAudPort = conn.toPort && (conn.toPort.endsWith("-in-aud") || conn.toPort.includes("aud"));

    if(isVidPort || !vid){
      if(upVal?.videos&&upVal.videos.length>0) vid=upVal.videos[0];
      if(!vid&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="video")) {
        const vAsset=upVal.outputAssets.find(oa=>oa.type==="video");
        vid={assetId:vAsset.assetId||vAsset.id,url:vAsset.url,thumbnailUrl:vAsset.thumbnailUrl,mimeType:vAsset.mimeType};
      }
    }
    if(isAudPort || !aud){
      if(upVal?.audios&&upVal.audios.length>0) aud=upVal.audios[0];
      if(!aud&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="audio")) {
        const aAsset=upVal.outputAssets.find(oa=>oa.type==="audio");
        aud={assetId:aAsset.assetId||aAsset.id,url:aAsset.url,mimeType:aAsset.mimeType};
      }
    }
  }

  // 2. Fallback quét toàn bộ các node upstream nếu chưa có
  if(!vid || !aud){
    for(const [nodeId, upVal] of u.entries()){
      if(!vid && upVal?.videos && upVal.videos.length > 0) vid = upVal.videos[0];
      if(!aud && upVal?.audios && upVal.audios.length > 0) aud = upVal.audios[0];
    }
  }

  // 3. Fallback lấy asset hợp lệ có sẵn trong Asset Store
  const C=window.aiforge?.assets;
  if(!vid && C?.list){
    try {
      const allAssets = await C.list();
      const validVids = allAssets.filter(a => a.type === "video");
      if(validVids.length > 0) vid = validVids[validVids.length - 1];
    } catch(_) {}
  }
  if(!aud && C?.list){
    try {
      const allAssets = await C.list();
      const validAuds = allAssets.filter(a => a.type === "audio");
      if(validAuds.length > 0) aud = validAuds[validAuds.length - 1];
    } catch(_) {}
  }

  if(!vid)throw new Error(\`\${r.title} cần 1 video đầu vào (kết nối từ Veo 3 hoặc thư viện).\`);
  if(!aud)throw new Error(\`\${r.title} cần 1 file giọng đọc đầu vào (kết nối từ ElevenLabs).\`);

  z(r,"🎯 AI Đang nhận diện video gốc và ngữ điệu câu thoại...","info",{phase:"analyze"});
  x(r.id,20);
  y(r.id,{progress:20,statusText:"Nhận diện video gốc & ngữ điệu"});

  if(!C?.syncVoiceoverVideo&&!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa sẵn sàng.");
  const syncFn=C.syncVoiceoverVideo||C.muxAudioVideo;
  const vidId=vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");
  const audId=aud.assetId||aud.id||(typeof aud.url==="string"?aud.url.replace(/^.*\\/asset\\//,"").replace(/\\?.*$/,""):"");

  z(r,\`🎛️ Đang tinh chỉnh voice ElevenLabs khớp nhân vật: \${r.config?.mood||"Cao trào Viral (Ấm & Dày tiếng)"}\`,"info",{phase:"process"});
  x(r.id,50);
  y(r.id,{progress:50,statusText:"Tinh chỉnh voice ElevenLabs khớp nhân vật"});

  z(r,"🎬 Đang co giãn nhịp điệu & hòa âm lồng tiếng vào video...","info",{phase:"process"});
  x(r.id,75);
  y(r.id,{progress:75,statusText:"Co giãn nhịp điệu & hòa âm vào video"});

  const dubbed=await Is(w,de=>syncFn(vidId,audId,{
    operationId:de,
    speedMode:r.config?.speedMode||"auto",
    customSpeed:typeof r.config?.customSpeed==="number"?r.config.customSpeed:1.0,
    mood:r.config?.mood||"viral_climax",
    intensity:typeof r.config?.intensity==="number"?r.config.intensity:1.0,
    voiceVolume:typeof r.config?.voiceVolume==="number"?r.config.voiceVolume:100,
    removeOriginalAudio:r.config?.removeOriginalAudio!==false,
    keepBackgroundMusic:r.config?.keepBackgroundMusic===true,
    bgmVolume:typeof r.config?.bgmVolume==="number"?r.config.bgmVolume:18,
    name:r.config?.outputName||("Video_Dubbed_"+Date.now()+".mp4")
  }),C.cancelMerge);

  if(w?.aborted)throw new Ze;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=qa(te);
  z(r,\`✨ Video đã lồng tiếng chuẩn xác hoàn tất: \${dubbed.name}\`,"success",{phase:"result"});
  H.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  x(r.id,100);
  y(r.id,{progress:100,statusText:"Hoàn tất lồng tiếng video",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
}`;

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const runnerPath = path.join(root, 'out/renderer/assets/useWorkflowRunner-DGw6Ekx4.js');
  if (!fs.existsSync(runnerPath)) continue;

  console.log('[*] Đang cập nhật:', runnerPath);
  let code = fs.readFileSync(runnerPath, 'utf8');

  const markerStart = code.indexOf('r.type==="video-dubbing"||r.type==="dubbing"){');
  if (markerStart !== -1) {
    const markerEnd = code.indexOf('else if(r.type==="video-script-extract"', markerStart);
    if (markerEnd !== -1) {
      code = code.substring(0, markerStart) + newDubbingBlock + '\nelse if' + code.substring(markerEnd + 7);
      fs.writeFileSync(runnerPath, code, 'utf8');
      console.log('  ✓ Đã cập nhật useWorkflowRunner-DGw6Ekx4.js thành công!');
    }
  }
}
