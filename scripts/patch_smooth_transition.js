const fs = require('fs');
const path = require('path');

console.log('=== ELIMINATING 1-BEAT HITCH / KHỰNG IN TRANSITIONS ===');

const file = path.resolve('app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(file, 'utf8');

// 1. In $t: eliminate redundant re-seek and restore volume instantly
const markerBefore = 'u.pause())},[]),';
const idxStart = code.indexOf(markerBefore);
if (idxStart === -1) throw new Error('markerBefore not found');

const tStart = idxStart + markerBefore.length;
const markerAfter = '},[De,Be]),ht=l.useRef(null);';
const tEnd = code.indexOf(markerAfter, tStart);
if (tEnd === -1) throw new Error('markerAfter not found');

const fullAfter = tEnd + '},[De,Be])'.length;

const newT = `$t=l.useCallback(()=>{if(Ne.current)return;Ne.current=!0;const i=Me.current,t=ve.current,a=t+1;if(a<i.length){const c=i[t]?.segment,u=i[a]?.segment;if(ve.current=a,u&&W(u.id),c&&u&&c.url===u.url&&Math.abs(c.endTime-u.startTime)<.08){setTimeout(()=>{Ne.current=!1},50);return}if(ce.current===0){const w=xe.current,R=ie.current;if(R&&u){!R.src.endsWith(u.url)&&R.src!==u.url&&(R.src=u.url,Ue(u.url));Math.abs(R.currentTime-u.startTime)>.04&&(R.currentTime=u.startTime);R.volume=1;R.paused&&R.play().catch(()=>{});ce.current=1;at(1);w&&w.pause();const transEffect=transRef.current;if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:400,fromVid:w,toVid:R};applyVidTransition(w,R,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(R,w)}Be(a,1);Ne.current=!1}else{Ne.current=!1}}else{const w=xe.current,R=ie.current;if(w&&u){!w.src.endsWith(u.url)&&w.src!==u.url&&(w.src=u.url,Je(u.url));Math.abs(w.currentTime-u.startTime)>.04&&(w.currentTime=u.startTime);w.volume=1;w.paused&&w.play().catch(()=>{});ce.current=0;at(0);R&&R.pause();const transEffect=transRef.current;if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:400,fromVid:R,toVid:w};applyVidTransition(R,w,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(w,R)}Be(a,0);Ne.current=!1}else{Ne.current=!1}}}else{xe.current&&xe.current.pause(),ie.current&&ie.current.pause(),Re.current=!1,p(!1);const c=pe.current;le.current=c,De(c),de(c),Ne.current=!1}},[De,Be])`;

code = code.slice(0, tStart) + newT + code.slice(fullAfter);
console.log('1. Replaced $t with zero-redundant-seek instant playback');

// 2. In requestAnimationFrame loop: pre-spin next video decoder 60ms ahead silently!
const loopRegex = /const i=\(\)=>\{if\(!Re\.current\)return;[\s\S]*?Xe\.current=requestAnimationFrame\(i\)\};/;
const loopMatch = code.match(loopRegex);
if (!loopMatch) throw new Error('loopMatch not found');

const newLoop = `const i=()=>{if(!Re.current)return;const curIdx=ce.current,t=curIdx===0?xe.current:ie.current,o=curIdx===0?ie.current:xe.current,a=Me.current,c=ve.current,u=a[c];if(activeTransitionRef.current){const trans=activeTransitionRef.current,elapsed=performance.now()-trans.startTime,p=Math.min(1,elapsed/trans.duration);applyVidTransition(trans.fromVid,trans.toVid,trans.effect,p);if(p>=1){resetVidStyles(trans.toVid,trans.fromVid);activeTransitionRef.current=null}}if(t&&u&&!Ne.current&&t.readyState>=1){const w=t.currentTime,R=u.globalStart+Math.max(0,w-u.segment.startTime);le.current=R;De(R);u.segment.id!==ht.current&&(ht.current=u.segment.id,W(u.segment.id));const nextItem=a[c+1];const distToEnd=u.segment.endTime-w;if(nextItem&&distToEnd<=0.06&&distToEnd>0.01&&o){const nextSeg=nextItem.segment;(!o.src.endsWith(nextSeg.url)&&o.src!==nextSeg.url)&&(o.src=nextSeg.url,curIdx===0?Ue(nextSeg.url):Je(nextSeg.url));Math.abs(o.currentTime-nextSeg.startTime)>.04&&(o.currentTime=nextSeg.startTime);o.volume=0;o.paused&&o.play().catch(()=>{})}!t.seeking&&(w>=u.segment.endTime-.02||t.ended&&w>=u.segment.endTime-.2)&&$t()}Xe.current=requestAnimationFrame(i)};`;

code = code.replace(loopMatch[0], newLoop);
console.log('2. Replaced requestAnimationFrame with 60ms silent pre-spin warm-up');

// 3. Update Z (seeking)
const zRegex = /Z=l\.useCallback\(\(i,t=!0\)=>\{[\s\S]*?\},\[\$e,fe,De,Be\]\)/;
const zMatch = code.match(zRegex);
if (zMatch) {
  const newZ = `Z=l.useCallback((i,t=!0)=>{activeTransitionRef.current=null;const a=pe.current;let c=Math.max(0,Math.min(a,i));if(t&&Et.current){const tt=Math.max(.18,9/fe);for(const ye of $e)if(Math.abs(c-ye)<=tt){c=ye;break}}le.current=c,de(c),De(c);const u=Me.current;if(u.length===0)return;const w=u.find(tt=>c>=tt.globalStart&&c<tt.globalEnd)||u[u.length-1];if(!w)return;const R=w.index;ve.current=R,W(w.segment.id);const V=w.segment.startTime+(c-w.globalStart),he=Re.current,ue=xe.current,oe=ie.current;let be=ce.current;ue&&(ue.src.endsWith(w.segment.url)||ue.src===w.segment.url)?be=0:oe&&(oe.src.endsWith(w.segment.url)||oe.src===w.segment.url)&&(be=1),ce.current=be,at(be);const Oe=be===0?ue:oe,k=be===0?oe:ue;Oe&&(!Oe.src.endsWith(w.segment.url)&&Oe.src!==w.segment.url&&(Oe.src=w.segment.url,be===0?Je(w.segment.url):Ue(w.segment.url)),Oe.currentTime=Math.max(0,V),Oe.volume=1,he?(Oe.play().catch(()=>{}),k&&k.pause()):(Oe.pause(),k&&k.pause())),Be(R,be);const timeInClip=c-w.globalStart;const transEffect=transRef.current;if(R>0&&transEffect&&transEffect!=="none"&&timeInClip<=0.4){const prevItem=u[R-1];if(k&&prevItem){(!k.src.endsWith(prevItem.segment.url)&&k.src!==prevItem.segment.url)&&(k.src=prevItem.segment.url,be===0?Ue(prevItem.segment.url):Je(prevItem.segment.url));k.currentTime=prevItem.segment.endTime;const p=Math.max(0,Math.min(1,timeInClip/0.4));applyVidTransition(k,Oe,transEffect,p)}}else{resetVidStyles(Oe,k)}},[$e,fe,De,Be])`;
  code = code.replace(zMatch[0], newZ);
  console.log('3. Updated Z seeking with volume reset and 400ms duration');
}

fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated VideoStudio-BZY_1pM8.js!');
