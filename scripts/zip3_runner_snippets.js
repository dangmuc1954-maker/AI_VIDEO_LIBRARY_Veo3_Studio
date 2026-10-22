// DUBBING:
else if(r.type==="video-dubbing"||r.type==="dubbing"){
  let vid=(b.videos&&b.videos[0])||(b.images&&b.images[0]);
  let aud=b.audios&&b.audios[0];
  if(!vid||!aud){
    const inConns=E.filter(y=>y.toNode===r.id);
    for(const conn of inConns){
      const upVal=u.get(conn.fromNode);
      if(!vid&&upVal?.videos&&upVal.videos.length>0) vid=upVal.videos[0];
      if(!vid&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="video")) {
        const vAsset=upVal.outputAssets.find(oa=>oa.type==="video");
        vid={assetId:vAsset.assetId||vAsset.id,url:vAsset.url,thumbnailUrl:vAsset.thumbnailUrl,mimeType:vAsset.mimeType};
      }
      if(!aud&&upVal?.audios&&upVal.audios.length>0) aud=upVal.audios[0];
      if(!aud&&upVal?.outputAssets&&upVal.outputAssets.some(oa=>oa.type==="audio")) {
        const aAsset=upVal.outputAssets.find(oa=>oa.type==="audio");
        aud={assetId:aAsset.assetId||aAsset.id,url:aAsset.url,mimeType:aAsset.mimeType};
      }
    }
  }
  if(!vid)throw new Error(`${r.title} cần 1 video đầu vào (từ Veo 3 hoặc thư viện).`);
  if(!aud)throw new Error(`${r.title} cần 1 file âm thanh đầu vào (từ ElevenLabs).`);
  D(r,"AI Đang phân tích nhịp điệu & cao trào để lồng tiếng chuẩn xác...","info",{phase:"analyze"});
  v(r.id,25);
  y(r.id,{progress:25,statusText:"Đang phân tích nhịp điệu & cao trào"});
  const C=window.aiforge?.assets;
  if(!C?.syncVoiceoverVideo&&!C?.muxAudioVideo)throw new Error("Chức năng lồng tiếng video chưa khả dụng trong preload.");
  const syncFn=C.syncVoiceoverVideo||C.muxAudioVideo;
  const vidId=vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\/asset\//,"").replace(/\?.*$/,""):"");
  const audId=aud.assetId||aud.id||(typeof aud.url==="string"?aud.url.replace(/^.*\/asset\//,"").replace(/\?.*$/,""):"");
  v(r.id,50);
  y(r.id,{progress:50,statusText:"Đang xử lý âm thanh & co giãn nhịp điệu"});
  D(r,`Đang áp dụng bộ lọc giọng đọc: ${r.config?.mood||"Cao trào Viral (Ấm & Dày tiếng)"}`,"info",{phase:"process"});

  const dubbed=await yo(m,de=>syncFn(vidId,audId,{
    operationId:de,
    speedMode:r.config?.speedMode||"auto",
    customSpeed:typeof r.config?.customSpeed==="number"?r.config.customSpeed:1.0,
    mood:r.config?.mood||"viral_climax",
    intensity:typeof r.config?.intensity==="number"?r.config.intensity:1.0,
    voiceVolume:typeof r.config?.voiceVolume==="number"?r.config.voiceVolume:100,
    removeOriginalAudio:r.config?.removeOriginalAudio!==false,
    keepBackgroundMusic:r.config?.keepBackgroundMusic===true,
    bgmVolume:typeof r.config?.bgmVolume==="number"?r.config.bgmVolume:15,
    name:r.config?.outputName||("Video_Dubbed_"+Date.now()+".mp4")
  }),C.cancelMerge);

  if(m?.aborted)throw new Qe;
  const te=dubbed.ratio||r.config?.outputAspect||"16:9",ce=Ca(te);
  D(r,`Video đã lồng tiếng hoàn tất với âm thanh sống động: ${dubbed.name}`,"success",{phase:"result"});
  U.videos.push({assetId:dubbed.id,url:dubbed.url,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType});
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Hoàn tất lồng tiếng video",width:ce.width,height:ce.height,config:{...r.config,src:dubbed.url,outputAspect:te,outputAssets:[{type:"video",url:dubbed.url,assetId:dubbed.id,thumbnailUrl:dubbed.thumbnailUrl,mimeType:dubbed.mimeType}]}});
}


// STT:
else if(r.type==="video-script-extract"||r.type==="stt"){
  const vid=(b.videos&&b.videos[0])||(b.images&&b.images[0]);
  if(!vid)throw new Error(`${r.title} cần 1 video đầu vào để chuyển âm thanh sang văn bản.`);
  D(r,"Đang lắng nghe âm thanh video và chuyển thành văn bản chuẩn...","info",{phase:"extract"});
  v(r.id,30);
  y(r.id,{progress:30,statusText:"Đang chuyển âm thanh sang văn bản"});
  const C=window.aiforge?.assets;
  if(!C?.transcribeVideoAudio)throw new Error("Chức năng chuyển âm thanh sang văn bản chưa khả dụng trong preload.");
  const res=await yo(m,de=>C.transcribeVideoAudio(vid.assetId||vid.id||(typeof vid.url==="string"?vid.url.replace(/^.*\/asset\//,"").replace(/\?.*$/,""):""),{operationId:de}),C.cancelMerge);
  if(m?.aborted)throw new Qe;
  const sText=res.script?.trim();
  if(!sText)throw new Error("Không phát hiện được lời thoại trong âm thanh của video.");
  U.text=sText;
  U.texts=[sText];
  U.videos=[vid];
  v(r.id,95);
  y(r.id,{progress:95,statusText:"Đã chuyển âm thanh thành văn bản",config:{...r.config,outputText:sText,duration:res.duration}});
  D(r,`Đã chuyển âm thanh sang văn bản (${res.duration}s): "${sText}"`,"success",{phase:"result"});
}
