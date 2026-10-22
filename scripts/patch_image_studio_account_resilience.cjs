const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let code = fs.readFileSync(targetPath, 'utf8');

const targetStr = 'Zt=p.useMemo(()=>ot.filter(t=>Tt(t)&&!Dt(t)),[ot]),Yt=p.useMemo(()=>st.filter(t=>Tt(t)&&!Dt(t)),[st]),er=p.useMemo(()=>nt.filter(t=>Tt(t)&&!Dt(t)),[nt]),';

const replaceStr = 'Zt=p.useMemo(()=>{const r=ot.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:ot.filter(t=>Tt(t))},[ot]),Yt=p.useMemo(()=>{const r=st.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:st.filter(t=>Tt(t))},[st]),er=p.useMemo(()=>{const r=nt.filter(t=>Tt(t)&&!Dt(t));return r.length>0?r:nt.filter(t=>Tt(t))},[nt]),';

if (!code.includes(targetStr)) {
  console.log('[*] Target string not found directly, checking if already patched...');
  if (code.includes('Zt=p.useMemo(()=>{const r=ot.filter(t=>Tt(t)&&!Dt(t))')) {
    console.log('[-] Already patched.');
  } else {
    console.error('[-] Could not find targetStr in ImageStudio-4nmpUX3j.js');
    process.exit(1);
  }
} else {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync(targetPath, code, 'utf8');
  console.log('[+] Successfully patched ImageStudio-4nmpUX3j.js for account resilience!');
}
