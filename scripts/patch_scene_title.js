const fs = require('fs');
const vm = require('vm');

const targetPath = 'app/out/renderer/assets/VideoStudio-frcr8V6s.js';
const original = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js.bak_before_scene_title', 'utf8');

let c = original;

// 1. Yi_title
const helperComponent = `function Yi_title({id:t,title:s,onUpdate:n}){const[o,w]=l.useState(s||"");l.useEffect(()=>{w(s||"")},[t,s]);return e.jsx("input",{type:"text",value:o,placeholder:"Tên cảnh (vd: Cảnh 1)...",title:"Đổi tên cảnh / video cho prompt này",onClick:k=>k.stopPropagation(),onKeyDown:k=>k.stopPropagation(),onChange:k=>{const f=k.target.value;w(f),n(t,{title:f})},className:"h-6 w-32 sm:w-40 rounded border border-[#3b3466] bg-[#141126] px-2 text-xs font-semibold text-purple-200 placeholder:text-slate-500 placeholder:font-normal focus:border-[#a78bfa] focus:outline-none transition-all shadow-inner"})}`;
const unIndex = c.indexOf('function un({accountOptions:t,assets:s');
c = c.slice(0, unIndex) + helperComponent + c.slice(unIndex);

// 2. Vr title
const oldVrTitle = 'title:o?`Prompt #${o.index}`:m("videoStudio.inspectorTitle")';
const newVrTitle = 'title:o?e.jsxs("div",{className:"flex items-center gap-1.5 min-w-0 flex-1 mr-1",children:[e.jsx("span",{className:"shrink-0 font-bold text-slate-300 text-[11px] bg-[#211b43] px-2 py-0.5 rounded border border-[#3b3466]",children:`Prompt #${o.index}`}),e.jsx(Yi_title,{id:o.id,title:o.title,onUpdate:S})]}):m("videoStudio.inspectorTitle")';
c = c.replace(oldVrTitle, newVrTitle);

// 3. Bi function
const oldBiHead = 'function Bi(t,s=[]){const n=Lr(s);return t.flatMap(o=>{if(o.type!=="Video")return[];const w=Ee(o.payload,"prompt")||o.title,k=Ee(o.payload,"promptId")||o.id,{assets:f';
const newBiHead = 'function Bi(t,s=[]){const n=Lr(s);return t.flatMap(o=>{if(o.type!=="Video")return[];const w=Ee(o.payload,"prompt")||o.title,k=Ee(o.payload,"promptId")||o.id,sceneTitle=Ee(o.payload,"title")||(o.title&&o.title!==w?o.title:""),{assets:f';
c = c.replace(oldBiHead, newBiHead);

// 4. P in Bi
const oldPHead = 'P={jobId:o.id,promptId:k,prompt:w,provider:$i(o.provider)';
const newPHead = 'P={jobId:o.id,promptId:k,title:sceneTitle,prompt:w,provider:$i(o.provider)';
c = c.replace(oldPHead, newPHead);

// 5. Gi function
const oldGiPart = 'function Gi(t,s){const n=new Map(s.map((o,w)=>[o.id,o.index||w+1]));return[...t].sort';
const newGiPart = 'function Gi(t,s){const n=new Map(s.map((o,w)=>[o.id,o.index||w+1])),prMap=new Map(s.map(o=>[o.id,o]));return[...t].map(v=>{const pr=prMap.get(v.promptId),st=(pr&&pr.title&&pr.title.trim())||v.title||"";return st?{...v,title:st}:v}).sort';
c = c.replace(oldGiPart, newGiPart);

// 6. Grid Card
const oldGridCard = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",children:x.prompt.trim()||S("videoStudio.blankPrompt")})';
const newGridCard = 'e.jsx("div",{className:"truncate text-[11px] font-semibold leading-4 text-white drop-shadow",title:x.prompt,children:(x.title&&x.title.trim())?x.title.trim():(x.prompt.trim()||S("videoStudio.blankPrompt"))})';
c = c.replace(oldGridCard, newGridCard);

// 7. List View
const oldListView = 'e.jsx("div",{className:"truncate text-base font-semibold text-text-primary",children:F.prompt.trim()||S("videoStudio.blankPrompt")})';
const newListView = 'e.jsx("div",{className:"truncate text-base font-semibold text-text-primary",title:F.prompt,children:(F.title&&F.title.trim())?F.title.trim():(F.prompt.trim()||S("videoStudio.blankPrompt"))})';
c = c.replace(oldListView, newListView);

// 8. Table Prompts
const oldTablePrompt = 'children:F?p.prompt:e.jsx("span",{className:"italic text-text-muted",children:P("videoStudio.blankPrompt")})';
const newTablePrompt = 'children:F?(p.title&&p.title.trim()?e.jsxs("span",{children:[e.jsx("span",{className:"mr-1.5 inline-flex items-center rounded bg-purple-500/25 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/40",children:p.title.trim()}),p.prompt]}):p.prompt):e.jsx("span",{className:"italic text-text-muted",children:P("videoStudio.blankPrompt")})';
c = c.replace(oldTablePrompt, newTablePrompt);

// 9. Modal detail & Player header
const oldModalDetail = 'j=s.prompt.trim()||n("videoStudio.blankPrompt")';
const newModalDetail = 'j=(s.title&&s.title.trim())?s.title.trim():(s.prompt.trim()||n("videoStudio.blankPrompt"))';
c = c.replace(oldModalDetail, newModalDetail);

const oldPlayerHeader = 'children:s.prompt||R("videoStudio.blankPrompt")';
const newPlayerHeader = 'children:(s.title&&s.title.trim())?s.title.trim():(s.prompt||R("videoStudio.blankPrompt"))';
c = c.replace(oldPlayerHeader, newPlayerHeader);

// 10. Download
const oldDl = 'r.download=`video-${Ne.promptOrder||Ne.promptId}.mp4`';
const newDl = 'r.download=(Ne.title&&Ne.title.trim()?`${Ne.title.trim().replace(/[\\\\/:*?\"<>|]/g,"_")}.mp4`:`video-${Ne.promptOrder||Ne.promptId}.mp4`)';
c = c.replace(oldDl, newDl);

// 11. Dispatch
const oldMuse = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{promptId:v.id,prompt:v.prompt,';
const newMuse = 'b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,';
c = c.replace(oldMuse, newMuse);

const oldGrok = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:"grok",provider:"Grok",...ot?{accountId:ot.accountId,account:Tt(ot)}:{},payload:{promptId:v.id,prompt:v.prompt,';
const newGrok = 'b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:"grok",provider:"Grok",...ot?{accountId:ot.accountId,account:Tt(ot)}:{},payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,';
c = c.replace(oldGrok, newGrok);

const oldVeo = 'b.push({promptId:v.id,input:{title:v.prompt,type:"Video",providerId:"veo3",provider:"Veo3",...$e?{accountId:$e.accountId,account:Tt($e)}:{},payload:{promptId:v.id,prompt:v.prompt,';
const newVeo = 'b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:"veo3",provider:"Veo3",...$e?{accountId:$e.accountId,account:Tt($e)}:{},payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,';
c = c.replace(oldVeo, newVeo);

// Kiểm tra cú pháp lần cuối trước khi ghi đè
new vm.SourceTextModule(c);
fs.writeFileSync(targetPath, c, 'utf8');
console.log('Successfully written to', targetPath);
