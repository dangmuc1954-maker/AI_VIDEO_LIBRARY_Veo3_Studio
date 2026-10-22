const fs = require('fs');
const path = require('path');

console.log('=== FIXING TRANSITION 0.3s REPLAY & AUDIO OVERLAP ===');

const file = path.resolve('app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Add activeTransitionRef in useRef declarations if not present
if (!code.includes('activeTransitionRef=l.useRef(null)')) {
  code = code.replace(
    'Xe=l.useRef(null),transRef=l.useRef("none"),',
    'Xe=l.useRef(null),transRef=l.useRef("none"),activeTransitionRef=l.useRef(null),'
  );
  console.log('1. Added activeTransitionRef declaration');
} else {
  console.log('1. activeTransitionRef already declared');
}

// 2. Locate $t callback and replace it
const markerBefore = 'u.pause())},[]),';
const idxStart = code.indexOf(markerBefore);
if (idxStart !== -1) {
  const tStart = idxStart + markerBefore.length;
  const markerAfter = '},[De,Be]),ht=l.useRef(null);';
  const tEnd = code.indexOf(markerAfter, tStart);
  if (tEnd !== -1) {
    const fullAfter = tEnd + '},[De,Be])'.length;
    const oldT = code.slice(tStart, fullAfter);
    console.log('Found $t function length:', oldT.length);

    const newT = `$t=l.useCallback(()=>{if(Ne.current)return;Ne.current=!0;const i=Me.current,t=ve.current,a=t+1;if(a<i.length){const c=i[t]?.segment,u=i[a]?.segment;if(ve.current=a,u&&W(u.id),c&&u&&c.url===u.url&&Math.abs(c.endTime-u.startTime)<.08){setTimeout(()=>{Ne.current=!1},50);return}if(ce.current===0){const w=xe.current,R=ie.current;if(R&&u){!R.src.endsWith(u.url)&&R.src!==u.url&&(R.src=u.url,Ue(u.url));R.currentTime=u.startTime;R.play().catch(()=>{});ce.current=1;at(1);w&&w.pause();const transEffect=transRef.current;if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:500,fromVid:w,toVid:R};applyVidTransition(w,R,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(R,w)}Be(a,1);Ne.current=!1}else{Ne.current=!1}}else{const w=xe.current,R=ie.current;if(w&&u){!w.src.endsWith(u.url)&&w.src!==u.url&&(w.src=u.url,Je(u.url));w.currentTime=u.startTime;w.play().catch(()=>{});ce.current=0;at(0);R&&R.pause();const transEffect=transRef.current;if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:500,fromVid:R,toVid:w};applyVidTransition(R,w,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(w,R)}Be(a,0);Ne.current=!1}else{Ne.current=!1}}}else{xe.current&&xe.current.pause(),ie.current&&ie.current.pause(),Re.current=!1,p(!1);const c=pe.current;le.current=c,De(c),de(c),Ne.current=!1}},[De,Be])`;

    code = code.slice(0, tStart) + newT + code.slice(fullAfter);
    console.log('2. Successfully replaced $t function!');
  } else {
    console.error('markerAfter not found');
  }
} else {
  console.error('markerBefore not found');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Finished updating VideoStudio-BZY_1pM8.js');
