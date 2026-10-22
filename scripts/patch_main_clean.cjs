const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainPath, 'utf8');

// 1. Thêm phương thức editAndMergeVideos vào AssetStore
const methodAnchor = 'finally{try{await We(u)}catch{}try{await Rr(l),await We(l)}catch{}}}async importReference(e){';
if (!code.includes(methodAnchor)) {
  console.error('ERROR: methodAnchor not found in main/index.js');
  process.exit(1);
}

const editAndMergeVideosMethod = `finally{try{await We(u)}catch{}try{await Rr(l),await We(l)}catch{}}}async editAndMergeVideos(e,t="none",o={}){const{signal:n}=o;if(F(n),!Array.isArray(e)||e.length===0)throw new Error("No video clips provided to edit and merge");const s=e.map(w=>typeof w=="string"?{assetId:w}:(w&&typeof w=="object"?{assetId:w.assetId||w.id,startTime:Number(w.startTime)||0,endTime:w.endTime!==void 0&&w.endTime!==null&&w.endTime!==""?Number(w.endTime):null}:null)).filter(w=>w&&w.assetId);if(s.length===0)throw new Error("No valid clips provided");const hasCustomTrim=s.some(w=>w.startTime>0||w.endTime!==null);if(!hasCustomTrim&&!o.aspectRatio)return await this.mergeVideos(s.map(w=>w.assetId),t,o);const a=await oa(n);await lt(this.filesDir,{recursive:!0});const createdTemps=[];try{const clipPaths=[];for(const w of s){F(n);const v=this.getAsset(w.assetId);if(!v)throw new m("PROVIDER_REJECTED","Missing reference asset "+w.assetId);if(v.type!=="video")throw new Error("Asset "+w.assetId+" is not a video file");if(w.startTime>0||w.endTime!==null){const y=N(this.filesDir,"temp_trim_"+M()+".mp4"),E=["-hide_banner","-loglevel","error"];if(w.startTime>0)E.push("-ss",String(w.startTime));if(w.endTime!==null&&w.endTime>w.startTime)E.push("-to",String(w.endTime));E.push("-i",v.localPath,"-c:v","libx264","-c:a","aac","-preset","fast","-crf","22","-avoid_negative_ts","make_zero","-y",y);await fr(a,E,Pt,n);createdTemps.push(y);clipPaths.push(y)}else{clipPaths.push(v.localPath)}}F(n);const probes=await Promise.all(clipPaths.map(w=>bo(a,w,n)));let c=Math.max(2,Math.floor(probes[0].width/2)*2),d=Math.max(2,Math.floor(probes[0].height/2)*2);if(o.aspectRatio==="16:9"){c=1920;d=1080}else if(o.aspectRatio==="9:16"){c=1080;d=1920}else if(o.aspectRatio==="1:1"){c=1080;d=1080}const l=N(this.filesDir,"merge_video_temp_"+M()+".mp4");try{const g=clipPaths.flatMap(w=>["-i",w]),p=[];if(probes.forEach((w,v)=>{p.push(\`[\${v}:v]scale=\${c}:\${d}:force_original_aspect_ratio=decrease,pad=\${c}:\${d}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,settb=AVTB,setpts=PTS-STARTPTS[v\${v}]\`);w.hasAudio?p.push(\`[\${v}:a]aresample=48000,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,asetpts=PTS-STARTPTS[a\${v}]\`):p.push(\`anullsrc=channel_layout=stereo:sample_rate=48000,atrim=duration=\${w.duration.toFixed(3)},asetpts=PTS-STARTPTS[a\${v}]\`)}),t==="none"||clipPaths.length===1){const w=probes.map((v,y)=>\`[v\${y}][a\${y}]\`).join("");p.push(\`\${w}concat=n=\${clipPaths.length}:v=1:a=1[vout][aout]\`)}else{let w="v0",v="a0",y=probes[0].duration;for(let E=1;E<probes.length;E+=1){const k=Math.max(.05,Math.min(.5,probes[E-1].duration/2,probes[E].duration/2)),R=Math.max(0,y-k),P=E===probes.length-1?"vout":\`vx\${E}\`,J=E===probes.length-1?"aout":\`ax\${E}\`;p.push(\`[\${w}][v\${E}]xfade=transition=\${t}:duration=\${k.toFixed(3)}:offset=\${R.toFixed(3)}[\${P}]\`);p.push(\`[\${v}][a\${E}]acrossfade=d=\${k.toFixed(3)}:c1=tri:c2=tri[\${J}]\`);w=P;v=J;y+=probes[E].duration-k}}g.push("-filter_complex",p.join(";"));g.push("-map","[vout]","-map","[aout]");g.push("-c:v","libx264","-preset","veryfast","-crf","21","-pix_fmt","yuv420p");g.push("-c:a","aac","-b:a","192k","-ar","48000","-movflags","+faststart");g.push("-y",l);await fr(a,g,Pt,n);const bytes=await ke(l,{signal:n});F(n);return await this.writeAsset({id:M(),name:"merged_video.mp4",type:"video",role:"generated",mimeType:"video/mp4",bytes:bytes,ratio:Mg(c,d),createdAt:new Date().toISOString()},{signal:n})}finally{try{await Rr(l),await We(l)}catch{}}}finally{for(const tempFile of createdTemps){try{await We(tempFile)}catch{}}}}async importReference(e){`;

code = code.replace(methodAnchor, editAndMergeVideosMethod);

// 2. Thêm IPC Handler assets:editAndMergeVideos
const ipcAnchor = 'const s=Ew.includes(t)?t:"none";return await $.mergeVideos(e.filter(a=>typeof a=="string"&&a.trim()),s,{signal:n?.controller.signal})}finally{ct.finish(n)}})';
if (!code.includes(ipcAnchor)) {
  console.error('ERROR: ipcAnchor not found in main/index.js');
  process.exit(1);
}

const ipcReplacement = `const s=Ew.includes(t)?t:"none";return await $.mergeVideos(e.filter(a=>typeof a=="string"&&a.trim()),s,{signal:n?.controller.signal})}finally{ct.finish(n)}}),S.handle("assets:editAndMergeVideos",async(r,e,t,o)=>{if(A(r),!Array.isArray(e))throw new Error("clips must be an array");const n=ct.begin(qa(o));try{F(n?.controller.signal);return await $.editAndMergeVideos(e,t||"none",{...o,signal:n?.controller.signal})}finally{ct.finish(n)}})`;

code = code.replace(ipcAnchor, ipcReplacement);

fs.writeFileSync(mainPath, code, 'utf8');
console.log('Main patched successfully with clean custom editAndMergeVideos!');
