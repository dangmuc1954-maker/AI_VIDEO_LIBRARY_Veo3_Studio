const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🎬 TÍCH HỢP HIỆU ỨNG CHUYỂN CẢNH REALTIME & GHÉP VIDEO TỰ ĐỘNG 🎬');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const appRendererAssets = path.join(rootDir, 'app/out/renderer/assets');
const userUnpackedAssets = path.join(rootDir, 'scratch/user_payload_unpacked/resources/app/out/renderer/assets');

// 1. Sao chép aiforge_video_editor_automerge.js
console.log('[1/4] Sao chép mô-đun aiforge_video_editor_automerge.js chuẩn từ backup Tris...');
const srcAutomerge = path.join(userUnpackedAssets, 'aiforge_video_editor_automerge.js');
const destAutomerge = path.join(appRendererAssets, 'aiforge_video_editor_automerge.js');
if (fs.existsSync(srcAutomerge)) {
  fs.copyFileSync(srcAutomerge, destAutomerge);
  console.log('  ✓ Đã sao chép aiforge_video_editor_automerge.js thành công');
} else {
  console.error('  ❌ Không tìm thấy file nguồn:', srcAutomerge);
  process.exit(1);
}

// 2. Cập nhật index.html nạp aiforge_video_editor_automerge.js
console.log('[2/4] Kiểm tra và nhúng aiforge_video_editor_automerge.js vào index.html...');
const htmlPath = path.join(rootDir, 'app/out/renderer/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes('aiforge_video_editor_automerge.js')) {
  html = html.replace(
    '<script type="module" crossorigin src="./assets/index-BS7vgKVV.js"></script>',
    '<script type="module" crossorigin src="./assets/index-BS7vgKVV.js"></script>\n    <script type="module" src="./assets/aiforge_video_editor_automerge.js"></script>'
  );
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('  ✓ Đã nhúng script aiforge_video_editor_automerge.js vào index.html');
} else {
  console.log('  [-] index.html đã có sẵn thẻ script');
}

// 3. Nâng cấp VideoStudio-frcr8V6s.js với bộ Engine chuyển cảnh Realtime
console.log('[3/4] Cấy ghép bộ Engine hoạt họa chuyển cảnh thời gian thực vào VideoStudio-frcr8V6s.js...');
const vsPath = path.join(appRendererAssets, 'VideoStudio-frcr8V6s.js');
let vsCode = fs.readFileSync(vsPath, 'utf8');

// 3a. Chèn hàm applyVidTransition & resetVidStyles vào đầu file
const TRANSITION_ENGINE_CODE = `
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

if (!vsCode.includes('function applyVidTransition')) {
  vsCode = TRANSITION_ENGINE_CODE + '\n' + vsCode;
  console.log('  ✓ Đã chèn hàm applyVidTransition & resetVidStyles vào VideoStudio');
}

// 3b. Khởi tạo transRef và activeTransitionRef trong modal
// Anchor: wt=l.useRef(null);
const refAnchor = 'wt=l.useRef(null);';
const newRefs = 'wt=l.useRef(null),transRef=l.useRef("none"),activeTransitionRef=l.useRef(null);';
if (vsCode.includes(refAnchor) && !vsCode.includes('activeTransitionRef=l.useRef')) {
  vsCode = vsCode.replace(refAnchor, newRefs);
  console.log('  ✓ Đã khởi tạo transRef & activeTransitionRef');
}

// 3c. Cập nhật RAF loop để render hoạt họa chuyển cảnh mượt mà
const rafOld = 'const i=()=>{if(!Ie.current)return;const a=Ae.current===0?ue.current:pe.current,d=Se.current,h=be.current,c=d[h];if(a&&c&&!Ce.current&&a.readyState>=1){';
const rafNew = `const i=()=>{
  if(!Ie.current)return;
  if(activeTransitionRef.current){
    const trans=activeTransitionRef.current,elapsed=performance.now()-trans.startTime,prg=Math.min(1,elapsed/trans.duration);
    applyVidTransition(trans.fromVid,trans.toVid,trans.effect,prg);
    if(prg>=1){resetVidStyles(trans.toVid,trans.fromVid);activeTransitionRef.current=null;}
  }
  const a=Ae.current===0?ue.current:pe.current,d=Se.current,h=be.current,c=d[h];
  if(a&&c&&!Ce.current&&a.readyState>=1){`;

if (vsCode.includes(rafOld)) {
  vsCode = vsCode.replace(rafOld, rafNew);
  console.log('  ✓ Đã kết nối vòng lặp requestAnimationFrame với Engine chuyển cảnh');
} else {
  console.warn('  ⚠️ Không tìm thấy rafOld trong VideoStudio');
}

// 3d. Cập nhật chuyển đổi Player khi hết phân đoạn trong Kt
const switch0to1Old = 'Ps(M,()=>{Ae.current=1,gt(1),b&&b.pause(),Oe(d,1),Ce.current=!1})';
const switch0to1New = `Ps(M,()=>{
  Ae.current=1;gt(1);
  const eff=transRef.current||le;
  if(eff&&eff!=="none"){
    activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:600,fromVid:b,toVid:M};
    applyVidTransition(b,M,eff,0);
    setTimeout(()=>{b&&b.pause();},650);
  }else{
    activeTransitionRef.current=null;
    resetVidStyles(M,b);
    b&&b.pause();
  }
  Oe(d,1);Ce.current=!1;
})`;

const switch1to0Old = 'Ps(b,()=>{Ae.current=0,gt(0),M&&M.pause(),Oe(d,0),Ce.current=!1})';
const switch1to0New = `Ps(b,()=>{
  Ae.current=0;gt(0);
  const eff=transRef.current||le;
  if(eff&&eff!=="none"){
    activeTransitionRef.current={effect:eff,startTime:performance.now(),duration:600,fromVid:M,toVid:b};
    applyVidTransition(M,b,eff,0);
    setTimeout(()=>{M&&M.pause();},650);
  }else{
    activeTransitionRef.current=null;
    resetVidStyles(b,M);
    M&&M.pause();
  }
  Oe(d,0);Ce.current=!1;
})`;

if (vsCode.includes(switch0to1Old)) {
  vsCode = vsCode.replace(switch0to1Old, switch0to1New);
  console.log('  ✓ Đã gắn hiệu ứng chuyển cảnh khi chuyển Clip 0 -> Clip 1');
}
if (vsCode.includes(switch1to0Old)) {
  vsCode = vsCode.replace(switch1to0Old, switch1to0New);
  console.log('  ✓ Đã gắn hiệu ứng chuyển cảnh khi chuyển Clip 1 -> Clip 0');
}

// 3e. Cập nhật khi Click vào thẻ Chuyển cảnh: Kích hoạt DEMO TRỰC TIẾP trên màn hình Preview
const clickTransOld = 'onClick:()=>{A(i.id),z.success(u("videoStudio.transitionSelected",{name:i.label}))}';
const clickTransNew = `onClick:()=>{
  A(i.id);
  if(typeof transRef!=="undefined"&&transRef)transRef.current=i.id;
  z.success(u("videoStudio.transitionSelected",{name:i.label}));
  const curV=Ae.current===0?ue.current:pe.current;
  const nxtV=Ae.current===0?pe.current:ue.current;
  if(curV&&nxtV&&i.id!=="none"){
    activeTransitionRef.current={effect:i.id,startTime:performance.now(),duration:700,fromVid:curV,toVid:nxtV};
    applyVidTransition(curV,nxtV,i.id,0);
  }
}`;

if (vsCode.includes(clickTransOld)) {
  vsCode = vsCode.replace(clickTransOld, clickTransNew);
  console.log('  ✓ Đã kích hoạt tính năng xem trước trực tiếp (Live Preview Demo) ngay khi click chọn hiệu ứng');
}

// 3f. Reset transition khi tua timeline (scrubbing / step)
const seekOld = 'xe.current=h,de(h),_e(h);';
const seekNew = 'if(typeof activeTransitionRef!=="undefined"&&activeTransitionRef)activeTransitionRef.current=null;xe.current=h,de(h),_e(h);';
if (vsCode.includes(seekOld)) {
  vsCode = vsCode.replace(seekOld, seekNew);
  console.log('  ✓ Đã gắn hook làm sạch hiệu ứng khi tua phân đoạn');
}

fs.writeFileSync(vsPath, vsCode, 'utf8');
console.log('  ✓ Đã lưu VideoStudio-frcr8V6s.js hoàn tất.');

// 4. Kiểm tra cú pháp
console.log('\n[4/4] Kiểm tra cú pháp JavaScript bundle...');
execSync(`node --check "${vsPath}"`, { stdio: 'inherit' });
console.log('  ✅ VideoStudio-frcr8V6s.js: Cú pháp chuẩn xác 100%!');

console.log('\n🌟 ĐÃ CẬP NHẬT HOÀN HẢO PHẦN BIÊN TẬP & GHÉP VIDEO TỰ ĐỘNG! 🌟');
