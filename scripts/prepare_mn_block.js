const fs = require('fs');

const origMn = fs.readFileSync('original_mn_exact.js', 'utf8');

// In origMn, replace:
// const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{const{t:o}=Ke(),b=He(i=>i.assets),S=He(i=>i.sync),f=B(i=>i.lastExportedVideoAssetId),I=B(i=>i.setLastExportedVideoAssetId),
// with:
// const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{const{t:o}=Ke(),b=(He(i=>i.assets)||[]),S=He(i=>i.sync)||(async()=>{}),[f,I]=l.useState(null),

const targetStart = 'const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{const{t:o}=Ke(),b=He(i=>i.assets),S=He(i=>i.sync),f=B(i=>i.lastExportedVideoAssetId),I=B(i=>i.setLastExportedVideoAssetId),';
const replacementStart = 'const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{const{t:o}=Ke(),b=(He(i=>i.assets)||[]),S=He(i=>i.sync)||(async()=>{}),[f,I]=l.useState(null),';

if (!origMn.includes(targetStart)) {
  console.error('targetStart not found in original_mn_exact.js!');
  process.exit(1);
}

const patchedMn = origMn.replace(targetStart, replacementStart);

const helpersAndIcons = `
// ==================== AIFORGE VIDEO EDITOR HELPERS & ICONS ====================
function fo(s){if(!s)return null;const r=s.trim().match(/^(\\d+(?:\\.\\d+)?)\\s*:\\s*(\\d+(?:\\.\\d+)?)$/);if(!r)return null;const n=Number(r[1]),o=Number(r[2]);return!Number.isFinite(n)||!Number.isFinite(o)||n<=0||o<=0?null:n/o}
function dn(s,r){return s==="16:9"?16/9:s==="9:16"?9/16:s==="1:1"?1:Number.isFinite(r)&&r>0?r:16/9}
const go=220,bo=260,_s=420,vo=180,cn=280;
function zs(s,r,n){return Math.min(Math.max(s,r),Math.max(r,n))}
function rt(s){if(!Number.isFinite(s)||s<0)return"00:00.00";const r=Math.floor(s/60),n=Math.floor(s%60),o=Math.floor(s%1*100);return\`\${String(r).padStart(2,"0")}:\${String(n).padStart(2,"0")}.\${String(o).padStart(2,"0")}\`}
function Us(){const s=new Date,r=\`\${s.getFullYear()}\${String(s.getMonth()+1).padStart(2,"0")}\${String(s.getDate()).padStart(2,"0")}\`,n=\`\${String(s.getHours()).padStart(2,"0")}\${String(s.getMinutes()).padStart(2,"0")}\${String(s.getSeconds()).padStart(2,"0")}\`;return\`AIForge_Video_\${r}_\${n}.mp4\`}
function un(s){const r=s.trim().replace(/[\\\\/:*?"<>|]+/g,"-").replace(/\\.+$/g,"");return r?r.toLowerCase().endsWith(".mp4")?r:\`\${r}.mp4\`:Us()}
function wo(s){if(!s||!Number.isFinite(s)||s<=0)return"—";const r=["B","KB","MB","GB"],n=Math.min(Math.floor(Math.log(s)/Math.log(1024)),r.length-1);return\`\${(s/1024**n).toFixed(n===0?0:1)} \${r[n]}\`}
function jo(s){if(!s)return"—";const r=new Date(s);return Number.isNaN(r.getTime())?"—":new Intl.DateTimeFormat(void 0,{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit"}).format(r)}
const Ws=new Set;
function Ht(s){return s?new Promise(r=>{const n=typeof document!=="undefined"?document.createElement("video"):null;if(!n)return r({duration:null,aspectRatio:null,width:null,height:null});n.preload="metadata",n.muted=!0;let o=!1;const b=(f,I,L,E)=>{o||(o=!0,clearTimeout(S),n.onloadedmetadata=null,n.onerror=null,n.src="",n.load(),Ws.delete(s),r({duration:f,aspectRatio:I,width:L,height:E}))},S=setTimeout(()=>{b(null,null,null,null)},3e3);n.onloadedmetadata=()=>{const f=n.duration,I=Number.isFinite(f)&&f>0?Number(f.toFixed(3)):null,L=n.videoWidth>0&&n.videoHeight>0?n.videoWidth/n.videoHeight:null;b(I,L,n.videoWidth||null,n.videoHeight||null)},n.onerror=()=>{b(null,null,null,null)},n.src=s}):Promise.resolve({duration:null,aspectRatio:null,width:null,height:null})}
function yo(s,r){let n=!1;const o=()=>{n||(n=!0,r())};typeof s.requestVideoFrameCallback=="function"&&s.requestVideoFrameCallback(()=>o());const b=()=>{s.removeEventListener("timeupdate",b),s.removeEventListener("playing",b),o()};s.addEventListener("timeupdate",b,{once:!0}),s.addEventListener("playing",b,{once:!0}),setTimeout(o,60)}

const qe = (name, children) => {
  return ({ className = "w-4 h-4", size = 16, style, ...props }) => {
    return e.jsx("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: \`lucide lucide-\${name.toLowerCase()} \${className}\`,
      style,
      ...props,
      children: children.map(([tag, attrs], idx) => e.jsx(tag, { key: attrs.key || idx, ...attrs }))
    });
  };
};

const Ci = qe("Ratio", [["rect", { width: "12", height: "20", x: "6", y: "2", rx: "2", key: "1oxtiu" }], ["rect", { width: "20", height: "12", x: "2", y: "6", rx: "2", key: "9lu3g6" }]]);
const cs = qe("FileVideo2", [["path", { d: "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4", key: "1pf5j1" }], ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }], ["rect", { width: "8", height: "6", x: "2", y: "12", rx: "1", key: "1m42n1" }], ["path", { d: "m18 19 4-2v-4l-4 2", key: "1yv5q8" }]]);
const Ho = qe("SkipBack", [["polygon", { points: "19 20 9 12 19 4 19 20", key: "o2sva" }], ["line", { x1: "5", x2: "5", y1: "19", y2: "5", key: "1ocqjk" }]]);
const Si = qe("ChevronsLeft", [["path", { d: "m11 17-5-5 5-5", key: "13zhaf" }], ["path", { d: "m18 17-5-5 5-5", key: "h8a8et" }]]);
const Ni = qe("ChevronsRight", [["path", { d: "m6 17 5-5-5-5", key: "xnjwq" }], ["path", { d: "m13 17 5-5-5-5", key: "17xmmf" }]]);
const Qo = qe("SkipForward", [["polygon", { points: "5 4 15 12 5 20 5 4", key: "16p6eg" }], ["line", { x1: "19", x2: "19", y1: "5", y2: "19", key: "futhcm" }]]);
const qo = qe("VolumeX", [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.384 3.384a.705.705 0 0 0 1.203-.498z", key: "1sdbhc" }], ["line", { x1: "22", x2: "16", y1: "9", y2: "15", key: "123f3" }], ["line", { x1: "16", x2: "22", y1: "9", y2: "15", key: "t6v1k3" }]]);
const Po = qe("Volume2", [["path", { d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.384 3.384a.705.705 0 0 0 1.203-.498z", key: "1sdbhc" }], ["path", { d: "M16 9a5 5 0 0 1 0 6", key: "1v7twn" }], ["path", { d: "M19.364 5.636a9 9 0 0 1 0 12.728", key: "17p9nx" }]]);
const ji = qe("CalendarDays", [["path", { d: "M8 2v4", key: "1cmpym" }], ["path", { d: "M16 2v4", key: "4m81vk" }], ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "12lehv" }], ["path", { d: "M3 10h18", key: "8toen8" }], ["path", { d: "M8 14h.01", key: "6423bv" }], ["path", { d: "M12 14h.01", key: "1etili" }], ["path", { d: "M16 14h.01", key: "162v1n" }], ["path", { d: "M8 18h.01", key: "lrp35t" }], ["path", { d: "M12 18h.01", key: "1s22x8" }], ["path", { d: "M16 18h.01", key: "1j305b" }]]);
const ki = qe("Magnet", [["path", { d: "m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15", key: "1i3lhw" }], ["path", { d: "m5 8 4 4", key: "1a8q6b" }], ["path", { d: "m12 15 4 4", key: "1x11f4" }]]);
const _e = qe("Film", [["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }], ["path", { d: "M7 3v18", key: "bbkbws" }], ["path", { d: "M3 7.5h4", key: "zfgn84" }], ["path", { d: "M3 12h18", key: "1i2n21" }], ["path", { d: "M3 16.5h4", key: "wzfb4c" }], ["path", { d: "M17 3v18", key: "1v717p" }], ["path", { d: "M17 7.5h4", key: "10h9g1" }], ["path", { d: "M17 16.5h4", key: "11y6g8" }]]);
const Cr = qe("ZoomOut", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]]);
const Pr = qe("ZoomIn", [["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }], ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }], ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }], ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]]);
const Js = qe("RefreshCw", [["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }], ["path", { d: "M21 3v5h-5", key: "1q7to0" }], ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "nmy99d" }], ["path", { d: "M8 16H3v5", key: "157ngc" }]]);
const ms = qe("X", [["path", { d: "M18 6 6 18", key: "1bl5f8" }], ["path", { d: "m6 6 12 12", key: "d8bk6v" }]]);
const Jt = qe("Sparkles", [["path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z", key: "18b95" }]]);
const ps = qe("Clock", [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }], ["polyline", { points: "12 6 12 12 16 14", key: "68esgv" }]]);
const it = qe("Copy", [["rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2", key: "17jyea" }], ["path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2", key: "1kvnsw" }]]);
const Xs = qe("ExternalLink", [["path", { d: "M15 3h6v6", key: "1q9fwt" }], ["path", { d: "M10 14 21 3", key: "gplh6r" }], ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "1tvdcj" }]]);
const us = qe("Download", [["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }], ["polyline", { points: "7 10 12 15 17 10", key: "2eqmzg" }], ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2eq" }]]);

const VN_TRANSLATIONS = {
  "videoStudio.miniEditorTitle": "Biên tập Video",
  "videoStudio.clipsCountLabel": "phân đoạn",
  "videoStudio.miniEditorSubtitle": "Kéo thả sắp xếp thứ tự trước - sau, cắt tỉa phân đoạn và tạo hiệu ứng chuyển cảnh",
  "videoStudio.libraryTab": "Kho Video",
  "videoStudio.transitionsTab": "Chuyển cảnh",
  "videoStudio.effectsCount": "10 HIỆU ỨNG",
  "videoStudio.transitionSelected": "Đã chọn hiệu ứng: {name}",
  "videoStudio.transitionNone": "Cắt thẳng",
  "videoStudio.transitionNoneDesc": "Không chuyển hiệu ứng (Nối tức thì)",
  "videoStudio.transitionDissolve": "Hòa tan",
  "videoStudio.transitionDissolveDesc": "Chồng mờ 2 khung hình",
  "videoStudio.transitionFade": "Mờ đen",
  "videoStudio.transitionFadeDesc": "Fade qua màu sáng rồi mở màn tiếp",
  "videoStudio.transitionFadeblack": "Fade đen",
  "videoStudio.transitionFadeblackDesc": "Nhoè màu khép màn mở cảnh",
  "videoStudio.transitionSlideleft": "Trượt trái",
  "videoStudio.transitionSlideleftDesc": "Cảnh sau chạy sang trái",
  "videoStudio.transitionSlideright": "Trượt phải",
  "videoStudio.transitionSliderightDesc": "Cảnh sau chạy sang phải",
  "videoStudio.transitionWipeleft": "Lướt trái",
  "videoStudio.transitionWipeleftDesc": "Quét màn hình sang trái",
  "videoStudio.transitionWiperight": "Lướt phải",
  "videoStudio.transitionWiperightDesc": "Quét màn hình sang phải",
  "videoStudio.transitionCircleopen": "Nở vòng tròn",
  "videoStudio.transitionCircleopenDesc": "Nở rộng từ tâm",
  "videoStudio.transitionCircleclose": "Đóng vòng tròn",
  "videoStudio.transitionCirclecloseDesc": "Thu hẹp vào tâm",
  "videoStudio.selectedVideoDetails": "VIDEO ĐANG CHỌN",
  "videoStudio.noClipSelectedForPreview": "Chưa chọn phân đoạn nào để xem trước",
  "videoStudio.emptyPreviewHint": "Thêm clip từ kho video bên trái để bắt đầu xem trước và biên tập.",
  "videoStudio.undoButton": "Hoàn tác",
  "videoStudio.redoButton": "Làm lại",
  "videoStudio.splitButton": "Tách đoạn",
  "videoStudio.duplicateSegment": "Nhân bản phân đoạn",
  "videoStudio.deleteSegment": "Xóa phân đoạn (Ctrl+Delete)",
  "videoStudio.exportVideoButton": "Xuất video",
  "videoStudio.confirmExportVideoButton": "Xuất video",
  "videoStudio.exportingMergedVideo": "Đang xử lý & ghép video...",
  "videoStudio.emptyTimelineHint": "+ Chưa có phân đoạn nào trên timeline. Nhấp vào dấu (+) bên danh sách video để thêm.",
  "videoStudio.searchClipsPlaceholder": "Tìm video trong kho...",
  "videoStudio.noVideoAssetsFound": "Chưa có video nào trong thư viện",
  "videoStudio.addToTimelineTooltip": "Thêm vào timeline",
  "videoStudio.splitPositionInvalid": "Vị trí con trỏ không hợp lệ để tách đoạn.",
  "videoStudio.segmentSplitSuccess": "Đã tách phân đoạn thành công.",
  "videoStudio.segmentDuplicated": "Đã nhân bản phân đoạn.",
  "videoStudio.noSegmentsToMerge": "Timeline chưa có phân đoạn video nào để ghép.",
  "videoStudio.mergingVideoInProgress": "Đang tiến hành ghép nối video...",
  "videoStudio.mergeSuccessNotification": "Ghép video thành công! File đã được lưu vào thư viện.",
  "videoStudio.mergeFailedNotification": "Ghép video thất bại: {error}",
  "videoStudio.magnetLabel": "Nam châm",
  "videoStudio.magnetOnTooltip": "Hút dính từ tính: ĐANG BẬT",
  "videoStudio.magnetOffTooltip": "Hút dính từ tính: ĐANG TẮT",
  "videoStudio.viewLastExportedVideo": "Xem video vừa xuất",
  "videoStudio.lastExportedVideoTooltip": "Mở video vừa xuất gần nhất trong trình biên tập",
  "videoStudio.videoName": "Tên",
  "videoStudio.videoSize": "Dung lượng",
  "videoStudio.videoCreated": "Ngày tạo",
  "videoStudio.videoDimensions": "Kích thước",
  "videoStudio.videoDuration": "Thời lượng",
  "videoStudio.videoRatio": "Tỉ lệ",
  "videoStudio.videoFormat": "Định dạng",
  "videoStudio.videoPath": "Đường dẫn",
  "videoStudio.copyVideoPath": "Sao chép",
  "videoStudio.openVideoFile": "Mở video trên máy",
  "videoStudio.openVideoFolder": "Mở thư mục",
  "videoStudio.videoOpened": "Đã mở video trên máy.",
  "videoStudio.videoOpenFailed": "Không thể mở file video.",
  "videoStudio.videoPathCopied": "Đã sao chép đường dẫn video.",
  "videoStudio.videoFolderOpened": "Đã mở thư mục video.",
  "videoStudio.exportReadyLabel": "Xuất video hoàn tất",
  "videoStudio.exportReadyDescription": "Cửa sổ biên tập vẫn mở để bạn kiểm tra kết quả trước khi lưu hoặc đóng.",
  "videoStudio.exportFileNameLabel": "Tên file video",
  "videoStudio.exportOriginalHint": "Video xuất luôn được giữ trong Thư viện Tệp. Khi lưu bản sao, ứng dụng sẽ mở hộp chọn thư mục thay vì tự động lưu vào Downloads.",
  "videoStudio.savingExportVideo": "Đang lưu…",
  "videoStudio.saveExportVideoButton": "Lưu vào thư mục",
  "videoStudio.chooseExportFolderTitle": "Chọn thư mục lưu video xuất",
  "videoStudio.exportDestinationUnavailable": "Không thể chọn hoặc lưu vào nơi xuất video.",
  "videoStudio.videoSavedToFolder": "Đã lưu video vào thư mục: {path}",
  "videoStudio.originalRatio": "Original",
  "videoStudio.undoShortcutTooltip": "Hoàn tác (Ctrl+Z)",
  "videoStudio.redoShortcutTooltip": "Làm lại (Ctrl+Y)",
  "videoStudio.splitShortcutHint": "Tách phân đoạn tại vị trí con trỏ (Phím S)",
  "common.close": "Đóng",
  "common.error": "Lỗi"
};

const m = (key, params) => {
  let val = VN_TRANSLATIONS[key] || key;
  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      val = val.replace(new RegExp(\`\\\\{\${k}\\\\}\`, 'g'), v);
    }
  }
  return val;
};
const Ke = () => ({ t: m });

// Bridge tokens for mn component
const l = h;
const cr = h;
const A = B;
const He = (fn) => typeof bs === "function" ? bs(fn) : fn({ assets: [], sync: async () => {} });

${patchedMn}
`;

console.log('Helpers and mn generated successfully, length:', helpersAndIcons.length);
fs.writeFileSync('scripts/generated_mn_block.js', helpersAndIcons, 'utf8');
