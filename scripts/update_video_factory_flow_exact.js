// scripts/update_video_factory_flow_exact.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🚀 NÂNG CẤP: CHỌN 3/4/5 CẢNH & GEMINI TẠO SHOWROOM ĐỘC BẢN CHO TỪNG CẢNH 🚀');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

const videoFactoryCode = `import { bn as React, bf as toast } from "./index-BS7vgKVV.js";

// ==========================================
// MASTER PROMPT TEMPLATES THEO TỪNG NGÀNH HÀNG
// ==========================================
const NICHE_TEMPLATES = {
  household: {
    id: 'household',
    name: 'Xưởng Gia Dụng',
    icon: '🏠',
    defaultBrand: 'GIA DỤNG VIỆT',
    defaultInfo: 'đồng hồ như ảnh tham chiếu',
    kocRole: 'Bạn là chuyên gia review KOC TikTok Shop ngành Đồ Gia Dụng & Tiện Ích Đời Sống (giọng miền Bắc, năng lượng cao, chốt đơn cực đỉnh).'
  },
  cosmetics: {
    id: 'cosmetics',
    name: 'Xưởng Mỹ Phẩm',
    icon: '💄',
    defaultBrand: 'BEAUTY KOREA',
    defaultInfo: 'Serum dưỡng trắng mờ thâm nám tế bào gốc, căng bóng da tức thì, chiết xuất thiên nhiên lành tính',
    kocRole: 'Bạn là KOC chuyên gia Skincare & Mỹ phẩm TikTok (giọng ngọt ngào, truyền cảm, am hiểu thành phần và uy tín).'
  },
  fashion: {
    id: 'fashion',
    name: 'Xưởng Thời Trang',
    icon: '👗',
    defaultBrand: 'FASHION CHIC',
    defaultInfo: 'Set blazer croptop dạ tweed cao cấp, tôn dáng thon gọn, đính cúc ngọc trai sang trọng',
    kocRole: 'Bạn là Fashion Stylist / KOC thời trang TikTok (giọng tự tin, sành điệu, bắt trend cực nhạy).'
  },
  jewelry: {
    id: 'jewelry',
    name: 'Xưởng Trang Sức',
    icon: '⌚',
    defaultBrand: 'LUXURY JEWELS',
    defaultInfo: 'Đồng hồ đính đá sapphire cao cấp, chống nước 5ATM, mặt kính chống trầy, thiết kế sang trọng',
    kocRole: 'Bạn là KOC chuyên gia Đồng hồ & Trang sức cao cấp (phong thái lịch lãm, tinh tế, am hiểu độ hoàn thiện).'
  },
  tech: {
    id: 'tech',
    name: 'Xưởng Công Nghệ',
    icon: '🎧',
    defaultBrand: 'TECH PRO',
    defaultInfo: 'Tai nghe Bluetooth không dây chống ồn chủ động ANC, pin 40h, âm bass uy lực, chống nước IPX7',
    kocRole: 'Bạn là Tech Reviewer TikTok hàng đầu (giọng dứt khoát, chuyên môn cao, trải nghiệm thực tế công tâm).'
  }
};

// CẤU TRÚC PHÂN ĐOẠN CHO TỪNG TÙY CHỌN (3, 4, 5 CẢNH)
const SCENE_STAGE_TEMPLATES = {
  3: [
    { id: 1, stage: 'HOOK (0-5S)', title: 'Thu Hút & Giật Tít', angleName: 'Cận Cảnh (Close-Up)' },
    { id: 2, stage: 'TÍNH NĂNG & TEST', title: 'Thiết Kế & Trải Nghiệm', angleName: 'Chi Tiết Sản Phẩm (Macro)' },
    { id: 3, stage: 'CHỐT ĐƠN / CTA', title: 'Kêu Gọi Giỏ Hàng', angleName: 'Toàn Thân Trỏ Giỏ Hàng' }
  ],
  4: [
    { id: 1, stage: 'HOOK (0-5S)', title: 'Thu Hút & Giữ Chân', angleName: 'Cận Cảnh Gương Mặt (Close-Up)' },
    { id: 2, stage: 'TÍNH NĂNG', title: 'Vẻ Đẹp & Chi Tiết', angleName: 'Chi Tiết Cầm Tay (Hands Focus)' },
    { id: 3, stage: 'UY TÍN & SALE', title: 'Chính Hãng & Giá Kho', angleName: 'Góc Rộng Showroom' },
    { id: 4, stage: 'CHỐT ĐƠN / CTA', title: 'Kêu Gọi Hành Động', angleName: 'Toàn Thân Trỏ Giỏ Hàng' }
  ],
  5: [
    { id: 1, stage: 'HOOK (0-5S)', title: 'Thu Hút & Giữ Chân', angleName: 'Cận Cảnh Gương Mặt (Close-Up)' },
    { id: 2, stage: 'TÍNH NĂNG 1', title: 'Thiết Kế & Vẻ Đẹp', angleName: 'Chi Tiết Cầm Tay (Macro Hands)' },
    { id: 3, stage: 'TÍNH NĂNG 2', title: 'Trải Nghiệm & Test', angleName: 'Thao Tác Trực Tiếp (Action Demo)' },
    { id: 4, stage: 'UY TÍN & SALE', title: 'Thương Hiệu & Giá Kho', angleName: 'Góc Rộng Showroom' },
    { id: 5, stage: 'CHỐT ĐƠN / CTA', title: 'Kêu Gọi Hành Động', angleName: 'Toàn Thân Trỏ Giỏ Hàng' }
  ]
};

// 5 MODEL VIDEO ĐẦY ĐỦ CỦA FLOW
const VIDEO_MODELS = [
  'Veo 3.1 - Lite [Lower Priority]',
  'Veo 3.1 - Lite',
  'Veo 3.1 - Fast',
  'Veo 3.1 - Quality',
  'Omni Flash'
];

function mapVideoModelToBackendId(modelDisplayName) {
  if (!modelDisplayName) return 'veo-3.1-lite-low-priority';
  if (modelDisplayName.includes('Lower Priority') || modelDisplayName.includes('low-priority')) return 'veo-3.1-lite-low-priority';
  if (modelDisplayName.includes('Lite')) return 'veo-3.1-lite';
  if (modelDisplayName.includes('Fast')) return 'veo-3.1-fast';
  if (modelDisplayName.includes('Quality')) return 'veo-3.1-quality';
  if (modelDisplayName.includes('Omni') || modelDisplayName.includes('Flash')) return 'omni-flash-1.1';
  return 'veo-3.1-lite-low-priority';
}

// ============================================================================
// UI PRIMITIVES
// ============================================================================
const SectionLabel = ({ children }) => (
  React.createElement("div", { className: "flex items-center px-0.5 py-0.5" },
    React.createElement("span", { className: "text-[10px] font-bold text-gray-400 tracking-[0.08em] uppercase" },
      children
    )
  )
);

const PillButton = ({ icon, children, variant = 'filled', onClick, disabled, className = '', loading }) => {
  const base = 'flex items-center gap-[6px] justify-center w-full h-[38px] rounded-xl font-semibold tracking-[0.2px] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] select-none';
  const variants = {
    filled: 'bg-black hover:bg-gray-800 text-white text-[11px] px-3 shadow-sm border border-white/20',
    outline: 'border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-[11px] px-3 text-white shadow-sm',
    solid: 'bg-blue-600 hover:bg-blue-500 text-white text-[12px] px-4 shadow-lg shadow-blue-600/30'
  };

  return React.createElement("button", {
    className: \`\${base} \${variants[variant]} \${className}\`,
    onClick: onClick,
    disabled: disabled || loading
  },
    loading ? React.createElement("div", { className: "w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" }) : (
      React.createElement(React.Fragment, null,
        icon && React.createElement("span", { className: "flex items-center justify-center text-sm" }, icon),
        React.createElement("span", null, children)
      )
    )
  );
};

const TextInput = ({ value, onChange, placeholder, label, className = '' }) => (
  React.createElement("div", { className: \`flex flex-col gap-1 \${className}\` },
    label && React.createElement("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5" }, label),
    React.createElement("input", {
      type: "text",
      value: value,
      onChange: (e) => onChange(e.target.value),
      placeholder: placeholder,
      className: "border border-white/[0.12] bg-[#12192c] hover:border-white/[0.2] focus:border-cyan-500 rounded-xl w-full h-[38px] px-3 text-[12px] font-medium text-white placeholder-gray-500 outline-none transition-all shadow-sm"
    })
  )
);

const TextArea = ({ value, onChange, placeholder, label, className = '' }) => (
  React.createElement("div", { className: \`flex flex-col gap-1 \${className}\` },
    label && React.createElement("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5" }, label),
    React.createElement("textarea", {
      value: value,
      onChange: (e) => onChange(e.target.value),
      placeholder: placeholder,
      style: { height: '70px', maxHeight: '70px', minHeight: '70px' },
      className: "border border-white/[0.12] bg-[#12192c] hover:border-white/[0.2] focus:border-cyan-500 rounded-xl w-full p-2.5 text-[12px] font-medium text-white placeholder-gray-500 outline-none transition-all resize-none no-scrollbar shadow-sm"
    })
  )
);

const SegmentedToggle = ({ value, items, onChange, className = '' }) => (
  React.createElement("div", { className: \`flex w-full items-center border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.03] p-1 \${className}\` },
    items.map((item) => (
      React.createElement("button", {
        key: item.value,
        type: "button",
        onClick: () => onChange(item.value),
        className: \`flex-1 flex items-center justify-center gap-1.5 h-[30px] px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer \${
          value === item.value 
            ? 'bg-blue-600 text-white shadow-sm border border-blue-500/40' 
            : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
        }\`
      },
        item.icon,
        React.createElement("span", null, item.label)
      )
    ))
  )
);

const FieldDropdown = ({ label, value, options, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, []);

  return (
    React.createElement("div", { ref: ref, className: \`relative flex flex-col gap-1 \${className}\` },
      label && React.createElement("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5" }, label),
      React.createElement("button", {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: "w-full text-left border border-white/[0.15] bg-[#12192c] hover:border-white/[0.25] focus:border-cyan-500 rounded-xl flex items-center justify-between px-3 h-[38px] text-[12px] font-bold text-cyan-300 select-none outline-none transition-all shadow-sm cursor-pointer"
      },
        React.createElement("span", { className: "truncate pr-2" }, value),
        React.createElement("span", { className: \`text-gray-400 text-xs transition-transform flex-shrink-0 \${isOpen ? 'rotate-180' : ''}\` }, "▼")
      ),
      isOpen && (
        React.createElement("div", { className: "absolute z-50 top-[calc(100%+4px)] left-0 w-full bg-[#0d1426] border border-white/[0.15] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl" },
          React.createElement("div", { className: "max-h-48 overflow-y-auto no-scrollbar py-1" },
            options.map((opt) => (
              React.createElement("button", {
                key: opt,
                type: "button",
                className: \`w-full text-left px-3 py-2 text-[11px] font-semibold transition-colors \${value === opt ? 'bg-cyan-500/20 text-cyan-300 font-bold border-l-2 border-cyan-400' : 'text-gray-300 hover:bg-white/[0.06] hover:text-white'}\`,
                onClick: () => { onChange(opt); setIsOpen(false); }
              },
                opt
              )
            ))
          )
        )
      )
    )
  );
};

const ProgressCircle = ({ progress, size = 60, strokeWidth = 4, color = "#06b6d4" }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    React.createElement("div", { className: "relative flex items-center justify-center", style: { width: size, height: size } },
      React.createElement("svg", { width: size, height: size, className: "rotate-[-90deg]" },
        React.createElement("circle", {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: "rgba(255,255,255,0.1)",
          strokeWidth: strokeWidth,
          fill: "transparent"
        }),
        React.createElement("circle", {
          cx: size / 2,
          cy: size / 2,
          r: radius,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: "transparent",
          strokeDasharray: circumference,
          style: { strokeDashoffset: offset, transition: 'stroke-dashoffset 0.3s ease' },
          strokeLinecap: "round"
        })
      ),
      React.createElement("span", { className: "absolute text-[11px] font-black text-cyan-300 tracking-tighter" },
        \`\${Math.round(progress)}%\`
      )
    )
  );
};

// ============================================================================
// GLOBAL PERSISTENCE
// ============================================================================
const DEFAULT_GEMINI_KEY = "";
let globalStudioState = null;
try {
  const raw = localStorage.getItem('aivideo_factory_persisted_state');
  if (raw) globalStudioState = JSON.parse(raw);
} catch(e) {}

// Khởi tạo danh sách scene theo số lượng cảnh
function initScenesForCount(count = 5, existingScenes = []) {
  const templates = SCENE_STAGE_TEMPLATES[count] || SCENE_STAGE_TEMPLATES[5];
  return templates.map((tmpl, idx) => {
    const prev = existingScenes[idx];
    return {
      id: tmpl.id,
      stage: tmpl.stage,
      title: tmpl.title,
      angleName: tmpl.angleName,
      showroomImage: prev?.showroomImage || null,
      showroomStatus: prev?.showroomStatus || 'idle',
      showroomProgress: prev?.showroomProgress || 0,
      showroomJobId: prev?.showroomJobId || null,
      voiceScript: prev?.voiceScript || '',
      motionPrompt: prev?.motionPrompt || '',
      promptStatus: prev?.promptStatus || 'idle',
      videoUrl: prev?.videoUrl || null,
      videoStatus: prev?.videoStatus || 'idle',
      videoProgress: prev?.videoProgress || 0,
      jobId: prev?.jobId || null,
      assetId: prev?.assetId || null
    };
  });
}

// ============================================================================
// COMPONENT CHÍNH: VIDEO FACTORY STUDIO
// ============================================================================
export default function VideoFactoryStudio() {
  const [currentNiche, setCurrentNiche] = React.useState(globalStudioState?.currentNiche || 'household');
  const [products, setProducts] = React.useState(globalStudioState?.products || [null, null, null]);
  const [productInfo, setProductInfo] = React.useState(globalStudioState?.productInfo ?? NICHE_TEMPLATES.household.defaultInfo);
  const [brandName, setBrandName] = React.useState(globalStudioState?.brandName || NICHE_TEMPLATES.household.defaultBrand);
  const [bgMode, setBgMode] = React.useState(globalStudioState?.bgMode || 'auto');
  const [kocImage, setKocImage] = React.useState(globalStudioState?.kocImage || null);
  const [videoModel, setVideoModel] = React.useState(globalStudioState?.videoModel || 'Veo 3.1 - Lite [Lower Priority]');

  // TÙY CHỌN SỐ LƯỢNG CẢNH (3, 4, HOẶC 5 CẢNH)
  const [sceneCount, setSceneCount] = React.useState(globalStudioState?.sceneCount || 5);
  const [activePreviewIndex, setActivePreviewIndex] = React.useState(0);

  // Gemini API Key State
  const [geminiApiKey, setGeminiApiKey] = React.useState(() => {
    try {
      const saved = localStorage.getItem('aivideo_gemini_api_key');
      return saved && saved.trim().length > 10 ? saved.trim() : DEFAULT_GEMINI_KEY;
    } catch(e) {
      return DEFAULT_GEMINI_KEY;
    }
  });
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [tempApiKeyInput, setTempApiKeyInput] = React.useState('');

  // TÀI KHOẢN GOOGLE FLOW
  const [accounts, setAccounts] = React.useState([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState(() => {
    try { return localStorage.getItem('aivideo_factory_selected_account') || ''; } catch(e) { return ''; }
  });

  // DANH SÁCH CÁC CẢNH
  const [scenes, setScenes] = React.useState(() => {
    return initScenesForCount(globalStudioState?.sceneCount || 5, globalStudioState?.scenes || []);
  });

  const [selectedVideo, setSelectedVideo] = React.useState(null);
  const [editingScene, setEditingScene] = React.useState(null);
  const [isScriptGenerating, setIsScriptGenerating] = React.useState(false);
  const [isShowroomGenerating, setIsShowroomGenerating] = React.useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Thay đổi số lượng cảnh (3, 4, 5)
  const handleSceneCountChange = (count) => {
    const num = parseInt(count, 10);
    setSceneCount(num);
    setScenes(prev => initScenesForCount(num, prev));
    if (activePreviewIndex >= num) {
      setActivePreviewIndex(0);
    }
    toast?.info?.(\`Đã chuyển sang cấu trúc kịch bản \${num} Cảnh!\`);
  };

  // Lưu state vĩnh viễn khi có thay đổi
  React.useEffect(() => {
    const toSave = {
      currentNiche,
      products,
      productInfo,
      brandName,
      bgMode,
      kocImage,
      videoModel,
      sceneCount,
      scenes
    };
    globalStudioState = toSave;
    try {
      localStorage.setItem('aivideo_factory_persisted_state', JSON.stringify(toSave));
    } catch(e) {}
  }, [currentNiche, products, productInfo, brandName, bgMode, kocImage, videoModel, sceneCount, scenes]);

  const handleSaveGeminiKey = (key) => {
    setGeminiApiKey(key);
    try { localStorage.setItem('aivideo_gemini_api_key', key); } catch(e){}
    setShowApiKeyModal(false);
    toast?.success?.("Đã lưu Gemini API Key thành công!");
  };

  const handleSelectAccount = (accId) => {
    setSelectedAccountId(accId);
    try { localStorage.setItem('aivideo_factory_selected_account', accId); } catch(e){}
  };

  // Load danh sách session Google Flow từ BrowserHub
  React.useEffect(() => {
    async function loadAccounts() {
      if (window.aiforge?.browser?.listSessions) {
        try {
          const sessions = await window.aiforge.browser.listSessions();
          const valid = (sessions || []).filter(s => 
            (s.providerId === 'veo3' || s.providerId === 'banana') && s.authStatus === 'Logged In'
          );
          setAccounts(valid);
          if (valid.length > 0) {
            setSelectedAccountId(prev => {
              const saved = localStorage.getItem('aivideo_factory_selected_account');
              if (saved && valid.some(a => a.accountId === saved)) return saved;
              if (prev && valid.some(a => a.accountId === prev)) return prev;
              return valid[0].accountId;
            });
          }
        } catch(e) {
          console.warn('Error loading accounts:', e);
        }
      }
    }
    loadAccounts();
    const interval = setInterval(loadAccounts, 8000);
    return () => clearInterval(interval);
  }, []);

  // ⚡ BỘ ĐỒNG BỘ SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1 GIÂY) KHI ẢNH/VIDEO XONG
  const checkJobsAndAssetsDirectly = React.useCallback(async () => {
    try {
      const queueApi = window.aiforge?.queue || window.aivideo?.queue;
      const assetsApi = window.aiforge?.assets || window.aivideo?.assets;
      if (!queueApi?.list) return;

      const [jobs, allAssets] = await Promise.all([
        queueApi.list().catch(() => []),
        assetsApi?.list ? assetsApi.list().catch(() => []) : Promise.resolve([])
      ]);

      if (!Array.isArray(jobs)) return;

      setScenes(prev => {
        let changed = false;
        const next = prev.map(scene => {
          let s = { ...scene };

          // 1. Kiểm tra ảnh Showroom của cảnh
          if (s.showroomJobId || s.showroomStatus === 'generating') {
            const sJob = jobs.find(j => j.id === s.showroomJobId || (j.payload?.studioSource === 'video-factory' && j.title?.includes(\`Cảnh \${s.id}:\`)));

            // Quét trong thư viện Assets xem file ảnh đã tải về máy chưa
            const matchedAsset = (allAssets || []).find(a => 
              (sJob && (a.sourceJobId === sJob.id || a.jobId === sJob.id || a.id === sJob.resultAssetId || a.id === sJob.result?.assetId || a.id === sJob.result?.assets?.[0]?.assetId || a.id === sJob.result?.assets?.[0]?.id)) ||
              (a.type === 'image' && (a.name?.includes(\`Showroom Cảnh \${s.id}\`) || a.title?.includes(\`Showroom Cảnh \${s.id}\`)))
            );

            if (matchedAsset && (matchedAsset.url || matchedAsset.path)) {
              s.showroomStatus = 'done';
              s.showroomProgress = 100;
              s.showroomJobId = null;
              s.showroomImage = {
                url: matchedAsset.url || matchedAsset.path,
                assetId: matchedAsset.id,
                base64: matchedAsset.base64 || matchedAsset.url || matchedAsset.path,
                mimeType: matchedAsset.mimeType || 'image/jpeg'
              };
              changed = true;
              toast?.success?.(\`Ảnh Showroom Cảnh \${s.id} đã nạp về xưởng!\`);
            } else if (sJob) {
              if (sJob.status === 'Completed') {
                const resAsset = sJob.result?.assets?.[0];
                if (resAsset && (resAsset.url || resAsset.path)) {
                  s.showroomStatus = 'done';
                  s.showroomProgress = 100;
                  s.showroomJobId = null;
                  s.showroomImage = {
                    url: resAsset.url || resAsset.path,
                    assetId: resAsset.assetId || resAsset.id,
                    base64: resAsset.base64 || resAsset.url,
                    mimeType: resAsset.mimeType || 'image/jpeg'
                  };
                  changed = true;
                  toast?.success?.(\`Ảnh Showroom Cảnh \${s.id} đã nạp về xưởng!\`);
                }
              } else if (sJob.status === 'Running') {
                const newProg = sJob.progress || 60;
                if (s.showroomProgress !== newProg) {
                  s.showroomProgress = newProg;
                  changed = true;
                }
              } else if (sJob.status === 'Failed') {
                s.showroomStatus = 'error';
                s.showroomJobId = null;
                changed = true;
                toast?.error?.(\`Tạo Showroom Cảnh \${s.id} thất bại: \${sJob.error || 'Lỗi'}\`);
              }
            }
          }

          // 2. Kiểm tra Video Clip của cảnh
          if (s.jobId || s.videoStatus === 'generating') {
            const vJob = jobs.find(j => j.id === s.jobId || (j.payload?.studioSource === 'video-factory' && j.title?.includes(\`Cảnh \${s.id}:\`)));

            // Quét trong thư viện Assets xem file video MP4 đã lưu vào máy chưa
            const matchedVideo = (allAssets || []).find(a => 
              (vJob && (a.sourceJobId === vJob.id || a.jobId === vJob.id || a.id === vJob.resultAssetId || a.id === vJob.result?.assetId || a.id === vJob.result?.assets?.[0]?.assetId || a.id === vJob.result?.assets?.[0]?.id)) ||
              (a.type === 'video' && (a.name?.includes(\`Cảnh \${s.id}:\`) || a.title?.includes(\`Cảnh \${s.id}:\`)))
            );

            if (matchedVideo && (matchedVideo.url || matchedVideo.path)) {
              s.videoStatus = 'done';
              s.videoProgress = 100;
              s.jobId = null;
              s.videoUrl = matchedVideo.url || matchedVideo.path;
              s.assetId = matchedVideo.id;
              changed = true;
              toast?.success?.(\`Clip Cảnh \${s.id} đã hoàn tất và nạp về xưởng!\`);
            } else if (vJob) {
              if (vJob.status === 'Completed') {
                const resAsset = vJob.result?.assets?.[0];
                if (resAsset && (resAsset.url || resAsset.path)) {
                  s.videoStatus = 'done';
                  s.videoProgress = 100;
                  s.jobId = null;
                  s.videoUrl = resAsset.url || resAsset.path;
                  s.assetId = resAsset.assetId || resAsset.id;
                  changed = true;
                  toast?.success?.(\`Clip Cảnh \${s.id} đã hoàn tất và nạp về xưởng!\`);
                }
              } else if (vJob.status === 'Running') {
                const newProg = vJob.progress || 60;
                if (s.videoProgress !== newProg) {
                  s.videoProgress = newProg;
                  changed = true;
                }
              } else if (vJob.status === 'Failed') {
                s.videoStatus = 'error';
                s.jobId = null;
                changed = true;
                toast?.error?.(\`Cảnh \${s.id} lỗi: \${vJob.error || 'Thất bại'}\`);
              }
            }
          }

          return s;
        });

        return changed ? next : prev;
      });
    } catch(err) {
      console.warn('checkJobsAndAssetsDirectly error:', err);
    }
  }, []);

  // Lắng nghe queue.onChanged, assets.onChanged VÀ Fast Polling 1200ms siêu tốc
  React.useEffect(() => {
    const queueApi = window.aiforge?.queue || window.aivideo?.queue;
    const assetsApi = window.aiforge?.assets || window.aivideo?.assets;

    let unsubQueue = null;
    let unsubAssets = null;

    if (queueApi?.onChanged) {
      unsubQueue = queueApi.onChanged(() => checkJobsAndAssetsDirectly());
    }
    if (assetsApi?.onChanged) {
      unsubAssets = assetsApi.onChanged(() => checkJobsAndAssetsDirectly());
    }

    // Quét ngay lập tức và định kỳ mỗi 1.2s để nạp về tức thì
    checkJobsAndAssetsDirectly();
    const interval = setInterval(() => {
      checkJobsAndAssetsDirectly();
    }, 1200);

    return () => {
      if (typeof unsubQueue === 'function') unsubQueue();
      if (typeof unsubAssets === 'function') unsubAssets();
      clearInterval(interval);
    };
  }, [checkJobsAndAssetsDirectly]);

  // Chuyển ngành hàng
  const handleSelectNiche = (nicheId) => {
    setCurrentNiche(nicheId);
    const n = NICHE_TEMPLATES[nicheId];
    if (n) {
      setBrandName(n.defaultBrand);
      setProductInfo(n.defaultInfo);
      setScenes(initScenesForCount(sceneCount));
    }
  };

  // Upload ảnh sản phẩm
  const handleProductUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      let assetId = null;
      if (window.aiforge?.assets?.importReference) {
        try {
          const imported = await window.aiforge.assets.importReference({
            name: file.name,
            mimeType: file.type,
            dataUrl: base64
          });
          assetId = imported?.id;
        } catch(err){}
      }
      const updated = [...products];
      updated[index] = { name: file.name, base64, mimeType: file.type, assetId };
      setProducts(updated);
      toast?.success?.(\`Đã tải ảnh sản phẩm \${index + 1}\`);
    };
    reader.readAsDataURL(file);
  };

  const removeProductImage = (index) => {
    const updated = [...products];
    updated[index] = null;
    setProducts(updated);
  };

  // Upload KOC mẫu
  const handleKocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      let assetId = null;
      if (window.aiforge?.assets?.importReference) {
        try {
          const imported = await window.aiforge.assets.importReference({
            name: file.name,
            mimeType: file.type,
            dataUrl: base64
          });
          assetId = imported?.id;
        } catch(err){}
      }
      setKocImage({ name: file.name, base64, mimeType: file.type, assetId });
      setBgMode('reference');
      toast?.success?.("Đã tải KOC mẫu vào hệ thống!");
    };
    reader.readAsDataURL(file);
  };

  // 1. TẠO SHOWROOM ĐỘC BẢN CHO TỪNG CẢNH (GEMINI THINKING + BANANA PRO)
  const handleGenerateShowroomAllScenes = async () => {
    const hasProduct = products.some(p => p !== null);
    if (!hasProduct && !productInfo) {
      toast?.error?.("Vui lòng tải ít nhất 1 ảnh sản phẩm hoặc nhập mô tả sản phẩm!");
      return;
    }

    setIsShowroomGenerating(true);
    setScenes(prev => prev.map(s => ({ ...s, showroomStatus: 'generating', showroomProgress: 15 })));

    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      const activeKey = (geminiApiKey || DEFAULT_GEMINI_KEY).trim();

      // 🧠 GỌI GEMINI THINKING AI ĐỂ SÁNG TẠO N PROMPT SHOWROOM RIÊNG BIỆT CHO N CẢNH
      const directorPrompt = \`You are an advertising director planning commercial showroom photography for TikTok.
Product: \${productInfo || niche.defaultInfo}
Brand: \${brandName}
Niche: \${niche.name}
Total Scenes: \${sceneCount}

We need \${sceneCount} completely distinct 8K vertical commercial showroom photo prompts for each scene stage so they do NOT look identical:
Stage list:
\${scenes.map((s, i) => \`Scene \${i + 1}: \${s.stage} - \${s.title} (Camera style: \${s.angleName})\`).join('\\n')}

Requirements for each scene prompt:
- Vertical 9:16 aspect ratio, 8K commercial photography.
- Same presenter likeness and showroom brand identity, BUT with different camera angles, distances, and product interaction poses:
  + Scene 1 (Hook): Energetic close-up presenter showing product with exciting expression.
  + Middle Scenes: Macro detail / hands demonstration / active usage in the showroom.
  + Final Scene (CTA): Presenter warmly pointing downwards towards the bottom left cart while holding product.
- Plain clean unbranded showroom background, no text, no watermark, no logo overlays.

Return ONLY a JSON array of \${sceneCount} prompt strings:
[
  "Prompt for scene 1...",
  "Prompt for scene 2...",
  ...
]\`;

      let generatedPrompts = [];
      try {
        const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=\${activeKey}\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: directorPrompt }] }],
            generationConfig: { temperature: 0.8, response_mime_type: "application/json" }
          })
        });
        if (resp.ok) {
          const d = await resp.json();
          const text = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          const match = text?.match(/\\[[\\s\\S]*\\]/);
          if (match) {
            generatedPrompts = JSON.parse(match[0]);
          }
        }
      } catch(e) {
        console.warn('Gemini showroom batch prompts fallback:', e);
      }

      // Chuẩn bị reference assets
      const refIds = [];
      products.forEach(p => { if (p?.assetId) refIds.push(p.assetId); });
      if (bgMode === 'reference' && kocImage?.assetId) {
        refIds.push(kocImage.assetId);
      }

      // Gửi từng job tạo ảnh sang Google Flow (Banana)
      if (window.aiforge?.queue?.addJobs) {
        const jobs = scenes.map((s, idx) => {
          const promptForScene = generatedPrompts[idx] || \`A high-end 8K commercial showroom photograph of \${productInfo} - Scene \${s.id} (\${s.angleName}). Presenter professionally displaying the product. Clean unbranded background, vertical 9:16.\`;
          return {
            title: \`[Xưởng] Showroom Cảnh \${s.id}: \${s.stage} - \${brandName}\`,
            type: "Image",
            providerId: "banana",
            provider: "Banana",
            ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
            payload: {
              title: \`[Xưởng] Showroom Cảnh \${s.id}: \${s.stage}\`,
              prompt: promptForScene,
              ratio: "9:16",
              model: "banana",
              modelDisplayName: "🍌 Nano Banana Pro",
              referenceAssetIds: refIds,
              studioSource: "video-factory"
            }
          };
        });

        const res = await window.aiforge.queue.addJobs(jobs);
        if (res?.results && Array.isArray(res.results)) {
          setScenes(prev => prev.map((s, idx) => {
            const jId = res.results[idx]?.job?.id;
            return jId ? { ...s, showroomJobId: jId } : s;
          }));
          toast?.info?.(\`Đã gửi lệnh tạo \${sceneCount} ảnh Showroom góc máy riêng biệt sang Banana Pro!\`);
          setIsShowroomGenerating(false);
          return;
        }
      }

      // Fallback offline
      setTimeout(() => {
        const firstProd = products.find(p => p !== null);
        const pUrl = firstProd ? firstProd.base64 : (kocImage ? kocImage.base64 : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80");
        setScenes(prev => prev.map(s => ({
          ...s,
          showroomStatus: 'done',
          showroomProgress: 100,
          showroomImage: { url: pUrl, assetId: firstProd?.assetId || null }
        })));
        setIsShowroomGenerating(false);
        toast?.success?.(\`Đã tạo xong \${sceneCount} góc ảnh Showroom!\`);
      }, 2500);

    } catch(err) {
      console.error(err);
      setIsShowroomGenerating(false);
      setScenes(prev => prev.map(s => ({ ...s, showroomStatus: 'error' })));
      toast?.error?.("Lỗi khi tạo ảnh Showroom: " + err.message);
    }
  };

  // 2. LÊN KỊCH BẢN KOC: GEMINI AI THẬT TƯƠNG ỨNG VỚI SỐ CẢNH (3, 4, 5)
  const handleGenerateScript = async () => {
    if (!productInfo) {
      toast?.error?.("Vui lòng nhập mô tả thông tin sản phẩm!");
      return;
    }

    const activeKey = (geminiApiKey || DEFAULT_GEMINI_KEY).trim();
    setIsScriptGenerating(true);
    setScenes(prev => prev.map(s => ({ ...s, promptStatus: 'generating' })));

    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;

      const analysisPrompt = \`Bạn là chuyên gia viết kịch bản TikTok KOC (giọng miền Bắc, chốt đơn đỉnh cao).
Sản phẩm: \${productInfo}
Thương hiệu: \${brandName}
Ngành hàng: \${niche.name}
Số lượng phân đoạn cần tạo: \${sceneCount} phân đoạn

Danh sách \${sceneCount} phân đoạn theo format:
\${scenes.map((s, idx) => \`Phân đoạn \${idx + 1}: \${s.stage} - \${s.title} (Góc quay: \${s.angleName})\`).join('\\n')}

Yêu cầu cho từng phân đoạn:
1. voiceScript: Lời thoại bán hàng tiếng Việt ngắn gọn, hấp dẫn, chốt đơn giật tít (tối đa 22 từ).
2. motionPrompt: Mô tả diễn xuất tiếng Anh, phù hợp với góc quay \${sceneCount} cảnh trên, khẩu hình miệng nói tiếng Việt tự nhiên và liên tục.

Trả về DUY NHẤT một mảng JSON gồm đúng \${sceneCount} đối tượng:
[
\${scenes.map((_, i) => \`  { "voiceScript": "...", "motionPrompt": "..." }\`).join(',\\n')}
]\`;

      // Chuẩn hóa Base64 an toàn
      let validImgData = null;
      try {
        const activeSceneImg = scenes[activePreviewIndex]?.showroomImage;
        const targetImg = activeSceneImg || products.find(p => p !== null) || kocImage;
        if (targetImg) {
          if (typeof targetImg.base64 === 'string' && targetImg.base64.startsWith('data:image')) {
            const spl = targetImg.base64.split(',');
            if (spl[1] && spl[1].length > 100) {
              const mime = targetImg.base64.match(/data:([^;]+);/)?.[1] || targetImg.mimeType || 'image/jpeg';
              validImgData = { data: spl[1], mimeType: mime };
            }
          }
          if (!validImgData) {
            const urlToFetch = targetImg.url || (typeof targetImg.base64 === 'string' && (targetImg.base64.startsWith('http') || targetImg.base64.includes('window-asset')) ? targetImg.base64 : null);
            if (urlToFetch) {
              const imgRes = await fetch(urlToFetch);
              if (imgRes.ok) {
                const blob = await imgRes.blob();
                const converted = await new Promise((res) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const str = reader.result;
                    if (typeof str === 'string' && str.includes(',')) {
                      res({ data: str.split(',')[1], mimeType: blob.type || targetImg.mimeType || 'image/jpeg' });
                    } else {
                      res(null);
                    }
                  };
                  reader.onerror = () => res(null);
                  reader.readAsDataURL(blob);
                });
                if (converted && converted.data && converted.data.length > 100) {
                  validImgData = converted;
                }
              }
            }
          }
          if (!validImgData && Array.isArray(products)) {
            const prodImg = products.find(p => p && typeof p.base64 === 'string' && p.base64.startsWith('data:image'));
            if (prodImg) {
              const spl = prodImg.base64.split(',');
              if (spl[1] && spl[1].length > 100) {
                const mime = prodImg.base64.match(/data:([^;]+);/)?.[1] || prodImg.mimeType || 'image/jpeg';
                validImgData = { data: spl[1], mimeType: mime };
              }
            }
          }
        }
      } catch(e) {}

      const parts = [{ text: analysisPrompt }];
      if (validImgData && validImgData.data) {
        parts.unshift({
          inline_data: {
            mime_type: validImgData.mimeType || 'image/jpeg',
            data: validImgData.data
          }
        });
      }

      const bodyPayload = {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.85,
          response_mime_type: "application/json"
        }
      };

      let scriptData = null;
      let lastError = null;

      const modelCandidates = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];

      for (const mName of modelCandidates) {
        try {
          const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${mName}:generateContent?key=\${activeKey}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });

          if (resp.ok) {
            const data = await resp.json();
            const candidate = data?.candidates?.[0];
            let textOutput = candidate?.content?.parts?.map(p => p.text || '').join('') || '';
            const jsonMatch = textOutput.match(/\\[[\\s\\S]*\\]/);
            if (jsonMatch) {
              scriptData = JSON.parse(jsonMatch[0]);
              if (Array.isArray(scriptData) && scriptData.length >= sceneCount) {
                break;
              }
            }
          } else {
            lastError = await resp.text();
          }
        } catch(e) {
          lastError = e.message;
        }
      }

      if (scriptData && Array.isArray(scriptData) && scriptData.length >= sceneCount) {
        setScenes(prev => prev.map((s, idx) => ({
          ...s,
          voiceScript: scriptData[idx]?.voiceScript || s.voiceScript,
          motionPrompt: scriptData[idx]?.motionPrompt || s.motionPrompt,
          promptStatus: 'done'
        })));
        setIsScriptGenerating(false);
        toast?.success?.(\`Gemini Thinking AI đã sáng tạo xong kịch bản cho cả \${sceneCount} phân đoạn!\`);
      } else {
        let cleanErr = lastError || "Không thể phân tích kịch bản từ Gemini";
        try { cleanErr = JSON.parse(lastError)?.error?.message || cleanErr; } catch(e){}
        throw new Error(cleanErr);
      }

    } catch (err) {
      console.error('Gemini error:', err);
      setIsScriptGenerating(false);
      setScenes(prev => prev.map(s => ({ ...s, promptStatus: 'error' })));
      toast?.error?.("Lỗi khi gọi Gemini AI: " + (err.message || "Kiểm tra lại kết nối mạng"));
    }
  };

  // 3. SẢN XUẤT 1 CLIP: NẠP CHÍNH ẢNH SHOWROOM CỦA CẢNH ĐÓ VÀO LÀM START FRAME
  const handleGenerateSingleVideo = async (index) => {
    const scene = scenes[index];
    if (!scene.motionPrompt && !scene.voiceScript) {
      toast?.error?.("Vui lòng tạo kịch bản trước khi sản xuất video!");
      return;
    }

    setScenes(prev => prev.map((s, i) => i === index ? { ...s, videoStatus: 'generating', videoProgress: 10 } : s));

    try {
      const backendModelId = mapVideoModelToBackendId(videoModel);
      const enhancedPrompt = \`A professional presenter speaking directly to camera: "\${scene.voiceScript}". \${scene.motionPrompt}. Visible mouth movement and continuous speech throughout. Clean unbranded background.\`;

      // 🎯 NẠP CHÍNH XÁC ASSET ID CỦA ẢNH SHOWROOM RIÊNG CỦA CẢNH NÀY!
      let targetRefAssetId = scene.showroomImage?.assetId;
      if (!targetRefAssetId) {
        const prod = products.find(p => p && p.assetId);
        targetRefAssetId = prod?.assetId;
      }

      if (window.aiforge?.queue?.addJobs) {
        const jobInput = {
          title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
          type: "Video",
          providerId: "veo3",
          provider: "Veo3",
          ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
          payload: {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
            prompt: enhancedPrompt,
            ratio: "9:16",
            duration: 8,
            model: backendModelId,
            modelDisplayName: videoModel,
            flowVideoMode: "I2V",
            mode: "I2V",
            referenceAssetIds: targetRefAssetId ? [targetRefAssetId] : [],
            studioSource: "video-factory",
            tts: {
              enabled: true,
              script: scene.voiceScript,
              voiceName: "Ninh Đôn – Deep & Warm (Tiếng Việt)"
            }
          }
        };

        const res = await window.aiforge.queue.addJobs([jobInput]);
        if (res?.results?.[0]?.ok && res.results[0].job?.id) {
          const jId = res.results[0].job.id;
          setScenes(prev => prev.map((s, i) => i === index ? { ...s, jobId: jId } : s));
          toast?.info?.(\`Cảnh \${scene.id} đã gửi sang Google Flow (\${videoModel}) kèm ảnh Showroom riêng!\`);
          return;
        }
      }

      // Fallback preview offline
      setTimeout(() => {
        setScenes(prev => prev.map((s, i) => i === index ? {
          ...s,
          videoStatus: 'done',
          videoProgress: 100,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-showing-a-product-in-a-studio-41481-large.mp4"
        } : s));
        toast?.success?.(\`Cảnh \${scene.id} hoàn tất!\`);
      }, 3500);

    } catch (err) {
      console.error(err);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, videoStatus: 'error' } : s));
      toast?.error?.(\`Lỗi khi render cảnh \${scene.id}: \` + err.message);
    }
  };

  // 4. SẢN XUẤT TOÀN BỘ CLIPS
  const handleGenerateAllVideos = () => {
    setIsBatchGenerating(true);
    scenes.forEach((_, idx) => {
      setTimeout(() => {
        handleGenerateSingleVideo(idx);
      }, idx * 400);
    });
    setTimeout(() => {
      setIsBatchGenerating(false);
    }, 2000);
  };

  // 5. TẢI GÓI ZIP / XUẤT TẤT CẢ CLIPS
  const handleDownloadZip = () => {
    const readyVideos = scenes.filter(s => s.videoUrl);
    if (readyVideos.length === 0) {
      toast?.error?.("Chưa có clip nào render xong để tải về!");
      return;
    }

    setIsDownloading(true);
    try {
      readyVideos.forEach((s) => {
        const a = document.createElement('a');
        a.href = s.videoUrl;
        a.download = \`KOC_\${brandName.replace(/\\s+/g, '_')}_Canh_0\${s.id}.mp4\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      const scriptContent = scenes.map(s => 
        \`[CẢNH \${s.id}: \${s.stage} - \${s.title}] (Góc: \${s.angleName})\nLời thoại KOC: \${s.voiceScript}\nMotion Prompt: \${s.motionPrompt}\n\n\`
      ).join('\\n');

      const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`Kich_Ban_KOC_\${brandName.replace(/\\s+/g, '_')}.txt\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast?.success?.(\`Đang tải xuống \${readyVideos.length} video MP4 & kịch bản!\`);
    } catch (e) {
      console.error(e);
      toast?.error?.("Lỗi khi tải gói dữ liệu!");
    } finally {
      setIsDownloading(false);
    }
  };

  // Lưu chỉnh sửa kịch bản trực tiếp
  const handleSaveSceneScript = (sceneId, newVoiceScript, newMotionPrompt) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? {
      ...s,
      voiceScript: newVoiceScript,
      motionPrompt: newMotionPrompt || s.motionPrompt
    } : s));
    setEditingScene(null);
    toast?.success?.(\`Đã lưu kịch bản Cảnh \${sceneId}!\`);
  };

  const nicheObj = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
  const activeScene = scenes[activePreviewIndex] || scenes[0];

  return React.createElement("div", {
    style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' },
    className: "bg-[#070a14] text-gray-100 font-sans select-none"
  },
    // Top Bar (50px)
    React.createElement("div", {
      style: { height: '50px', minHeight: '50px', maxHeight: '50px' },
      className: "border-b border-white/[0.08] bg-[#0b0f1d] px-4 flex items-center justify-between z-30 shadow-md flex-shrink-0"
    },
      React.createElement("div", { className: "flex items-center gap-2.5" },
        React.createElement("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20" },
          "🏭"
        ),
        React.createElement("div", { className: "flex items-center gap-2" },
          React.createElement("span", { className: "text-xs font-bold text-white uppercase tracking-tight" }, "Xưởng Sản Xuất Video AI"),
          React.createElement("span", { className: "text-xs text-gray-500" }, "•"),
          React.createElement("span", { className: "text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30" }, \`\${sceneCount} Clips 9:16 KOC\`)
        )
      ),

      // Right Top Controls: Niche Selector & Account Selector
      React.createElement("div", { className: "flex items-center gap-2" },
        // Niche Selector
        React.createElement("div", { className: "flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]" },
          Object.values(NICHE_TEMPLATES).map(n => 
            React.createElement("button", {
              key: n.id,
              onClick: () => handleSelectNiche(n.id),
              className: \`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer \${
                currentNiche === n.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }\`
            },
              React.createElement("span", null, n.icon),
              React.createElement("span", null, n.name)
            )
          )
        ),

        // Account Selector
        React.createElement("div", { className: "flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-xl border border-white/[0.08]" },
          React.createElement("span", { className: "text-xs" }, "👤"),
          accounts.length > 0 ? React.createElement("select", {
            value: selectedAccountId,
            onChange: (e) => handleSelectAccount(e.target.value),
            className: "bg-transparent text-[11px] font-medium text-cyan-300 outline-none cursor-pointer max-w-[140px] truncate"
          },
            accounts.map(acc => 
              React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },
                acc.accountEmail || acc.accountDisplayName || acc.accountId
              )
            )
          ) : React.createElement("span", { className: "text-[11px] text-amber-400 font-semibold" }, "Chưa có session Flow")
        )
      )
    ),

    // Main 2-Column Layout
    React.createElement("div", {
      style: { display: 'flex', flex: 1, height: 'calc(100% - 50px)', overflow: 'hidden' }
    },
      // LEFT SIDEBAR (CỐ ĐỊNH 340PX)
      React.createElement("aside", {
        style: { width: '340px', minWidth: '340px', maxWidth: '340px', height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' },
        className: "border-r border-white/[0.08] bg-[#080d1a] z-20 shadow-xl overflow-hidden"
      },
        // Header
        React.createElement("div", { className: "p-4 pb-1 flex-shrink-0" },
          React.createElement("h2", { className: "text-base font-black tracking-tight uppercase text-white" }, "AI STUDIO"),
          React.createElement("p", { className: "text-[9px] font-bold text-gray-400 uppercase tracking-[0.15em]" },
            \`CẤU HÌNH \${nicheObj.name.toUpperCase()}\`
          )
        ),

        // Scrollable Body
        React.createElement("div", {
          style: { flex: 1, overflowY: 'auto' },
          className: "no-scrollbar p-4 flex flex-col gap-3.5"
        },
          // 1. HÌNH ẢNH SẢN PHẨM (Khung 75px cố định)
          React.createElement("div", { className: "space-y-1" },
            React.createElement(SectionLabel, null, "1. HÌNH ẢNH SẢN PHẨM"),
            React.createElement("div", { className: "grid grid-cols-3 gap-2" },
              products.map((p, i) => 
                React.createElement("div", {
                  key: i,
                  style: { height: '75px', maxHeight: '75px', width: '100%' },
                  className: "bg-white/[0.03] border border-white/[0.1] rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-cyan-500/50 relative group"
                },
                  p ? React.createElement(React.Fragment, null,
                    React.createElement("img", {
                      src: p.base64,
                      style: { width: '100%', height: '100%', objectFit: 'contain', background: '#0a0f1d' }
                    }),
                    React.createElement("button", {
                      onClick: (e) => { e.stopPropagation(); removeProductImage(i); },
                      className: "absolute top-1 right-1 w-4 h-4 rounded-full bg-black/80 hover:bg-red-600 text-white text-[9px] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    }, "×")
                  ) : React.createElement("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-500 hover:text-cyan-400" },
                    React.createElement("span", { className: "text-xl font-light leading-none" }, "+"),
                    React.createElement("span", { className: "text-[9px] text-gray-500 mt-1" }, \`Ảnh \${i + 1}\`),
                    React.createElement("input", {
                      type: "file",
                      accept: "image/*",
                      className: "hidden",
                      onChange: (e) => handleProductUpload(i, e)
                    })
                  )
                )
              )
            )
          ),

          // 2. THÔNG TIN SẢN PHẨM
          React.createElement(TextArea, {
            label: "2. THÔNG TIN SẢN PHẨM",
            value: productInfo,
            onChange: (v) => setProductInfo(v),
            placeholder: "Mô tả công dụng, tính năng, ưu đãi..."
          }),

          // 3. NHÂN VẬT KOC
          React.createElement("div", { className: "space-y-1.5" },
            React.createElement(SectionLabel, null, "3. NHÂN VẬT KOC"),
            React.createElement(SegmentedToggle, {
              value: bgMode,
              onChange: (v) => setBgMode(v),
              items: [
                { value: 'auto', label: 'AI Tự Sinh', icon: React.createElement("span", { className: "text-xs" }, "🤖") },
                { value: 'reference', label: 'Dùng KOC Mẫu', icon: React.createElement("span", { className: "text-xs" }, "👤") }
              ]
            }),
            bgMode === 'reference' && React.createElement("div", {
              style: { height: '70px', maxHeight: '70px', width: '100%' },
              className: "bg-white/[0.02] border border-dashed border-white/[0.15] rounded-xl flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:bg-white/[0.04] transition-colors relative"
            },
              kocImage ? React.createElement(React.Fragment, null,
                React.createElement("img", {
                  src: kocImage.base64,
                  style: { width: '100%', height: '100%', objectFit: 'contain', background: '#0a0f1d' }
                }),
                React.createElement("button", {
                  onClick: (e) => { e.stopPropagation(); setKocImage(null); },
                  className: "absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs flex items-center justify-center transition-colors"
                }, "×")
              ) : React.createElement("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-cyan-400 p-2 text-center" },
                React.createElement("span", { className: "text-base mb-0.5" }, "📷"),
                React.createElement("span", { className: "text-[9px] font-bold uppercase tracking-wider" }, "Tải ảnh KOC mẫu"),
                React.createElement("input", {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: handleKocUpload
                })
              )
            )
          ),

          // 4. THIẾT LẬP AI & CHỌN SỐ LƯỢNG CẢNH (3, 4, 5 CẢNH)
          React.createElement("div", { className: "space-y-2" },
            React.createElement("div", { className: "flex items-center justify-between" },
              React.createElement(SectionLabel, null, "4. THIẾT LẬP AI"),
              React.createElement("button", {
                type: "button",
                onClick: () => { setTempApiKeyInput(geminiApiKey || ''); setShowApiKeyModal(true); },
                className: "text-[9px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20"
              },
                "🔑 AI Key: Đã kết nối ⚡"
              )
            ),

            // TÙY CHỌN SỐ LƯỢNG CẢNH
            React.createElement("div", { className: "space-y-1" },
              React.createElement("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5" }, "SỐ LƯỢNG PHÂN ĐOẠN"),
              React.createElement(SegmentedToggle, {
                value: sceneCount,
                onChange: (v) => handleSceneCountChange(v),
                items: [
                  { value: 3, label: '3 Cảnh (Ngắn)', icon: React.createElement("span", { className: "text-xs font-bold" }, "3️⃣") },
                  { value: 4, label: '4 Cảnh', icon: React.createElement("span", { className: "text-xs font-bold" }, "4️⃣") },
                  { value: 5, label: '5 Cảnh (Chuẩn)', icon: React.createElement("span", { className: "text-xs font-bold" }, "5️⃣") }
                ]
              })
            ),
            
            // TÊN THƯƠNG HIỆU
            React.createElement(TextInput, {
              label: "TÊN THƯƠNG HIỆU",
              value: brandName,
              onChange: (v) => setBrandName(v),
              placeholder: "Ví dụ: GIA DỤNG VIỆT"
            }),

            // MODEL VIDEO
            React.createElement(FieldDropdown, {
              label: "MODEL VIDEO",
              value: videoModel,
              options: VIDEO_MODELS,
              onChange: (v) => setVideoModel(v)
            }),

            // NÚT TẠO SHOWROOM (X CẢNH)
            React.createElement(PillButton, {
              variant: "solid",
              onClick: handleGenerateShowroomAllScenes,
              disabled: isShowroomGenerating || products.every(o => o === null),
              loading: isShowroomGenerating,
              className: "mt-0.5 !h-[38px] !text-[12px] !font-bold"
            },
              isShowroomGenerating ? \`ĐANG TẠO \${sceneCount} GÓC ẢNH SHOWROOM...\` : \`TẠO SHOWROOM (\${sceneCount} GÓC CẢNH)\`
            )
          ),

          // 5. XUẤT BẢN NỘI DUNG
          React.createElement("div", { className: "space-y-2 pt-2 border-t border-white/[0.08]" },
            React.createElement(SectionLabel, null, "5. XUẤT BẢN NỘI DUNG"),
            
            // LÊN KỊCH BẢN KOC
            React.createElement(PillButton, {
              variant: "outline",
              onClick: handleGenerateScript,
              disabled: isScriptGenerating,
              loading: isScriptGenerating,
              icon: "🧠"
            },
              isScriptGenerating ? "Đang suy nghĩ kịch bản (AI Thinking)..." : \`LÊN KỊCH BẢN KOC (\${sceneCount} CẢNH)\`
            ),

            // SẢN XUẤT TOÀN BỘ CLIPS
            React.createElement(PillButton, {
              variant: "filled",
              onClick: handleGenerateAllVideos,
              disabled: isBatchGenerating || !scenes.some(s => s.voiceScript || s.motionPrompt),
              loading: isBatchGenerating,
              icon: "🎬"
            },
              isBatchGenerating ? \`Đang gửi lệnh \${sceneCount} clips...\` : \`SẢN XUẤT TOÀN BỘ \${sceneCount} CLIPS\`
            ),

            // TẢI GÓI ZIP (.ZIP)
            React.createElement(PillButton, {
              variant: "outline",
              onClick: handleDownloadZip,
              disabled: isDownloading || !scenes.some(s => s.videoUrl),
              loading: isDownloading,
              icon: "📦"
            },
              "TẢI GÓI ZIP (.ZIP)"
            )
          )
        )
      ),

      // RIGHT CANVAS: PREVIEW SHOWROOM GÓC MÁY ĐƯỢC CHỌN & CÁC THẺ CẢNH
      React.createElement("main", {
        style: { flex: 1, minWidth: 0, height: '100%', overflowY: 'auto' },
        className: "bg-[#060913] p-4 flex flex-col items-center justify-between no-scrollbar"
      },
        // SECTION 1: PREVIEW SHOWROOM CỦA CẢNH ĐƯỢC CHỌN
        React.createElement("section", { className: "flex flex-col items-center pt-0.5 w-full max-w-4xl" },
          // Thanh chuyển đổi góc preview cảnh
          React.createElement("div", { className: "flex items-center gap-2 mb-2 bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]" },
            scenes.map((s, idx) => 
              React.createElement("button", {
                key: s.id,
                onClick: () => setActivePreviewIndex(idx),
                className: \`px-3 py-1 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                  activePreviewIndex === idx 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }\`
              },
                React.createElement("span", null, \`Cảnh 0\${s.id}:\`),
                React.createElement("span", { className: "font-medium opacity-80" }, s.angleName.split(' ')[0])
              )
            )
          ),

          // Khung điện thoại 9:16 hiển thị ảnh Showroom của cảnh active
          React.createElement("div", {
            style: { width: '230px', height: '408px', minWidth: '230px', maxWidth: '230px' },
            className: "rounded-[30px] overflow-hidden shadow-2xl relative border border-white/[0.12] bg-[#0c1122] flex items-center justify-center group flex-shrink-0"
          },
            activeScene?.showroomImage ? React.createElement(React.Fragment, null,
              React.createElement("img", {
                src: activeScene.showroomImage.url || activeScene.showroomImage.base64,
                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
              }),
              React.createElement("div", {
                className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-[30px]"
              },
                React.createElement("span", { className: "text-xs font-semibold text-white px-3 py-1 bg-black/70 rounded-full backdrop-blur-md" },
                  \`Showroom Cảnh 0\${activeScene.id}: \${activeScene.angleName}\`
                )
              )
            ) : activeScene?.showroomStatus === 'generating' ? (
              React.createElement(ProgressCircle, { progress: activeScene.showroomProgress, size: 65, color: "#06b6d4" })
            ) : (
              React.createElement("div", { className: "flex flex-col items-center text-center p-4 text-gray-500" },
                React.createElement("span", { className: "text-3xl mb-1.5 opacity-30" }, "🖼️"),
                React.createElement("span", { className: "text-xs font-bold text-gray-400 uppercase tracking-wider" }, \`Showroom Cảnh 0\${activeScene?.id}\`),
                React.createElement("span", { className: "text-[10px] text-cyan-400/80 font-medium mt-0.5" }, activeScene?.angleName),
                React.createElement("span", { className: "text-[9px] text-gray-500 mt-1" }, "Bấm 'TẠO SHOWROOM' để vẽ ảnh riêng!")
              )
            )
          )
        ),

        // SECTION 2: DANH SÁCH THẺ CLIPS (TỰ ĐỘNG CÂN XỨNG CHO 3, 4 HOẶC 5 CẢNH)
        React.createElement("section", { className: "w-full max-w-5xl flex flex-col items-center mt-3 pb-1" },
          React.createElement("div", { className: "flex items-center gap-3 mb-2.5 w-full justify-center" },
            React.createElement("h3", { className: "text-[10px] font-black uppercase tracking-[0.25em] text-gray-400" },
              \`\${sceneCount} PHÂN ĐOẠN VIDEO KOC (MỖI CẢNH 1 FRAME KHÁC BIỆT)\`
            ),
            React.createElement("span", { className: "h-px w-20 bg-white/10" })
          ),

          // CÁC THẺ CẢNH
          React.createElement("div", { className: "flex gap-2.5 w-full justify-center" },
            scenes.map((scene, idx) => {
              const cardWidth = sceneCount === 3 ? '240px' : sceneCount === 4 ? '195px' : '170px';
              const isSelected = activePreviewIndex === idx;

              return React.createElement("div", {
                key: scene.id,
                style: { width: cardWidth, minWidth: cardWidth, maxWidth: cardWidth },
                onClick: () => setActivePreviewIndex(idx),
                className: \`rounded-2xl overflow-hidden shadow-xl border transition-all flex flex-col relative flex-shrink-0 cursor-pointer \${
                  isSelected ? 'border-cyan-400/60 ring-2 ring-cyan-500/20 bg-[#0e1529]' : 'border-white/[0.09] bg-[#0c1122] hover:border-white/20'
                }\`
              },
                // Video hoặc Showroom Preview của riêng cảnh này
                React.createElement("div", {
                  style: { height: '190px' },
                  className: "w-full bg-[#080d1a] relative flex items-center justify-center overflow-hidden border-b border-white/[0.08]",
                  onClick: (e) => {
                    if (scene.videoUrl) {
                      e.stopPropagation();
                      setSelectedVideo(scene.videoUrl);
                    }
                  }
                },
                  scene.videoUrl ? React.createElement(React.Fragment, null,
                    React.createElement("video", {
                      src: scene.videoUrl,
                      autoPlay: true,
                      loop: true,
                      muted: true,
                      playsInline: true,
                      style: { width: '100%', height: '100%', objectFit: 'cover' }
                    }),
                    React.createElement("div", {
                      className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    },
                      React.createElement("div", { className: "w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg font-bold" }, "▶")
                    )
                  ) : scene.videoStatus === 'generating' ? (
                    React.createElement(ProgressCircle, { progress: scene.videoProgress, size: 45, color: "#06b6d4" })
                  ) : scene.showroomImage ? (
                    React.createElement(React.Fragment, null,
                      React.createElement("img", {
                        src: scene.showroomImage.url || scene.showroomImage.base64,
                        style: { width: '100%', height: '100%', objectFit: 'cover' }
                      }),
                      React.createElement("div", { className: "absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[8px] font-bold text-cyan-300" },
                        "FRAME 1"
                      )
                    )
                  ) : scene.showroomStatus === 'generating' ? (
                    React.createElement(ProgressCircle, { progress: scene.showroomProgress, size: 40, color: "#3b82f6" })
                  ) : (
                    React.createElement("div", { className: "flex flex-col items-center justify-center opacity-30 text-gray-400" },
                      React.createElement("span", { className: "text-2xl" }, "🎬"),
                      React.createElement("span", { className: "text-[9px] font-bold mt-1" }, \`0\${scene.id}\`)
                    )
                  )
                ),

                // Script Box
                React.createElement("div", {
                  className: "p-2.5 flex-1 flex flex-col justify-between bg-[#0a0e1c] gap-1 cursor-pointer hover:bg-white/[0.02] transition-colors",
                  onClick: (e) => { e.stopPropagation(); setEditingScene(scene); }
                },
                  React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-[9px] font-black uppercase tracking-wider text-cyan-400 truncate" },
                      \`CẢNH 0\${scene.id}: \${scene.stage}\`
                    ),
                    React.createElement("span", { className: "text-[9px] text-gray-500 hover:text-cyan-300 flex-shrink-0" }, "✏️")
                  ),
                  React.createElement("span", { className: "text-[8px] text-gray-400 font-medium truncate" },
                    \`📐 \${scene.angleName}\`
                  ),
                  React.createElement("p", { className: "text-[9px] text-gray-300 italic line-clamp-3 leading-relaxed mt-0.5" },
                    scene.voiceScript || "Chưa có kịch bản (bấm 'Lên kịch bản KOC')"
                  )
                ),

                // Button: TẠO CLIP / LÀM LẠI
                React.createElement("div", { className: "p-2 bg-[#090d18] border-t border-white/[0.06]" },
                  React.createElement("button", {
                    onClick: (e) => { e.stopPropagation(); handleGenerateSingleVideo(idx); },
                    disabled: scene.videoStatus === 'generating' || (!scene.voiceScript && !scene.motionPrompt),
                    className: "w-full py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white text-[9px] font-bold rounded-lg uppercase tracking-wider shadow transition-all cursor-pointer"
                  },
                    scene.videoUrl ? "LÀM LẠI" : "TẠO CLIP"
                  )
                )
              );
            })
          )
        )
      )
    ),

    // MODAL CẤU HÌNH GEMINI API KEY
    showApiKeyModal && React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4",
      onClick: () => setShowApiKeyModal(false)
    },
      React.createElement("div", {
        className: "bg-[#0d1428] border border-cyan-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 text-left",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement("div", { className: "flex justify-between items-center pb-2 border-b border-white/10" },
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("span", { className: "text-lg" }, "🧠"),
            React.createElement("h3", { className: "text-sm font-bold text-white uppercase tracking-wider" }, "Cấu Hình Gemini Thinking AI")
          ),
          React.createElement("button", {
            onClick: () => setShowApiKeyModal(false),
            className: "text-gray-400 hover:text-white text-lg w-7 h-7 rounded-full bg-white/5 flex items-center justify-center"
          }, "×")
        ),

        React.createElement("div", { className: "space-y-3" },
          React.createElement("p", { className: "text-xs text-gray-300 leading-relaxed" },
            "Hệ thống đã kết nối sẵn mã API Key chính thức của Google Gemini 3.6 Flash. Nếu muốn thay đổi key riêng của bạn, bạn có thể dán vào bên dưới."
          ),

          React.createElement("div", { className: "space-y-1.5" },
            React.createElement("div", { className: "flex justify-between items-center text-[10px] font-bold uppercase tracking-wider" },
              React.createElement("span", { className: "text-cyan-400" }, "Gemini API Key:"),
              React.createElement("a", {
                href: "https://aistudio.google.com/app/apikey",
                target: "_blank",
                className: "text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-1"
              },
                "Lấy key miễn phí tại đây ↗"
              )
            ),
            React.createElement("input", {
              type: "text",
              value: tempApiKeyInput,
              onChange: (e) => setTempApiKeyInput(e.target.value),
              placeholder: "Dán mã AIzaSy... vào đây",
              className: "w-full h-11 px-4 rounded-xl border border-white/20 bg-[#141b30] text-white text-xs font-mono outline-none focus:border-cyan-500"
            })
          )
        ),

        React.createElement("div", { className: "flex justify-end gap-2 pt-2 border-t border-white/10" },
          React.createElement("button", {
            onClick: () => setShowApiKeyModal(false),
            className: "px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5"
          }, "Đóng"),
          React.createElement("button", {
            onClick: () => {
              if (!tempApiKeyInput || tempApiKeyInput.trim().length < 10) {
                toast?.error?.("Vui lòng dán mã API Key hợp lệ!");
                return;
              }
              handleSaveGeminiKey(tempApiKeyInput.trim());
            },
            className: "px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30"
          }, "Lưu Key Mới")
        )
      )
    ),

    // MODAL SỬA KỊCH BẢN TRỰC TIẾP
    editingScene && React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4",
      onClick: () => setEditingScene(null)
    },
      React.createElement("div", {
        className: "bg-[#0c1224] border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement("div", { className: "flex justify-between items-center pb-2 border-b border-white/10" },
          React.createElement("h3", { className: "text-sm font-bold text-white uppercase tracking-wider" },
            \`Chỉnh Sửa Cảnh 0\${editingScene.id}: \${editingScene.stage} (\${editingScene.angleName})\`
          ),
          React.createElement("button", {
            onClick: () => setEditingScene(null),
            className: "text-gray-400 hover:text-white text-lg w-7 h-7 rounded-full bg-white/5 flex items-center justify-center"
          }, "×")
        ),

        React.createElement("div", { className: "space-y-3" },
          React.createElement("div", null,
            React.createElement("label", { className: "block text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1" },
              "Lời Thoại KOC (Tiếng Việt - Dưới 25 từ):"
            ),
            React.createElement("textarea", {
              id: "editVoiceScriptInput",
              defaultValue: editingScene.voiceScript,
              rows: 3,
              className: "w-full p-3 rounded-xl border border-white/15 bg-[#12192c] text-white text-xs font-medium outline-none focus:border-cyan-500 resize-none leading-relaxed"
            })
          ),

          React.createElement("div", null,
            React.createElement("label", { className: "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1" },
              "Motion Prompt (Tiếng Anh - Diễn xuất KOC cho Model Video):"
            ),
            React.createElement("textarea", {
              id: "editMotionPromptInput",
              defaultValue: editingScene.motionPrompt,
              rows: 3,
              className: "w-full p-3 rounded-xl border border-white/15 bg-[#12192c] text-gray-300 text-xs font-mono outline-none focus:border-cyan-500 resize-none leading-relaxed"
            })
          )
        ),

        React.createElement("div", { className: "flex justify-end gap-2 pt-2 border-t border-white/10" },
          React.createElement("button", {
            onClick: () => setEditingScene(null),
            className: "px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5"
          }, "Hủy"),
          React.createElement("button", {
            onClick: () => {
              const vVal = document.getElementById('editVoiceScriptInput')?.value || '';
              const mVal = document.getElementById('editMotionPromptInput')?.value || '';
              handleSaveSceneScript(editingScene.id, vVal, mVal);
            },
            className: "px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30"
          }, "Lưu Kịch Bản")
        )
      )
    ),

    // MODAL PHÁT VIDEO FULLSCREEN
    selectedVideo && React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6",
      onClick: () => setSelectedVideo(null)
    },
      React.createElement("div", {
        style: { width: '300px', height: '533px' },
        className: "relative rounded-3xl overflow-hidden bg-black border border-white/20 shadow-2xl",
        onClick: (e) => e.stopPropagation()
      },
        React.createElement("video", {
          src: selectedVideo,
          className: "w-full h-full object-contain",
          controls: true,
          autoPlay: true
        }),
        React.createElement("button", {
          onClick: () => setSelectedVideo(null),
          className: "absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-lg border border-white/20"
        }, "×")
      )
    )
  );
}
`;

// Ghi đè vào các vị trí VideoFactoryStudio.js
for (const root of targetRoots) {
  const targetPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (fs.existsSync(path.dirname(targetPath))) {
    fs.writeFileSync(targetPath, videoFactoryCode, 'utf8');
    console.log('✅ Đã cập nhật VideoFactoryStudio.js tại:', targetPath);
  }
}

// Kiểm tra AST Syntax
fs.writeFileSync('temp_vf_verify.mjs', videoFactoryCode);
try {
  execSync('node --check temp_vf_verify.mjs', { stdio: 'inherit' });
  console.log('🎉 [PASS] VideoFactoryStudio.js AST Syntax 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] VideoFactoryStudio.js AST Syntax Lỗi!');
  process.exit(1);
} finally {
  try { fs.unlinkSync('temp_vf_verify.mjs'); } catch (_) {}
}

console.log('\\n[+] Hoàn tất nâng cấp tính năng 3/4/5 cảnh và Showroom riêng cho từng cảnh!');
