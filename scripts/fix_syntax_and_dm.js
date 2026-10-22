const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

// Replace the broken part around museRuntimeInst
const idx = code.indexOf('museRuntimeInst');
if (idx !== -1) {
  const start = code.lastIndexOf(',', idx);
  const end = code.indexOf('Qr=new cp', idx);
  console.log("Replacing broken area between", start, "and", end);
  console.log("Old chunk:", code.substring(start, end));
  
  // Replace with clean call
  code = code.substring(0, start) + ',dt.register(new MuseVideoRuntime(T,V,W)),' + code.substring(end);
}

// Make sure class dm handles "muse" and "Muse AI" properly
const dmStart = code.indexOf('class dm{');
const dmEnd = code.indexOf('const Rc=', dmStart);
if (dmStart !== -1 && dmEnd !== -1) {
  const newDm = `class dm{runtimes=new Map;register(e){const p=e.providerId||"muse";const t=this.runtimes.get(p)||[];this.runtimes.set(p,[...t,e]);if(p==="muse"){const t2=this.runtimes.get("Muse AI")||[];this.runtimes.set("Muse AI",[...t2,e])}}get(e,t){let A=this.runtimes.get(e)||[];if(!A||A.length===0){const muse=(this.runtimes.get("muse")||[])[0]||(this.runtimes.get("Muse AI")||[])[0];if(muse&&(t==="Video"||!t||!e||String(e).toLowerCase().includes("muse")||String(e).startsWith("custom-"))){return muse}}return t?A.find(o=>o&&typeof o.supports==="function"&&o.supports(t))||null:A[0]||null}}`;
  code = code.substring(0, dmStart) + newDm + code.substring(dmEnd);
  console.log("Updated class dm with dual registration!");
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Saved fixed index.js");
