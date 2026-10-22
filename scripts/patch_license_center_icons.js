const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../app/out/renderer/assets/LicenseCenter-CK2ppPZf.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/renderer/assets/LicenseCenter-CK2ppPZf.js'),
  path.join('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/renderer/assets/LicenseCenter-CK2ppPZf.js')
];

for (const file of targetFiles) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Update Ma(a) to pass a.code || a.tier
  const oldMa = 'accent:a.accentColor?.trim()||$a(a.tier),icon:Ta(a.tier)';
  const newMa = 'accent:a.accentColor?.trim()||$a(a.code||a.tier),icon:Ta(a.code||a.tier)';
  if (code.includes(oldMa)) {
    code = code.replace(oldMa, newMa);
    console.log('[+] Updated Ma(a) in:', file);
  } else {
    console.log('[-] oldMa not found in:', file);
  }

  // 2. Update Ta(a) and $a(a)
  const oldTa = 'function Ta(a){return a.toLowerCase()==="ultra"?va:a.toLowerCase()==="pro"?za:qe}function $a(a){return a.toLowerCase()==="ultra"?"#34d399":a.toLowerCase()==="pro"?"#6366f1":"#38bdf8"}';
  const newTa = 'function Ta(a){const c=String(a||"").toLowerCase();if(c.includes("gold")||c==="ultra")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Gold VIP",children:"👑"});if(c.includes("silver"))return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Silver",children:"💎"});if(c.includes("basic")||c==="pro")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Basic",children:"⚡"});if(c.includes("trial")||c==="starter")return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},title:"Trải Nghiệm Free",children:"🎁"});return()=>e.jsx("span",{style:{fontSize:"22px",lineHeight:1,display:"inline-flex",alignItems:"center",justifyContent:"center"},children:"✨"})}function $a(a){const c=String(a||"").toLowerCase();if(c.includes("gold")||c==="ultra")return"#eab308";if(c.includes("silver"))return"#a855f7";if(c.includes("basic")||c==="pro")return"#6366f1";if(c.includes("trial")||c==="starter")return"#38bdf8";return"#38bdf8"}';

  if (code.includes(oldTa)) {
    code = code.replace(oldTa, newTa);
    console.log('[+] Updated Ta(a) and $a(a) in:', file);
  } else {
    console.log('[-] oldTa not found in:', file);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('✅ Successfully patched LicenseCenter icons in:', file);
}
