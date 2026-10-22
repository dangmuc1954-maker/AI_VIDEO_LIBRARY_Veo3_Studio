const fs = require('fs');

const file = 'app/out/renderer/assets/VideoStudio-frcr8V6s.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Bulletproof Mo_muse
const targetMo = 'Mo_muse=r=>{if(r.account!=="Auto")return museAccounts.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))||activeMuseAccounts.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account));return activeMuseAccounts[0]||museAccounts[0]}';
const replaceMo = 'Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(q&&q!=="auto"){const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);if(matched)return matched}return allMuse[0]||null}';

if (!content.includes(targetMo)) {
  console.error('targetMo not found!');
  process.exit(1);
}
content = content.replace(targetMo, replaceMo);
console.log('✓ Replaced Mo_muse');

// 2. Bulletproof Loop check
const targetLoop = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v);if(v.account!=="Auto"&&!ot){d.push(\`\${v.account} is not ready\`);continue}const pid=(ot&&ot.providerId)?ot.providerId:"muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:pid,provider:"Muse AI",...ot?{accountId:ot.accountId,account:Tt(ot)}:{},payload:{promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"5s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:[],resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}if(v.provider==="Grok"){`;
const replaceLoop = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v)||activeMuseAccounts[0]||museAccounts[0]||(X||[]).find(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")));if(!ot){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}const pid=(ot&&ot.providerId)?ot.providerId:"muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,1),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}if(v.provider==="Grok"){`;

if (!content.includes(targetLoop)) {
  console.error('targetLoop not found!');
  process.exit(1);
}
content = content.replace(targetLoop, replaceLoop);
console.log('✓ Replaced Loop check');

// 3. Relax warning check in St
const targetWarn = 'if(m_muse&&activeMuseAccounts.length===0&&museAccounts.length===0){z.warning("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm/đăng nhập tài khoản Muse AI.");return}';
const replaceWarn = 'if(m_muse&&activeMuseAccounts.length===0&&museAccounts.length===0&&!(X||[]).some(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))){z.warning("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập tài khoản Muse AI.");return}';

if (content.includes(targetWarn)) {
  content = content.replace(targetWarn, replaceWarn);
  console.log('✓ Replaced warning check');
}

// 4. Update default duration to 10s
const tFe = 'duration:g==="Grok"?"6s":g==="Muse AI"?"5s":"8s"';
const rFe = 'duration:g==="Grok"?"6s":g==="Muse AI"?"10s":"8s"';
if (content.includes(tFe)) {
  content = content.replace(tFe, rFe);
  console.log('✓ Replaced fe duration to 10s');
}

const tCe = 'duration:p==="Grok"?"6s":p==="Muse AI"?"5s":"8s"';
const rCe = 'duration:p==="Grok"?"6s":p==="Muse AI"?"10s":"8s"';
if (content.includes(tCe)) {
  content = content.replace(tCe, rCe);
  console.log('✓ Replaced ce duration to 10s');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated VideoStudio-frcr8V6s.js');
