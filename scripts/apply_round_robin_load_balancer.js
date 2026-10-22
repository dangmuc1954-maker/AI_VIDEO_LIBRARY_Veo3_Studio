const fs = require('fs');
const path = require('path');

console.log('=== BẮT ĐẦU ÁP DỤNG CƠ CHẾ ROUND-ROBIN LOAD BALANCER ===');

// 1. PATCH VIDEO STUDIO (app/out/renderer/assets/VideoStudio-frcr8V6s.js)
const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let vsCode = fs.readFileSync(vsPath, 'utf8');

// Patch Co, Po, Mo_muse
const oldCoPo = 'Co=r=>{if(r.account!=="Auto")return Ce.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))},Po=r=>{if(r.account!=="Auto")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))},Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(q&&q!=="auto"){const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);if(matched)return matched}return allMuse[0]||null}';

const newCoPo = 'Co=r=>{const a=String(r.account||"").trim();if(a&&a!=="Auto"&&a!=="Generated account")return Ce.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C),C.accountId].includes(a))},Po=r=>{const a=String(r.account||"").trim();if(a&&a!=="Auto"&&a!=="Generated account")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C),C.accountId].includes(a))},Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(q&&q!=="auto"&&q!=="generated account"){const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);if(matched)return matched}return null}';

if (vsCode.includes(oldCoPo)) {
  vsCode = vsCode.replace(oldCoPo, newCoPo);
  console.log('[1/3] VideoStudio: Đã nâng cấp Co, Po, Mo_muse hỗ trợ normalize Auto & Generated account!');
} else {
  console.log('[1/3] VideoStudio: Co, Po, Mo_muse đã được nâng cấp trước đó.');
}

// Patch St trong VideoStudio để chia đều prompt theo round-robin
const p1_vs = vsCode.indexOf(',St=async r=>{');
const p2_vs = vsCode.indexOf('if(b.length===0){z.error(d[0]');

if (p1_vs !== -1 && p2_vs !== -1 && p2_vs > p1_vs) {
  const oldStBody = vsCode.slice(p1_vs, p2_vs);
  
  const newStBody = `,St=async r=>{
    if(nt.current)return;
    const C=r.filter(v=>v.prompt.trim().length>0);
    if(C.length===0){z.warning(t("videoStudio.videoBlankPromptWarning"));return}
    const ee=Array.from(new Set(C.filter(v=>v.provider!=="Veo3"&&v.provider!=="Grok"&&v.provider!=="Muse AI"&&v.provider!=="muse ai").map(v=>v.provider))),
      ae=C.filter(v=>v.provider==="Veo3"||v.provider==="Grok"||v.provider==="Muse AI"||v.provider==="muse ai");
    if(ae.length===0){z.warning(t("videoStudio.noRuntimeForVideoProviders",{providers:ee.join(", ")||"các prompt đã chọn"}));return}
    const i=ae.some(v=>v.provider==="Veo3"),
      a=ae.some(v=>v.provider==="Grok"),
      m_muse=ae.some(v=>v.provider==="Muse AI"||v.provider==="muse ai"),
      allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];
    if(i&&Ce.length===0){z.warning(t("videoStudio.noVeoAccountInBrowserHub"));return}
    if(a&&Ie.length===0){z.warning(t("videoStudio.noGrokAccountInBrowserHub"));return}
    if(m_muse&&allMuse.length===0){z.warning("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập tài khoản Muse AI.");return}
    
    const d=[],h=new Date().toISOString(),c=\`video-run-\${Date.now()}-\${Math.random().toString(36).slice(2,8)}\`,b=[];
    let museAutoIdx=0,veoAutoIdx=0,grokAutoIdx=0;

    for(const v of ae){
      const isAuto=!v.account||v.account==="Auto"||v.account==="Generated account";
      const ie=(v.referenceAssetIds||[]).flatMap(ve=>{const ot=We.find(Pt=>Pt.id===ve);return ot?[ot]:[]}).filter(ve=>ve.type==="image").map(ve=>ve.id);

      if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){
        let ot=null,isManual=false;
        if(!isAuto){
          ot=Mo_muse(v);
          isManual=!!ot;
          if(!ot){d.push(\`\${v.account} is not ready\`);continue}
        }else if(allMuse.length>0){
          // 🎯 ROUND-ROBIN MUSE AI: Chia đều prompt cho từng tài khoản Muse AI
          ot=allMuse[museAutoIdx%allMuse.length];
          museAutoIdx++;
          isManual=false;
        }
        if(!ot){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}
        const pid="muse";
        for(let Pt=0;Pt<v.count;Pt+=1)b.push({
          promptId:v.id,
          input:{
            title:v.title||v.prompt,
            type:"Video",
            providerId:pid,
            provider:"Muse AI",
            accountId:ot.accountId,
            account:Tt(ot),
            payload:{
              title:v.title||"",
              promptId:v.id,
              prompt:v.prompt,
              ratio:v.ratio||"16:9",
              mode:"Components",
              duration:v.duration||"10s",
              model:"muse-video",
              outputIndex:Pt,
              batchSize:v.count,
              generationRunId:c,
              generationRunCreatedAt:h,
              promptOrder:v.index,
              title:v.sceneName||v.title||("Cảnh "+v.index),
              batchIndex:Pt,
              account:isManual?v.account:(Tt(ot)||"Auto"),
              accountSelection:isManual?"manual":"auto",
              referenceAssetIds:ie.slice(0,6),
              resolutionName:"720p",
              preset:"custom",
              studioSource:"video-studio",
              autoMerge:f
            }
          }
        });
        continue;
      }

      if(v.provider==="Grok"){
        const ve=pt(v.duration);
        if(ie.length>ve){d.push(\`\${v.prompt.slice(0,28)||"Grok prompt"} allows \${ve} reference images for \${v.duration}\`);continue}
        let ot=null,isManual=false;
        if(!isAuto){
          ot=Po(v);
          isManual=!!ot;
          if(!ot){d.push(\`\${v.account} is not ready\`);continue}
        }else if(Ie.length>0){
          // 🎯 ROUND-ROBIN GROK: Chia đều prompt cho từng tài khoản Grok
          ot=Ie[grokAutoIdx%Ie.length];
          grokAutoIdx++;
          isManual=false;
        }
        for(let Pt=0;Pt<v.count;Pt+=1)b.push({
          promptId:v.id,
          input:{
            title:v.title||v.prompt,
            type:"Video",
            providerId:"grok",
            provider:"Grok",
            ...ot?{accountId:ot.accountId,account:Tt(ot)}:{},
            payload:{
              title:v.title||"",
              promptId:v.id,
              prompt:v.prompt,
              ratio:v.ratio,
              mode:"Components",
              duration:v.duration,
              model:"grok-imagine-video",
              outputIndex:Pt,
              batchSize:v.count,
              generationRunId:c,
              generationRunCreatedAt:h,
              promptOrder:v.index,
              title:v.sceneName||v.title||("Cảnh "+v.index),
              batchIndex:Pt,
              account:isManual?v.account:(ot?Tt(ot):"Auto"),
              accountSelection:isManual?"manual":"auto",
              referenceAssetIds:ie.slice(0,ve),
              resolutionName:"720p",
              preset:"custom",
              studioSource:"video-studio",
              autoMerge:f
            }
          }
        });
        continue;
      }

      let he,Ve;
      if(v.mode==="Frames"){
        if(ie.length<1){d.push(\`\${v.prompt.slice(0,28)||"Frame prompt"} needs a start frame\`);continue}
        he=ie.length>=2?"Frames":"I2V";
        const ve=ao(s,v,he);
        if(ie.length>ve){d.push(\`\${v.prompt.slice(0,28)||"Frame prompt"} allows up to \${ve} references\`);continue}
        Ve=ie;
      }else if(he=ie.length>0?"R2V":"T2V",he==="R2V"){
        const ve=ao(s,v,he);
        if(ie.length>ve){d.push(\`\${v.prompt.slice(0,28)||"Reference prompt"} allows up to \${ve} references\`);continue}
        Ve=ie;
      }else Ve=[];

      let $e=null,isManualVeo=false;
      if(!isAuto){
        $e=Co(v);
        isManualVeo=!!$e;
        if(!$e){d.push(\`\${v.account} is not ready\`);continue}
      }else if(Ce.length>0){
        // 🎯 ROUND-ROBIN VEO 3 / GOOGLE FLOW: Chia đều prompt cho từng tài khoản (2 acc -> 50/50, 3 acc -> chia 3)
        $e=Ce[veoAutoIdx%Ce.length];
        veoAutoIdx++;
        isManualVeo=false;
      }

      const ut=fo(s,v.model),
        Ct=v.resolution||(ut?qs(s,ut.id,he,v.duration,v.ratio):"720p"),
        Mo=Mt(v.model,v.duration,Ct,s),
        Yo=Do("upscale_video")&&v.autoUpscale?bo(Ct):void 0;

      for(let ve=0;ve<v.count;ve+=1)b.push({
        promptId:v.id,
        input:{
          title:v.title||v.prompt,
          type:"Video",
          providerId:"veo3",
          provider:"Veo3",
          ...$e?{accountId:$e.accountId,account:Tt($e)}:{},
          payload:{
            title:v.title||"",
            promptId:v.id,
            prompt:v.prompt,
            ratio:v.ratio,
            mode:v.mode,
            flowVideoMode:he,
            duration:v.duration,
            model:v.model,
            resolution:Ct,
            creditCost:Mo,
            creditTotal:Mo,
            promptCreditTotal:Mo*v.count,
            outputIndex:ve,
            batchSize:v.count,
            generationRunId:c,
            generationRunCreatedAt:h,
            promptOrder:v.index,
            title:v.sceneName||v.title||("Cảnh "+v.index),
            batchIndex:ve,
            account:isManualVeo?v.account:($e?Tt($e):"Auto"),
            accountSelection:isManualVeo?"manual":"auto",
            referenceAssetIds:Ve,
            studioSource:"video-studio",
            autoMerge:f,
            ...Yo?{autoUpscale:!0,upscaleTargetResolution:Yo}:{},
            autoRemoveWatermark:Do("remove_watermark_video")&&v.autoRemoveWatermark===!0,
            removeWatermark:Do("remove_watermark_video")&&v.autoRemoveWatermark===!0
          }
        }
      });
    }`;

  vsCode = vsCode.replace(oldStBody, newStBody);
  fs.writeFileSync(vsPath, vsCode, 'utf8');
  console.log('[1/3] VideoStudio: Đã áp dụng thành công bộ chia tải Round-Robin cho Muse AI, Grok & Veo 3!');
}

// 2. PATCH IMAGE STUDIO (app/out/renderer/assets/ImageStudio-4nmpUX3j.js)
const isPath = path.join(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let isCode = fs.readFileSync(isPath, 'utf8');

// Patch Eo helper
const oldEo = 'Eo=t=>{if(t.account!=="Auto")return tr(t.provider).find(d=>[d.accountName,d.accountDisplayName,d.accountEmail,Pr(d)].includes(t.account))}';
const newEo = 'Eo=t=>{const a=String(t.account||"").trim();if(a&&a!=="Auto"&&a!=="Generated account")return tr(t.provider).find(d=>[d.accountName,d.accountDisplayName,d.accountEmail,Pr(d),d.accountId].includes(a))}';

if (isCode.includes(oldEo)) {
  isCode = isCode.replace(oldEo, newEo);
  console.log('[2/3] ImageStudio: Đã nâng cấp Eo helper hỗ trợ Generated account!');
}

// Patch submit loop in ImageStudio
const oldImgSubmit = 'const z=[],Ne=new Date().toISOString(),lt=`image-run-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,oe=[];for(const y of b){const ae=Eo(y),Ge=Ve(y.provider);if(!Ge)continue;if(y.account!=="Auto"&&!ae){z.push(`Account ${y.account} is not ready for ${y.provider}`);continue}';

const newImgSubmit = 'const z=[],Ne=new Date().toISOString(),lt=`image-run-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,oe=[];let autoImgIdx=0;for(const y of b){const isAuto=!y.account||y.account==="Auto"||y.account==="Generated account";let ae=Eo(y);const Ge=Ve(y.provider);if(!Ge)continue;if(!isAuto&&!ae){z.push(`Account ${y.account} is not ready for ${y.provider}`);continue}if(isAuto){const pAccs=tr(y.provider)||[];if(pAccs.length>0){ae=pAccs[autoImgIdx%pAccs.length];autoImgIdx++;}}';

if (isCode.includes(oldImgSubmit)) {
  isCode = isCode.replace(oldImgSubmit, newImgSubmit);
  fs.writeFileSync(isPath, isCode, 'utf8');
  console.log('[2/3] ImageStudio: Đã nâng cấp loop submit ảnh với Round-Robin & sửa lỗi Generated account!');
}

// 3. PATCH MAIN INDEX (app/out/main/index.js)
const mainPath = path.join(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// Patch _B function for Muse AI round-robin
const old_B = 'function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video"||(r.providerId&&r.providerId.startsWith("custom-")))){if(r.accountId)return{accountId:r.accountId,account:r.account};const ms=T.listSessions().find(s=>s.providerId==="muse"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));if(ms)return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}';

const new_B = 'function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video"||(r.providerId&&r.providerId.startsWith("custom-")))){if(r.accountId&&r.payload?.accountSelection==="manual"&&r.account!=="Generated account")return{accountId:r.accountId,account:r.account};const allMuse=T.listSessions().filter(s=>s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));if(allMuse.length>0){global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;const ms=allMuse[(global.__muse_dispatch_counter-1)%allMuse.length];return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}}return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}';

if (mainCode.includes(old_B)) {
  mainCode = mainCode.replace(old_B, new_B);
  fs.writeFileSync(mainPath, mainCode, 'utf8');
  console.log('[3/3] Backend main/index.js: Đã cập nhật _B với Round-Robin cho Muse AI!');
} else {
  console.log('[3/3] Backend main/index.js: Hàm _B đã được cập nhật trước đó.');
}

console.log('=== HOÀN TẤT TOÀN BỘ CÁC BƯỚC PATCH ===');
