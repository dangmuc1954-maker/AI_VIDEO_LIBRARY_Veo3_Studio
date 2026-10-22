const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
const s = fs.readFileSync(vsPath, 'utf8');

const checks = [
  'at=l.useMemo(()=>X.filter(r=>r.providerId==="veo3"),[X])',
  'Ce=l.useMemo(()=>at.filter(r=>ss(r)&&!rs(r)),[at])',
  'xe=l.useMemo(()=>X.filter(r=>r.providerId==="grok"),[X])',
  'Ie=l.useMemo(()=>xe.filter(r=>ss(r)&&!rs(r)),[xe])',
  'Fe=r=>{if(r==="Veo3"){',
  'if(r==="Grok"){const ee=xe.filter(ae=>!ae.disabled).map(Tt);return ee.length>0?["Auto",...ee]:["Auto"]}',
  'fe=g=>({provider:g,account:"Auto",mode:g==="Grok"?"Components":o?.mode||"Components"',
  'ce=(p,K)=>({provider:p,account:"Auto",mode:p==="Grok"?"Components":K.mode',
  'o.provider==="Grok"?m("videoStudio.noCreditsRequired")',
  'p.provider==="Grok"?Gt:Hs(A,p.model,p.mode==="Frames"?"Frames":p.referenceAssetIds?.length?"R2V":"T2V",p.duration)',
  'p.provider==="Veo3"&&fo(A,p.model)?Os(A,p.model,p.mode==="Frames"?"Frames":"T2V").map(N=>N.id):Fs(p.model)',
  'Ye=Se?.provider==="Veo3"&&Se.account==="Auto",Be=Se?.provider==="Grok"&&Se.account==="Auto"',
  'const ee=Array.from(new Set(C.filter(v=>v.provider!=="Veo3"&&v.provider!=="Grok").map(v=>v.provider))),ae=C.filter(v=>v.provider==="Veo3"||v.provider==="Grok");if(ae.length===0){',
  'const i=ae.some(v=>v.provider==="Veo3"),a=ae.some(v=>v.provider==="Grok");if(i&&Ce.length===0){',
  'if(v.provider==="Grok"){'
];

for (const c of checks) {
  const idx = s.indexOf(c);
  console.log(idx !== -1 ? '✓ FOUND' : '❌ NOT FOUND', ':', c.slice(0, 50));
}
