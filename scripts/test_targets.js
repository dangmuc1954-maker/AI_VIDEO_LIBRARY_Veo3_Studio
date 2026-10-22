const fs = require('fs');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// 1. Cut point line search
const cutPointTarget = 'a<ke.length-1&&e.jsx("div",{onClick:oe=>{oe.stopPropagation(),ne(c,!1)},title:u("videoStudio.cutPointTooltip",{time:c.toFixed(2)}),style:{left:`${c*je-6}px`},className:"group/cut absolute top-0 bottom-0 w-3 flex items-center justify-center cursor-pointer z-20",children:e.jsx("div",{className:"w-0.5 h-20 bg-slate-600 group-hover/cut:bg-cyan-400 group-hover/cut:shadow-[0_0_10px_#22d3ee] rounded-full transition-all"})})';
console.log('1. cutPointTarget found:', ourVs.includes(cutPointTarget));

// 2. Kt switch block search
const ktOld = 'const eff=transRef.current||le,isTrans=eff&&eff!=="none";if(Ae.current===0){const b=ue.current,M=pe.current;if(M&&c){(!M.src.endsWith(c.url)&&M.src!==c.url)&&(M.src=c.url,we(c.url));Math.abs(M.currentTime-c.startTime)>.05&&(M.currentTime=c.startTime);M.volume=1;M.play().catch(()=>{});b&&b.paused&&isTrans&&b.play().catch(()=>{});Ps(M,()=>{Ae.current=1;gt(1);if(isTrans){activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:500,fromVid:b,toVid:M};applyVidTransition(b,M,eff,0)}else{activeTransitionRef.current=null;resetVidStyles(M,b);b&&b.pause()}Oe(d,1);Ce.current=!1})}else{Ce.current=!1}}else{const b=ue.current,M=pe.current;if(b&&c){(!b.src.endsWith(c.url)&&b.src!==c.url)&&(b.src=c.url,Ke(c.url));Math.abs(b.currentTime-c.startTime)>.05&&(b.currentTime=c.startTime);b.volume=1;b.play().catch(()=>{});M&&M.paused&&isTrans&&M.play().catch(()=>{});Ps(b,()=>{Ae.current=0;gt(0);if(isTrans){activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:500,fromVid:M,toVid:b};applyVidTransition(M,b,eff,0)}else{activeTransitionRef.current=null;resetVidStyles(b,M);M&&M.pause()}Oe(d,0);Ce.current=!1})}else{Ce.current=!1}}';
console.log('2. ktOld found:', ourVs.includes(ktOld));

// 3. RAF loop search
const rafSearch = 'const eff=transRef.current||le,hasNext=h+1<d.length,transLead=(hasNext&&eff&&eff!=="none")?0.45:0.03;!a.seeking&&(b>=c.segment.endTime-transLead||a.ended&&b>=c.segment.endTime-.2)&&Kt()';
console.log('3. rafSearch found:', ourVs.includes(rafSearch));

// 4. ro.map click search
const roMapSearch = 'onClick:()=>{A(i.id);if(typeof transRef!=="undefined"&&transRef)transRef.current=i.id;z.success(u("videoStudio.transitionSelected",{name:i.label}));';
console.log('4. roMapSearch found:', ourVs.includes(roMapSearch));

// 5. ne seek search
const neSearch = 'const Ve=he===0?Re:ie,$e=he===0?ie:Re;Ve&&(!Ve.src.endsWith(b.segment.url)&&Ve.src!==b.segment.url&&(Ve.src=b.segment.url,he===0?Ke(b.segment.url):we(b.segment.url)),Ve.currentTime=Math.max(0,oe),v?(Ve.play().catch(()=>{}),$e&&$e.pause()):(Ve.pause(),$e&&$e.pause())),Oe(M,he)';
console.log('5. neSearch found:', ourVs.includes(neSearch));
