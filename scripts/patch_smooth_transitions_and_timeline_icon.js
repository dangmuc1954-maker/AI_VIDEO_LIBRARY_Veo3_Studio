const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 CẬP NHẬT BIÊN TẬP VIDEO: ICON CHUYỂN CẢNH & PHÁT NỐI TIẾP SIÊU MƯỢT 🎬');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const appRendererAssets = path.join(rootDir, 'app/out/renderer/assets');
const zip3Assets = path.join(rootDir, 'scratch/zip3_source_app/resources/app/out/renderer/assets');

// 1. Sao chép aiforge_video_editor_automerge.js (75KB) từ zip3
console.log('\n[1/5] Sao chép mô-đun aiforge_video_editor_automerge.js chuẩn (75KB)...');
const srcAutomerge = path.join(zip3Assets, 'aiforge_video_editor_automerge.js');
const destAutomerge = path.join(appRendererAssets, 'aiforge_video_editor_automerge.js');
if (fs.existsSync(srcAutomerge)) {
  fs.copyFileSync(srcAutomerge, destAutomerge);
  const stat = fs.statSync(destAutomerge);
  console.log(`  ✓ Đã sao chép thành công aiforge_video_editor_automerge.js (${stat.size} bytes)`);
} else {
  console.warn('  ⚠️ Không tìm thấy nguồn zip3:', srcAutomerge);
}

// 2. Cập nhật index.html
console.log('\n[2/5] Nhúng aiforge_video_editor_automerge.js vào renderer/index.html...');
const htmlPath = path.join(rootDir, 'app/out/renderer/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('aiforge_video_editor_automerge.js')) {
  html = html.replace(
    '<script type="module" crossorigin src="./assets/index-BS7vgKVV.js"></script>',
    '<script type="module" crossorigin src="./assets/index-BS7vgKVV.js"></script>\n    <script type="module" src="./assets/aiforge_video_editor_automerge.js"></script>'
  );
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✓ Đã thêm thẻ script vào index.html');
} else {
  console.log('  [-] index.html đã có sẵn thẻ script');
}

// 3. Nâng cấp VideoStudio-frcr8V6s.js
console.log('\n[3/5] Nâng cấp VideoStudio-frcr8V6s.js...');
const vsPath = path.join(appRendererAssets, 'VideoStudio-frcr8V6s.js');
let vsCode = fs.readFileSync(vsPath, 'utf8');

// 3a. Icon & Badge chuyển cảnh trên Timeline (giữa 2 phân đoạn)
console.log('  -> [3a] Thêm Icon & Badge chuyển cảnh [✂️ Cắt thẳng / 🔀 Hiệu ứng] trên Timeline...');
const cutPointOld = 'a<ke.length-1&&e.jsx("div",{onClick:oe=>{oe.stopPropagation(),ne(c,!1)},title:u("videoStudio.cutPointTooltip",{time:c.toFixed(2)}),style:{left:`${c*je-6}px`},className:"group/cut absolute top-0 bottom-0 w-3 flex items-center justify-center cursor-pointer z-20",children:e.jsx("div",{className:"w-0.5 h-20 bg-slate-600 group-hover/cut:bg-cyan-400 group-hover/cut:shadow-[0_0_10px_#22d3ee] rounded-full transition-all"})})';
const cutPointNew = `a<ke.length-1&&e.jsxs("div",{onClick:oe=>{oe.stopPropagation();ne(c,!1);se("transitions");},title:\`Điểm nối: Chuyển cảnh [\${ro.find(tr=>tr.id===le)?.label||"Cắt thẳng"}]. Bấm để đổi hiệu ứng!\`,style:{left:\`\${c*je-20}px\`},className:"group/cut absolute top-0 bottom-0 w-10 flex flex-col items-center justify-center cursor-pointer z-20",children:[e.jsx("div",{className:"w-0.5 h-full bg-indigo-500/50 group-hover/cut:bg-cyan-400 group-hover/cut:shadow-[0_0_10px_#22d3ee] transition-all"}),e.jsxs("div",{className:\`absolute top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full border shadow-lg flex items-center gap-1 text-[10px] font-bold select-none transition-all group-hover/cut:scale-110 \${le!=="none"?"bg-gradient-to-r from-indigo-950 to-purple-950 border-indigo-400 text-indigo-100 ring-2 ring-indigo-500/40 shadow-indigo-950/80":"bg-slate-900/95 border-slate-700 text-slate-300 hover:border-slate-500"}\`,children:[e.jsx("span",{children:le!=="none"?"🔀":"✂️"}),e.jsx("span",{className:"truncate max-w-[65px]",children:ro.find(tr=>tr.id===le)?.label||"Cắt thẳng"})]})]})`;

if (vsCode.includes(cutPointOld)) {
  vsCode = vsCode.replace(cutPointOld, cutPointNew);
  console.log('    ✓ Đã thay thế thành công điểm nối timeline với Icon Badge & Mở tab chuyển cảnh khi click');
} else {
  console.warn('    ⚠️ Không tìm thấy cutPointOld (có thể đã được thay trước đó)');
}

// 3b. Sửa triệt để lỗi khựng 0.2s và lặp hình phân đoạn tiếp theo trong hàm Kt
console.log('  -> [3b] Chuyển tiếp video tức thì, loại bỏ hoàn toàn độ trễ 0.2s & lặp hình...');
const ktOld = 'const eff=transRef.current||le,isTrans=eff&&eff!=="none";if(Ae.current===0){const b=ue.current,M=pe.current;if(M&&c){(!M.src.endsWith(c.url)&&M.src!==c.url)&&(M.src=c.url,we(c.url));Math.abs(M.currentTime-c.startTime)>.05&&(M.currentTime=c.startTime);M.volume=1;M.play().catch(()=>{});b&&b.paused&&isTrans&&b.play().catch(()=>{});Ps(M,()=>{Ae.current=1;gt(1);if(isTrans){activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:500,fromVid:b,toVid:M};applyVidTransition(b,M,eff,0)}else{activeTransitionRef.current=null;resetVidStyles(M,b);b&&b.pause()}Oe(d,1);Ce.current=!1})}else{Ce.current=!1}}else{const b=ue.current,M=pe.current;if(b&&c){(!b.src.endsWith(c.url)&&b.src!==c.url)&&(b.src=c.url,Ke(c.url));Math.abs(b.currentTime-c.startTime)>.05&&(b.currentTime=c.startTime);b.volume=1;b.play().catch(()=>{});M&&M.paused&&isTrans&&M.play().catch(()=>{});Ps(b,()=>{Ae.current=0;gt(0);if(isTrans){activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:500,fromVid:M,toVid:b};applyVidTransition(M,b,eff,0)}else{activeTransitionRef.current=null;resetVidStyles(b,M);M&&M.pause()}Oe(d,0);Ce.current=!1})}else{Ce.current=!1}}';

const ktNew = `const transEffect=transRef.current||le;if(Ae.current===0){const w=ue.current,R=pe.current;if(R&&c){!R.src.endsWith(c.url)&&R.src!==c.url&&(R.src=c.url,we(c.url));Math.abs(R.currentTime-c.startTime)>.04&&(R.currentTime=c.startTime);R.volume=1;R.paused&&R.play().catch(()=>{});Ae.current=1;gt(1);w&&w.pause();if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:400,fromVid:w,toVid:R};applyVidTransition(w,R,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(R,w)}Oe(d,1);Ce.current=!1}else{Ce.current=!1}}else{const w=ue.current,R=pe.current;if(w&&c){!w.src.endsWith(c.url)&&w.src!==c.url&&(w.src=c.url,Ke(c.url));Math.abs(w.currentTime-c.startTime)>.04&&(w.currentTime=c.startTime);w.volume=1;w.paused&&w.play().catch(()=>{});Ae.current=0;gt(0);R&&R.pause();if(transEffect&&transEffect!=="none"){activeTransitionRef.current={effect:transEffect,startTime:performance.now(),duration:400,fromVid:R,toVid:w};applyVidTransition(R,w,transEffect,0)}else{activeTransitionRef.current=null;resetVidStyles(w,R)}Oe(d,0);Ce.current=!1}else{Ce.current=!1}}`;

if (vsCode.includes(ktOld)) {
  vsCode = vsCode.replace(ktOld, ktNew);
  console.log('    ✓ Đã thay thế hàm chuyển đổi phân đoạn Kt mượt mà chuẩn xác');
} else {
  console.warn('    ⚠️ Không tìm thấy ktOld');
}

// 3c. Vòng lặp RAF: Khởi động trước video sau 60ms & chuyển đổi mượt mà không giật hình
console.log('  -> [3c] Tối ưu hóa vòng lặp RAF: Pre-warm 60ms & Chuyển đổi liền mạch...');
const rafOld = 'if(activeTransitionRef.current){const trans=activeTransitionRef.current,elapsed=performance.now()-trans.startTime,prg=Math.min(1,elapsed/trans.duration);applyVidTransition(trans.fromVid,trans.toVid,trans.effect,prg);if(prg<1){trans.fromVid&&trans.fromVid.paused&&trans.fromVid.play().catch(()=>{});trans.toVid&&trans.toVid.paused&&trans.toVid.play().catch(()=>{})}else{trans.fromVid&&trans.fromVid.pause();resetVidStyles(trans.toVid,trans.fromVid);activeTransitionRef.current=null}}const a=Ae.current===0?ue.current:pe.current,d=Se.current,h=be.current,c=d[h];if(a&&c&&!Ce.current&&a.readyState>=1){const b=a.currentTime,M=c.globalStart+Math.max(0,b-c.segment.startTime);xe.current=M,_e(M),c.segment.id!==wt.current&&(wt.current=c.segment.id,U(c.segment.id));const eff=transRef.current||le,hasNext=h+1<d.length,transLead=(hasNext&&eff&&eff!=="none")?0.45:0.03;!a.seeking&&(b>=c.segment.endTime-transLead||a.ended&&b>=c.segment.endTime-.2)&&Kt()}';

const rafNew = `if(activeTransitionRef.current){const trans=activeTransitionRef.current,elapsed=performance.now()-trans.startTime,p=Math.min(1,elapsed/trans.duration);applyVidTransition(trans.fromVid,trans.toVid,trans.effect,p);if(p>=1){resetVidStyles(trans.toVid,trans.fromVid);activeTransitionRef.current=null}}const curIdx=Ae.current,t=curIdx===0?ue.current:pe.current,o=curIdx===0?pe.current:ue.current,a=Se.current,c=be.current,u=a[c];if(t&&u&&!Ce.current&&t.readyState>=1){const w=t.currentTime,R=u.globalStart+Math.max(0,w-u.segment.startTime);xe.current=R;_e(R);u.segment.id!==wt.current&&(wt.current=u.segment.id,U(u.segment.id));const nextItem=a[c+1];const distToEnd=u.segment.endTime-w;if(nextItem&&distToEnd<=0.06&&distToEnd>0.01&&o){const nextSeg=nextItem.segment;(!o.src.endsWith(nextSeg.url)&&o.src!==nextSeg.url)&&(o.src=nextSeg.url,curIdx===0?we(nextSeg.url):Ke(nextSeg.url));Math.abs(o.currentTime-nextSeg.startTime)>.04&&(o.currentTime=nextSeg.startTime);o.volume=0;o.paused&&o.play().catch(()=>{})}!t.seeking&&(w>=u.segment.endTime-.02||t.ended&&w>=u.segment.endTime-.2)&&Kt()}`;

if (vsCode.includes(rafOld)) {
  vsCode = vsCode.replace(rafOld, rafNew);
  console.log('    ✓ Đã thay thế vòng lặp RAF chuyển tiếp không giật khựng');
} else {
  console.warn('    ⚠️ Không tìm thấy rafOld');
}

// 3d. Demo trực tiếp khi click chọn hiệu ứng chuyển cảnh
console.log('  -> [3d] Cập nhật Live Demo khi click chọn hiệu ứng...');
const clickTransOld = 'onClick:()=>{A(i.id);if(typeof transRef!=="undefined"&&transRef)transRef.current=i.id;z.success(u("videoStudio.transitionSelected",{name:i.label}));if(i.id!=="none"){const curV=Ae.current===0?ue.current:pe.current,nxtV=Ae.current===0?pe.current:ue.current;if(curV&&nxtV){const allClips=Se.current,curIdx=be.current,nextClip=(allClips&&allClips[curIdx+1]?.segment)||(allClips&&allClips[0]?.segment);if(nextClip&&(!nxtV.src.endsWith(nextClip.url)&&nxtV.src!==nextClip.url)){nxtV.src=nextClip.url}if(nextClip&&Math.abs(nxtV.currentTime-nextClip.startTime)>0.05){nxtV.currentTime=nextClip.startTime||0}const wasPlaying=Ie.current;curV.play().catch(()=>{});nxtV.play().catch(()=>{});const pStart=performance.now(),pDur=550;const stepPrv=(now)=>{const pr=Math.min(1,(now-pStart)/pDur);applyVidTransition(curV,nxtV,i.id,pr);if(pr<1){requestAnimationFrame(stepPrv)}else{resetVidStyles(curV,nxtV);if(!wasPlaying){curV.pause();nxtV.pause()}}};requestAnimationFrame(stepPrv)}}}';

const clickTransNew = `onClick:()=>{A(i.id);transRef.current=i.id;z.success(u("videoStudio.transitionSelected",{name:i.label}));if(i.id!=="none"&&Se.current&&Se.current.length>1){const cutPoint=Se.current[0].globalEnd;const seekTime=Math.max(0,cutPoint-0.2);ne(seekTime,!1);setTimeout(()=>{if(!Ie.current)tt()},80)}}`;

if (vsCode.includes(clickTransOld)) {
  vsCode = vsCode.replace(clickTransOld, clickTransNew);
  console.log('    ✓ Đã gắn Demo xem trước trực tiếp khi click chọn hiệu ứng');
} else {
  console.warn('    ⚠️ Không tìm thấy clickTransOld');
}

// 3e. Cập nhật xem trước thời gian thực khi tua qua điểm chuyển cảnh (ne)
console.log('  -> [3e] Cập nhật xem trước thời gian thực khi tua qua điểm nối...');
const neOld = 'const Ve=he===0?Re:ie,$e=he===0?ie:Re;Ve&&(!Ve.src.endsWith(b.segment.url)&&Ve.src!==b.segment.url&&(Ve.src=b.segment.url,he===0?Ke(b.segment.url):we(b.segment.url)),Ve.currentTime=Math.max(0,oe),v?(Ve.play().catch(()=>{}),$e&&$e.pause()):(Ve.pause(),$e&&$e.pause())),Oe(M,he)';

const neNew = `const Ve=he===0?Re:ie,$e=he===0?ie:Re;Ve&&(!Ve.src.endsWith(b.segment.url)&&Ve.src!==b.segment.url&&(Ve.src=b.segment.url,he===0?Ke(b.segment.url):we(b.segment.url)),Ve.currentTime=Math.max(0,oe),v?(Ve.play().catch(()=>{}),$e&&$e.pause()):(Ve.pause(),$e&&$e.pause())),Oe(M,he);const timeInClip=h-b.globalStart;const transEffect=transRef.current||le;if(M>0&&transEffect&&transEffect!=="none"&&timeInClip<=0.4){const prevItem=c[M-1];if($e&&prevItem){(!$e.src.endsWith(prevItem.segment.url)&&$e.src!==prevItem.segment.url)&&($e.src=prevItem.segment.url,he===0?we(prevItem.segment.url):Ke(prevItem.segment.url));$e.currentTime=prevItem.segment.endTime;const p=Math.max(0,Math.min(1,timeInClip/0.4));applyVidTransition($e,Ve,transEffect,p)}}else{resetVidStyles(Ve,$e)}`;

if (vsCode.includes(neOld)) {
  vsCode = vsCode.replace(neOld, neNew);
  console.log('    ✓ Đã cập nhật xem trước chuyển cảnh realtime khi tua');
} else {
  console.warn('    ⚠️ Không tìm thấy neOld');
}

// Lưu file
fs.writeFileSync(vsPath, vsCode, 'utf8');
console.log('  ✓ Đã lưu VideoStudio-frcr8V6s.js thành công!');

// 4. Kiểm tra cú pháp
console.log('\n[4/5] Kiểm tra cú pháp JavaScript...');
execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
console.log('  ✅ Cú pháp JavaScript VideoStudio-frcr8V6s.js: HOÀN TOÀN CHUẨN XÁC!');

console.log('\n🌟 ĐÃ CẬP NHẬT HOÀN HẢO MÔ ĐUN BIÊN TẬP & CHUYỂN CẢNH VIDEO! 🌟');
