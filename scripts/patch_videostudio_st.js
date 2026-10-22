const fs = require('fs');

const file = 'app/out/renderer/assets/VideoStudio-frcr8V6s.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Mo_muse after Po
const targetPo = 'Po=r=>{if(r.account!=="Auto")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))}';
const replacePo = 'Po=r=>{if(r.account!=="Auto")return Ie.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))},Mo_muse=r=>{if(r.account!=="Auto")return museAccounts.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account))||activeMuseAccounts.find(C=>[C.accountName,C.accountDisplayName,C.accountEmail,Tt(C)].includes(r.account));return activeMuseAccounts[0]||museAccounts[0]}';

if (!content.includes(targetPo)) {
  console.error('targetPo not found!');
  process.exit(1);
}

content = content.replace(targetPo, replacePo);

// 2. Add Muse AI branch right before Grok
const targetGrok = 'if(v.provider==="Grok"){';
const replaceGrok = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v);if(v.account!=="Auto"&&!ot){d.push(\`\${v.account} is not ready\`);continue}const pid=(ot&&ot.providerId)?ot.providerId:"muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:pid,provider:"Muse AI",...ot?{accountId:ot.accountId,account:Tt(ot)}:{},payload:{promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"5s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:[],resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}if(v.provider==="Grok"){`;

if (!content.includes(targetGrok)) {
  console.error('targetGrok not found!');
  process.exit(1);
}

content = content.replace(targetGrok, replaceGrok);

// 3. Relax activeMuseAccounts check in St
const targetWarning = 'if(m_muse&&activeMuseAccounts.length===0){z.warning("Chưa có tài khoản Muse AI nào sẵn sàng trong Browser Hub! Vui lòng đăng nhập tài khoản Muse AI.");return}';
const replaceWarning = 'if(m_muse&&activeMuseAccounts.length===0&&museAccounts.length===0){z.warning("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm/đăng nhập tài khoản Muse AI.");return}';

if (content.includes(targetWarning)) {
  content = content.replace(targetWarning, replaceWarning);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully patched VideoStudio-frcr8V6s.js');
