const fs = require('fs');
const path = require('path');

console.log('=== UPGRADING VIDEO STUDIO TRANSITION ENGINE ===');

const rendererFile = path.resolve('app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
let code = fs.readFileSync(rendererFile, 'utf8');

// 1. Add applyVidTransition and resetVidStyles helper functions before const mn=
const helperFunctions = `
function applyVidTransition(curVid, nextVid, effect, p) {
  if (!curVid || !nextVid) return;
  curVid.style.position = "absolute";
  curVid.style.inset = "0";
  nextVid.style.position = "absolute";
  nextVid.style.inset = "0";
  nextVid.style.pointerEvents = "none";
  
  switch(effect) {
    case "dissolve":
    case "fade":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = Math.max(0, 1 - p).toFixed(3);
      nextVid.style.opacity = Math.min(1, p).toFixed(3);
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "none";
      break;
    case "fadeblack":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "none";
      if (p < 0.5) {
        curVid.style.opacity = Math.max(0, 1 - p * 2).toFixed(3);
        nextVid.style.opacity = "0";
      } else {
        curVid.style.opacity = "0";
        nextVid.style.opacity = Math.min(1, (p - 0.5) * 2).toFixed(3);
      }
      break;
    case "slideleft":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "none";
      curVid.style.transform = "translateX(" + (-p * 100).toFixed(2) + "%)";
      nextVid.style.transform = "translateX(" + ((1 - p) * 100).toFixed(2) + "%)";
      break;
    case "slideright":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "none";
      curVid.style.transform = "translateX(" + (p * 100).toFixed(2) + "%)";
      nextVid.style.transform = "translateX(" + (-(1 - p) * 100).toFixed(2) + "%)";
      break;
    case "wipeleft":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "inset(0 0 0 " + ((1 - p) * 100).toFixed(2) + "%)";
      break;
    case "wiperight":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "inset(0 " + ((1 - p) * 100).toFixed(2) + "% 0 0)";
      break;
    case "circleopen":
      curVid.style.zIndex = "10";
      nextVid.style.zIndex = "15";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "none";
      nextVid.style.clipPath = "circle(" + (p * 85).toFixed(2) + "% at 50% 50%)";
      break;
    case "circleclose":
      curVid.style.zIndex = "15";
      nextVid.style.zIndex = "10";
      curVid.style.opacity = "1";
      nextVid.style.opacity = "1";
      curVid.style.transform = "none";
      nextVid.style.transform = "none";
      curVid.style.clipPath = "circle(" + ((1 - p) * 85).toFixed(2) + "% at 50% 50%)";
      nextVid.style.clipPath = "none";
      break;
    default:
      resetVidStyles(curVid, nextVid);
      break;
  }
}

function resetVidStyles(activeVid, inactiveVid) {
  if (activeVid) {
    activeVid.style.opacity = "1";
    activeVid.style.zIndex = "10";
    activeVid.style.transform = "none";
    activeVid.style.clipPath = "none";
    activeVid.style.pointerEvents = "auto";
  }
  if (inactiveVid) {
    inactiveVid.style.opacity = "0";
    inactiveVid.style.zIndex = "0";
    inactiveVid.style.transform = "none";
    inactiveVid.style.clipPath = "none";
    inactiveVid.style.pointerEvents = "none";
  }
}
`;

if (!code.includes('function applyVidTransition')) {
  const marker = 'const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{';
  if (!code.includes(marker)) {
    throw new Error('Marker for mn not found');
  }
  code = code.replace(marker, helperFunctions + '\n' + marker);
  console.log('Added helper functions applyVidTransition and resetVidStyles');
}

// 2. Add transRef inside mn
if (!code.includes('const transRef=l.useRef("none");transRef.current=K;')) {
  const transMarker = '[K,v]=l.useState("none"),';
  if (!code.includes(transMarker)) {
    throw new Error('Marker for [K,v] not found');
  }
  code = code.replace(transMarker, '[K,v]=l.useState("none");const transRef=l.useRef("none");transRef.current=K;');
  console.log('Added transRef tracking');
}

// 3. Update $t to resetVidStyles on clip switch
const oldSwitch0 = 'yo(R,()=>{ce.current=1,at(1),w&&w.pause(),Be(a,1),Ne.current=!1})';
const newSwitch0 = 'yo(R,()=>{ce.current=1,at(1),w&&w.pause(),resetVidStyles(R,w),Be(a,1),Ne.current=!1})';
if (code.includes(oldSwitch0)) {
  code = code.replace(oldSwitch0, newSwitch0);
  console.log('Updated $t switch 0 with resetVidStyles');
}

const oldSwitch1 = 'yo(w,()=>{ce.current=0,at(0),R&&R.pause(),Be(a,0),Ne.current=!1})';
const newSwitch1 = 'yo(w,()=>{ce.current=0,at(0),R&&R.pause(),resetVidStyles(w,R),Be(a,0),Ne.current=!1})';
if (code.includes(oldSwitch1)) {
  code = code.replace(oldSwitch1, newSwitch1);
  console.log('Updated $t switch 1 with resetVidStyles');
}

// 4. Update the requestAnimationFrame playback loop to execute real-time transitions!
const oldLoop = '!t.seeking&&(w>=u.segment.endTime-.03||t.ended&&w>=u.segment.endTime-.2)&&$t()';
const newLoop = `const nextItem=a[c+1];const transEffect=transRef.current;const transDur=(transEffect&&transEffect!=="none"&&nextItem)?Math.min(0.8,(u.segment.endTime-u.segment.startTime)/2):0;const distToEnd=u.segment.endTime-w;if(nextItem&&transDur>0&&distToEnd<=transDur&&distToEnd>0.02){const p=Math.max(0,Math.min(1,1-(distToEnd/transDur)));const nextSeg=nextItem.segment;if(o){if(!o.src.endsWith(nextSeg.url)&&o.src!==nextSeg.url){o.src=nextSeg.url;curIdx===0?Ue(nextSeg.url):Je(nextSeg.url)}const targetNextTime=nextSeg.startTime+(transDur-distToEnd);if(Math.abs(o.currentTime-targetNextTime)>0.08){o.currentTime=targetNextTime}if(o.paused){o.play().catch(()=>{})}applyVidTransition(t,o,transEffect,p)}}else if(distToEnd>transDur||!nextItem){resetVidStyles(t,o)}!t.seeking&&(w>=u.segment.endTime-.03||t.ended&&w>=u.segment.endTime-.2)&&$t()`;

// Also check definition of t and o in loop
const oldLoopStart = 'const t=ce.current===0?xe.current:ie.current,a=Me.current,c=ve.current,u=a[c];';
const newLoopStart = 'const curIdx=ce.current,t=curIdx===0?xe.current:ie.current,o=curIdx===0?ie.current:xe.current,a=Me.current,c=ve.current,u=a[c];';

if (code.includes(oldLoopStart)) {
  code = code.replace(oldLoopStart, newLoopStart);
  console.log('Updated loop start with curIdx and other video o');
}
if (code.includes(oldLoop)) {
  code = code.replace(oldLoop, newLoop);
  console.log('Updated requestAnimationFrame loop with transition engine');
}

// 5. Update Z (seeking/scrubbing)
const oldZSeek = 'Oe&&(!Oe.src.endsWith(w.segment.url)&&Oe.src!==w.segment.url&&(Oe.src=w.segment.url,be===0?Je(w.segment.url):Ue(w.segment.url)),Oe.currentTime=Math.max(0,V),he?(Oe.play().catch(()=>{}),k&&k.pause()):(Oe.pause(),k&&k.pause())),Be(R,be)';
const newZSeek = `Oe&&(!Oe.src.endsWith(w.segment.url)&&Oe.src!==w.segment.url&&(Oe.src=w.segment.url,be===0?Je(w.segment.url):Ue(w.segment.url)),Oe.currentTime=Math.max(0,V),he?(Oe.play().catch(()=>{}),k&&k.pause()):(Oe.pause(),k&&k.pause())),Be(R,be);const nextItem=u[R+1];const transEffect=transRef.current;const transDur=(transEffect&&transEffect!=="none"&&nextItem)?Math.min(0.8,(w.segment.endTime-w.segment.startTime)/2):0;const distToEnd=w.globalEnd-c;if(nextItem&&transDur>0&&distToEnd<=transDur&&distToEnd>=0){const p=Math.max(0,Math.min(1,1-(distToEnd/transDur)));const nextSeg=nextItem.segment;if(k){if(!k.src.endsWith(nextSeg.url)&&k.src!==nextSeg.url){k.src=nextSeg.url;be===0?Ue(nextSeg.url):Je(nextSeg.url)}k.currentTime=nextSeg.startTime+(transDur-distToEnd);applyVidTransition(Oe,k,transEffect,p)}}else{resetVidStyles(Oe,k)}`;

if (code.includes(oldZSeek)) {
  code = code.replace(oldZSeek, newZSeek);
  console.log('Updated scrubbing in Z with transition preview');
}

// 6. Update video elements JSX to clean clean classes
// Find video elements with xe and ie
const oldVideoElements = code.match(/e\.jsx\("video",\{ref:xe,src:js,muted:x,playsInline:!0,preload:"auto",onLoadedMetadata:i=>ts\(\)[^\}]+className:`[^`]+`[^}]*\}\),e\.jsx\("video",\{ref:ie,src:Ve,muted:x,playsInline:!0,preload:"auto",onLoadedMetadata:i=>ts\(\)[^\}]+className:`[^`]+`[^}]*\}\)/);

if (oldVideoElements) {
  const newVideoElements = `e.jsx("video",{ref:xe,src:js,muted:x,playsInline:!0,preload:"auto",onLoadedMetadata:i=>ts(),className:\`absolute inset-0 w-full h-full \${ls} \${mt===0?"opacity-100 z-10":"opacity-0 z-0 pointer-events-none"}\`,onClick:dt}),e.jsx("video",{ref:ie,src:Ve,muted:x,playsInline:!0,preload:"auto",onLoadedMetadata:i=>ts(),className:\`absolute inset-0 w-full h-full \${ls} \${mt===1?"opacity-100 z-10":"opacity-0 z-0 pointer-events-none"}\`,onClick:dt})`;
  code = code.replace(oldVideoElements[0], newVideoElements);
  console.log('Cleaned up video element JSX classes');
}

// 7. Update transition card onClick to automatically preview the transition!
const oldCardClick = 'onClick:()=>{v(i.id),A.success(m("videoStudio.transitionSelected",{name:i.label}))}';
const newCardClick = 'onClick:()=>{v(i.id);transRef.current=i.id;A.success(m("videoStudio.transitionSelected",{name:i.label}));if(i.id!=="none"&&Me.current&&Me.current.length>1){const cutPoint=Me.current[0].globalEnd;const seekTime=Math.max(0,cutPoint-0.7);Z(seekTime,!1);setTimeout(()=>{if(!Re.current)dt()},80)}}';

if (code.includes(oldCardClick)) {
  code = code.replace(oldCardClick, newCardClick);
  console.log('Added auto-preview to transition card click');
}

// 8. Update timeline transition badge onClick to preview transition when clicked!
const oldBadge = 'className:"cursor-pointer px-2 py-0.5 rounded-md bg-indigo-600/90 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 shadow-md border border-indigo-300/40 text-[10px]"';
const newBadgeClick = 'onClick:ev=>{ev.stopPropagation();const cutPoint=t.globalEnd;const seekTime=Math.max(0,cutPoint-0.7);Z(seekTime,!1);setTimeout(()=>{if(!Re.current)dt()},80)},className:"cursor-pointer px-2 py-0.5 rounded-md bg-indigo-600/90 hover:bg-indigo-500 hover:scale-105 transition-all text-white font-semibold flex items-center gap-1 shadow-md border border-indigo-300/40 text-[10px]"';

if (code.includes(oldBadge) && !code.includes('const cutPoint=t.globalEnd')) {
  code = code.replace(oldBadge, newBadgeClick);
  console.log('Added click-to-preview on timeline transition badge');
}

// 9. Update is() export call to pass aspectRatio
const oldExportCall = 'outputAspect:M,source:"video-studio"';
const newExportCall = 'outputAspect:M,aspectRatio:M,source:"video-studio"';
if (code.includes(oldExportCall)) {
  code = code.replaceAll(oldExportCall, newExportCall);
  console.log('Updated export calls with aspectRatio:M');
}

fs.writeFileSync(rendererFile, code, 'utf8');
console.log('VideoStudio-BZY_1pM8.js updated successfully!');
