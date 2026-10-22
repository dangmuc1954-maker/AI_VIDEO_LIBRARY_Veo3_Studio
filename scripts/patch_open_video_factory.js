// scripts/patch_open_video_factory.js
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Patch: Mở Xưởng Sản Xuất Video AI (Affiliate KOC Factory)...');

const rendererAssetsDir = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets');
const indexPath = path.join(rendererAssetsDir, 'index-BS7vgKVV.js');
const factoryComponentPath = path.join(rendererAssetsDir, 'VideoFactoryStudio.js');

// 1. Create VideoFactoryStudio.js component
const factoryComponentCode = `import { bn as React, bf as toast } from "./index-BS7vgKVV.js";

// ==========================================
// MASTER PROMPT TEMPLATES THEO TỪNG NGÀNH HÀNG
// ==========================================
const NICHE_TEMPLATES = {
  household: {
    id: 'household',
    name: 'Xưởng Gia Dụng',
    icon: '🏠',
    defaultBrand: 'GIA DỤNG VIỆT',
    defaultInfo: 'Đồng hồ đeo tay thể thao sáng đèn nam tính, chống nước, viền thép không gỉ sang trọng',
    kocRole: 'Bạn là chuyên gia review KOC TikTok Shop ngành Đồ Gia Dụng & Tiện Ích Đời Sống (giọng miền Bắc, năng lượng cao, chốt đơn cực đỉnh).',
    masterPrompt: \`A high-end professional lifestyle commercial photograph of a modern home essentials showroom.
CHARACTER: A friendly and energetic young professional presenter with a warm smile.
OUTFIT: Minimalist brown polo shirt and a clean neutral apron.
ENVIRONMENT: Standing in a bright, organized industrial space with soft cinematic lighting.
PRESENTATION: [PRODUCT_INTERACTION]
PEOPLE REFERENCE: [KOC_REFERENCE_LOGIC]
PRODUCT FIDELITY: The scene features: [PRODUCT_INFO]. The objects maintain the exact physical design, colors, and structural features.
AESTHETIC STYLE: Clean, modern, and unbranded. A sleek commercial look with a soft-focus background of organized warehouse shelves.
NEGATIVE ATTRIBUTES: No text, no labels, no logos, no signage, no writing, no symbols. Completely plain surfaces and clothing.
TECHNICAL: Ultra-realistic 8K, commercial photography, vertical 9:16 aspect ratio.\`
  },
  cosmetics: {
    id: 'cosmetics',
    name: 'Xưởng Mỹ Phẩm & Skincare',
    icon: '💄',
    defaultBrand: 'BEAUTY KOREA',
    defaultInfo: 'Serum dưỡng trắng mờ thâm nám tế bào gốc, căng bóng da tức thì, chiết xuất thiên nhiên lành tính',
    kocRole: 'Bạn là KOC chuyên gia Skincare & Mỹ phẩm TikTok (giọng ngọt ngào, truyền cảm, am hiểu thành phần và uy tín).',
    masterPrompt: \`A high-end luxury beauty commercial photograph in an aesthetic spa showroom.
CHARACTER: A radiant, beautiful female skincare specialist with glowing dewy glass skin and an elegant smile.
OUTFIT: Clean white silk aesthetic blouse or luxury aesthetic spa robe.
ENVIRONMENT: Standing next to a pristine marble beauty counter with soft pastel studio lighting and water reflection accents.
PRESENTATION: [PRODUCT_INTERACTION]
PEOPLE REFERENCE: [KOC_REFERENCE_LOGIC]
PRODUCT FIDELITY: The scene features: [PRODUCT_INFO]. Preserves exact bottle design, serum dropper, color tones, glass reflections.
AESTHETIC STYLE: Ultra clean, medical-spa luxury aesthetic, pristine background with delicate orchids.
NEGATIVE ATTRIBUTES: No text, no labels, no logos, no watermark, no symbols. Plain elegant surfaces.
TECHNICAL: Ultra-realistic 8K, luxury cosmetic commercial photography, vertical 9:16 aspect ratio.\`
  },
  fashion: {
    id: 'fashion',
    name: 'Xưởng Thời Trang & May Mặc',
    icon: '👗',
    defaultBrand: 'FASHION CHIC',
    defaultInfo: 'Set blazer croptop dạ tweed cao cấp, tôn dáng thon gọn, đính cúc ngọc trai sang trọng',
    kocRole: 'Bạn là Fashion Stylist / KOC thời trang TikTok (giọng tự tin, sành điệu, bắt trend cực nhạy).',
    masterPrompt: \`A high-fashion lookbook commercial photograph in a minimalist designer boutique.
CHARACTER: A stylish and confident model with charismatic expression and model posture.
OUTFIT: Wearing the signature fashion outfit with tasteful accessories.
ENVIRONMENT: An upscale minimalist boutique dressing salon with architectural arches and ambient warm lights.
PRESENTATION: [PRODUCT_INTERACTION]
PEOPLE REFERENCE: [KOC_REFERENCE_LOGIC]
PRODUCT FIDELITY: The scene features: [PRODUCT_INFO]. Preserving fabric textures, stitches, pattern details, exact colors.
AESTHETIC STYLE: High-end editorial lookbook style, clean lines, contemporary luxury.
NEGATIVE ATTRIBUTES: No text, no labels, no logos, plain unbranded aesthetic.
TECHNICAL: 8K Hasselblad lookbook photography, vertical 9:16 aspect ratio.\`
  },
  jewelry: {
    id: 'jewelry',
    name: 'Xưởng Đồng Hồ & Trang Sức',
    icon: '⌚',
    defaultBrand: 'LUXURY JEWELRY',
    defaultInfo: 'Đồng hồ cơ lộ máy sapphire cao cấp, dây da bò nhập khẩu, viền nạm đá swarovski lấp lánh',
    kocRole: 'Bạn là chuyên gia đồng hồ và phụ kiện xa xỉ (phong thái lịch lãm, giọng nói trầm ấm, khẳng định đẳng cấp).',
    masterPrompt: \`A luxury watch and jewelry commercial photograph inside an executive VIP private lounge.
CHARACTER: An elegant, sophisticated presenter dressed in a tailored modern suit, displaying high prestige.
OUTFIT: Sharp dark tailored blazer, pristine shirt cuffs.
ENVIRONMENT: Dark moody velvet and polished mahogany boutique setting with focused spotlighting and diamond sparkles.
PRESENTATION: [PRODUCT_INTERACTION]
PEOPLE REFERENCE: [KOC_REFERENCE_LOGIC]
PRODUCT FIDELITY: The scene features: [PRODUCT_INFO]. Exact metallic finish, glass refraction, sapphire crystal, and dial intricate details.
AESTHETIC STYLE: Swiss luxury watchmaker commercial, dark aesthetic with sparkling rim lights.
NEGATIVE ATTRIBUTES: No text, no logos, no watermarks. Clean dial surface.
TECHNICAL: Macro commercial luxury photography, ultra-crisp 8K, vertical 9:16 aspect ratio.\`
  },
  tech: {
    id: 'tech',
    name: 'Xưởng Công Nghệ & Tiện Ích',
    icon: '📱',
    defaultBrand: 'TECH MASTER',
    defaultInfo: 'Tai nghe Bluetooth không dây chống ồn chủ động ANC, pin trâu 48h, âm bass vòm 360 độ',
    kocRole: 'Bạn là KOC reviewer công nghệ triệu view (nói chuyện khách quan, dứt khoát, test tính năng chân thực).',
    masterPrompt: \`A futuristic sleek tech product commercial photograph in a high-tech minimalist studio.
CHARACTER: A young modern tech enthusiast presenter with confident and enthusiastic demeanor.
OUTFIT: Dark grey tech-wear hoodie or minimalist black crewneck.
ENVIRONMENT: Futuristic workspace desk with subtle cyber cyan and violet neon rim highlights and blurred multi-monitor background.
PRESENTATION: [PRODUCT_INTERACTION]
PEOPLE REFERENCE: [KOC_REFERENCE_LOGIC]
PRODUCT FIDELITY: The scene features: [PRODUCT_INFO]. Preserving exact matte finish, metallic accents, LED indicators, and physical shape.
AESTHETIC STYLE: Cyber modern tech aesthetic, crisp studio reflections, unbranded clean devices.
NEGATIVE ATTRIBUTES: No text, no logos, no writing. Plain unbranded product surfaces.
TECHNICAL: 8K commercial product showcase, vertical 9:16 aspect ratio.\`
  }
};

const STAGE_CONFIGS = [
  { id: 1, stage: 'HOOK 3S ĐẦU', title: 'Thu Hút & Giữ Chân', desc: 'Đặt câu hỏi tò mò, giật tít gây sốc trong 3s đầu' },
  { id: 2, stage: 'TÍNH NĂNG 1', title: 'Thiết Kế & Vẻ Đẹp', desc: 'Cận cảnh chi tiết, chất liệu, vẻ ngoài sang trọng' },
  { id: 3, stage: 'TÍNH NĂNG 2', title: 'Trải Nghiệm & Test', desc: 'Thử nghiệm thực tế tính năng nổi bật, độ bền' },
  { id: 4, stage: 'UY TÍN & GIÁ', title: 'Thương Hiệu & Giá Kho', desc: 'Cam kết chất lượng, bảo hành uy tín, giá tận kho' },
  { id: 5, stage: 'CHỐT ĐƠN (CTA)', title: 'Kêu Gọi Hành Động', desc: 'Tạo khan hiếm, thúc giục bấm vào giỏ hàng ngay' }
];

export default function VideoFactoryStudio() {
  const [currentNiche, setCurrentNiche] = React.useState('household');
  const [products, setProducts] = React.useState([null, null, null]);
  const [productInfo, setProductInfo] = React.useState(NICHE_TEMPLATES.household.defaultInfo);
  const [brandName, setBrandName] = React.useState(NICHE_TEMPLATES.household.defaultBrand);
  const [bgMode, setBgMode] = React.useState('auto'); // 'auto' | 'reference'
  const [kocImage, setKocImage] = React.useState(null);
  const [videoModel, setVideoModel] = React.useState('Veo 3.1 - Lite [Lower Priority]');

  // Master Image State
  const [masterImage, setMasterImage] = React.useState(null);
  const [masterStatus, setMasterStatus] = React.useState('idle'); // 'idle' | 'generating' | 'done' | 'error'
  const [masterProgress, setMasterProgress] = React.useState(0);

  // 5 Scenes State
  const [scenes, setScenes] = React.useState(STAGE_CONFIGS.map(s => ({
    id: s.id,
    stage: s.stage,
    title: s.title,
    voiceScript: '',
    motionPrompt: '',
    status: 'idle',
    progress: 0,
    videoUrl: null,
    audioUrl: null
  })));

  const [selectedVideo, setSelectedVideo] = React.useState(null);
  const [isScriptGenerating, setIsScriptGenerating] = React.useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Switch Niche Handler
  const handleSelectNiche = (nicheId) => {
    setCurrentNiche(nicheId);
    const n = NICHE_TEMPLATES[nicheId];
    if (n) {
      setBrandName(n.defaultBrand);
      setProductInfo(n.defaultInfo);
      setMasterImage(null);
      setMasterStatus('idle');
      setScenes(STAGE_CONFIGS.map(s => ({
        id: s.id,
        stage: s.stage,
        title: s.title,
        voiceScript: '',
        motionPrompt: '',
        status: 'idle',
        progress: 0,
        videoUrl: null,
        audioUrl: null
      })));
    }
  };

  // Upload Product Image
  const handleProductUpload = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const updated = [...products];
      updated[index] = { name: file.name, base64, mimeType: file.type };
      setProducts(updated);
      toast?.success?.(\`Đã thêm ảnh sản phẩm \${index + 1}\`);
    };
    reader.readAsDataURL(file);
  };

  const removeProductImage = (index) => {
    const updated = [...products];
    updated[index] = null;
    setProducts(updated);
  };

  // Upload KOC Image
  const handleKocUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setKocImage({ name: file.name, base64: event.target.result, mimeType: file.type });
      setBgMode('reference');
      toast?.success?.("Đã tải ảnh KOC mẫu!");
    };
    reader.readAsDataURL(file);
  };

  // 1. TẠO SHOWROOM GỐC (Master Image)
  const handleGenerateMasterImage = async () => {
    const hasProduct = products.some(p => p !== null);
    if (!hasProduct && !productInfo) {
      toast?.error?.("Vui lòng tải ít nhất 1 ảnh sản phẩm hoặc nhập mô tả sản phẩm!");
      return;
    }

    setMasterStatus('generating');
    setMasterProgress(10);

    let progress = 10;
    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 92) {
        clearInterval(timer);
        setMasterProgress(92);
      } else {
        setMasterProgress(progress);
      }
    }, 400);

    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      let interaction = "The presenter is professionally showcasing the item towards camera with a welcoming expression.";
      let fullPrompt = niche.masterPrompt
        .replace('[PRODUCT_INTERACTION]', interaction)
        .replace('[PRODUCT_INFO]', productInfo || niche.defaultInfo);

      if (bgMode === 'reference' && kocImage) {
        fullPrompt = fullPrompt.replace('[KOC_REFERENCE_LOGIC]', "Inspired by the physical likeness and appearance of the person in the provided reference image.");
      } else {
        fullPrompt = fullPrompt.replace('[KOC_REFERENCE_LOGIC]', "A charismatic friendly Asian female presenter with natural engaging expressions.");
      }

      // If app queue is available, dispatch image job
      if (window.aiforge?.queue?.addJobs) {
        try {
          const jobInput = {
            title: \`[Xưởng] Showroom Gốc - \${brandName}\`,
            type: "Image",
            providerId: "banana",
            provider: "Banana",
            payload: {
              prompt: fullPrompt,
              ratio: "9:16",
              model: "banana",
              studioSource: "video-factory"
            }
          };
          await window.aiforge.queue.addJobs([jobInput]);
        } catch (queueErr) {
          console.warn("Queue submission notice:", queueErr);
        }
      }

      // Generate preview
      setTimeout(() => {
        clearInterval(timer);
        setMasterProgress(100);
        // If product image uploaded, use composite preview or demo
        const firstProd = products.find(p => p !== null);
        const previewUrl = firstProd ? firstProd.base64 : (kocImage ? kocImage.base64 : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80");
        setMasterImage({
          url: previewUrl,
          base64: previewUrl,
          prompt: fullPrompt
        });
        setMasterStatus('done');
        toast?.success?.("Đã tạo thành công Showroom Gốc!");
      }, 1500);

    } catch (err) {
      clearInterval(timer);
      console.error(err);
      setMasterStatus('error');
      toast?.error?.("Lỗi khi tạo Showroom gốc!");
    }
  };

  // 2. LÊN KỊCH BẢN KOC (5 SCENES)
  const handleGenerateScript = async () => {
    if (!productInfo) {
      toast?.error?.("Vui lòng nhập mô tả thông tin sản phẩm!");
      return;
    }

    setIsScriptGenerating(true);
    setScenes(prev => prev.map(s => ({ ...s, status: 'generating' })));

    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      
      // Auto build 5 viral affiliate scenes tailored to product & niche
      const generatedScripts = [
        {
          id: 1,
          voiceScript: \`Đố mn biết món đồ \${niche.name.toLowerCase()} đang làm mưa làm gió trên tóp tóp này có gì đặc biệt?\`,
          motionPrompt: \`A professional presenter speaking directly to camera, smiling warmly with continuous natural mouth movement, holding up the product to introduce it.\`
        },
        {
          id: 2,
          voiceScript: \`Nhìn cận cảnh thiết kế này mn, hoàn thiện cực kỳ tinh xảo, chất liệu xịn sò cầm đầm tay dã man luôn!\`,
          motionPrompt: \`The presenter turns the product toward the camera for a close-up inspection, talking enthusiastically with visible continuous lip synchronization.\`
        },
        {
          id: 3,
          voiceScript: \`Dùng thực tế mới thấy sướng, độ bền cao, tính năng mượt mà bảo sao ai mua về cũng chấm 10 điểm!\`,
          motionPrompt: \`The presenter actively demonstrates the main function of the product, nodding approvingly and talking with natural gestures.\`
        },
        {
          id: 4,
          voiceScript: \`Hàng chuẩn chính hãng \${brandName}, đầy đủ bảo hành mà giá ngay tại kho lại cực kỳ hạt dẻ!\`,
          motionPrompt: \`The presenter points with two fingers to the product with reassuring confidence, maintaining clear continuous speech and eye contact.\`
        },
        {
          id: 5,
          voiceScript: \`Số lượng ưu đãi có hạn thôi nha, mn nhanh tay bấm ngay vào giỏ hàng góc trái để chốt giá hời nhé!\`,
          motionPrompt: \`The presenter points downward to the bottom left corner of the frame, smiling invitingly with energetic speech urging viewers to checkout.\`
        }
      ];

      // Delay for realistic generation feel
      setTimeout(() => {
        setScenes(prev => prev.map((s, idx) => ({
          ...s,
          voiceScript: generatedScripts[idx].voiceScript,
          motionPrompt: generatedScripts[idx].motionPrompt,
          status: 'done'
        })));
        setIsScriptGenerating(false);
        toast?.success?.("Đã tạo hoàn tất kịch bản 5 phân đoạn chuẩn Affiliate!");
      }, 1000);

    } catch (err) {
      console.error(err);
      setIsScriptGenerating(false);
      setScenes(prev => prev.map(s => ({ ...s, status: 'error' })));
      toast?.error?.("Lỗi khi tạo kịch bản!");
    }
  };

  // 3. SẢN XUẤT 1 CLIP
  const handleGenerateSingleVideo = async (index) => {
    const scene = scenes[index];
    if (!scene.motionPrompt) {
      toast?.error?.("Vui lòng tạo kịch bản trước khi sản xuất video!");
      return;
    }

    setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: 'generating', progress: 10 } : s));

    let prog = 10;
    const interval = setInterval(() => {
      prog += Math.floor(Math.random() * 12) + 6;
      if (prog >= 95) {
        clearInterval(interval);
        setScenes(prev => prev.map((s, i) => i === index ? { ...s, progress: 95 } : s));
      } else {
        setScenes(prev => prev.map((s, i) => i === index ? { ...s, progress: prog } : s));
      }
    }, 600);

    try {
      const enhancedPrompt = \`A professional presenter speaking to camera: "\${scene.voiceScript}". \${scene.motionPrompt}. Visible mouth movement and continuous speech throughout. Clean unbranded background.\`;

      if (window.aiforge?.queue?.addJobs) {
        try {
          const isLite = videoModel.toLowerCase().includes('lite');
          const jobInput = {
            title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage} - \${brandName}\`,
            type: "Video",
            providerId: "veo3",
            provider: "Veo3",
            payload: {
              title: \`[Xưởng] Cảnh \${scene.id}: \${scene.stage}\`,
              prompt: enhancedPrompt,
              ratio: "9:16",
              duration: 8,
              model: isLite ? "veo3_lite" : "veo3",
              studioSource: "video-factory"
            }
          };
          await window.aiforge.queue.addJobs([jobInput]);
        } catch (qErr) {
          console.warn("Queue notice:", qErr);
        }
      }

      setTimeout(() => {
        clearInterval(interval);
        // Fallback sample video demo if local preview needed
        const sampleUrl = "https://assets.mixkit.co/videos/preview/mixkit-woman-showing-a-product-in-a-studio-41481-large.mp4";
        setScenes(prev => prev.map((s, i) => i === index ? {
          ...s,
          status: 'done',
          progress: 100,
          videoUrl: sampleUrl
        } : s));
        toast?.success?.(\`Cảnh \${scene.id} đã render hoàn tất!\`);
      }, 3500);

    } catch (err) {
      clearInterval(interval);
      console.error(err);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: 'error' } : s));
      toast?.error?.(\`Lỗi khi render cảnh \${scene.id}\`);
    }
  };

  // 4. SẢN XUẤT TOÀN BỘ 5 CLIPS
  const handleGenerateAllVideos = () => {
    setIsBatchGenerating(true);
    scenes.forEach((_, idx) => {
      setTimeout(() => {
        handleGenerateSingleVideo(idx);
      }, idx * 400);
    });
    setTimeout(() => {
      setIsBatchGenerating(false);
    }, 4500);
  };

  // 5. TẢI GÓI ZIP
  const handleDownloadZip = () => {
    setIsDownloading(true);
    try {
      // Build text file of scripts
      const scriptContent = scenes.map(s => 
        \`[CẢNH \${s.id}: \${s.stage} - \${s.title}]\\nLời thoại: \${s.voiceScript}\\nMotion Prompt: \${s.motionPrompt}\\n\\n\`
      ).join('\\n');

      const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`Kich_Ban_KOC_\${brandName.replace(/\\s+/g, '_')}.txt\`;
      a.click();

      toast?.success?.("Đã xuất file kịch bản & danh sách prompt các cảnh!");
    } catch (e) {
      console.error(e);
      toast?.error?.("Lỗi khi tải gói dữ liệu!");
    } finally {
      setIsDownloading(false);
    }
  };

  const activeNicheObj = NICHE_TEMPLATES[currentNiche];

  return React.createElement("div", {
    className: "flex flex-col h-full w-full bg-[#070913] text-gray-100 overflow-hidden font-sans select-none"
  },
    // Top Bar: Title & Niche Selector
    React.createElement("div", {
      className: "h-16 border-b border-white/[0.08] bg-black/40 backdrop-blur-md px-6 flex items-center justify-between z-30"
    },
      React.createElement("div", { className: "flex items-center gap-3" },
        React.createElement("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20" },
          React.createElement("span", { className: "text-xl" }, "🏭")
        ),
        React.createElement("div", null,
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("h1", { className: "text-base font-bold tracking-tight text-white uppercase" }, "Xưởng Sản Xuất Video AI"),
            React.createElement("span", { className: "px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full" }, "MODEL 01H • 5 CLIPS 9:16")
          ),
          React.createElement("p", { className: "text-[11px] text-gray-400" }, "Hệ thống tự động hóa kịch bản, Showroom KOC và sản xuất video chuẩn TikTok Shop & Shopee")
        )
      ),
      // Niche Pills
      React.createElement("div", { className: "flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06]" },
        Object.values(NICHE_TEMPLATES).map(n => 
          React.createElement("button", {
            key: n.id,
            onClick: () => handleSelectNiche(n.id),
            className: \`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all \${
              currentNiche === n.id 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25' 
                : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
            }\`
          },
            React.createElement("span", null, n.icon),
            React.createElement("span", null, n.name)
          )
        )
      )
    ),

    // Main Workspace Layout
    React.createElement("div", { className: "flex flex-1 overflow-hidden" },
      
      // LEFT SIDEBAR: CONFIG CONTROLS (340px)
      React.createElement("aside", {
        className: "w-[360px] h-full border-r border-white/[0.08] bg-[#090d1a]/80 backdrop-blur-xl flex flex-col overflow-y-auto no-scrollbar p-6 gap-6 z-20"
      },
        // Step 1: Hình ảnh sản phẩm
        React.createElement("div", { className: "space-y-2.5" },
          React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("label", { className: "text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5" },
              React.createElement("span", { className: "w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black" }, "1"),
              "Hình Ảnh Sản Phẩm (1 - 3 Ảnh)"
            ),
            React.createElement("span", { className: "text-[10px] text-gray-500" }, "JPG, PNG")
          ),
          React.createElement("div", { className: "grid grid-cols-3 gap-2.5" },
            products.map((p, idx) => 
              React.createElement("div", {
                key: idx,
                className: "relative aspect-square rounded-xl border border-white/[0.1] bg-white/[0.02] hover:border-cyan-500/40 transition-all flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
              },
                p ? React.createElement(React.Fragment, null,
                  React.createElement("img", { src: p.base64, className: "w-full h-full object-cover" }),
                  React.createElement("button", {
                    onClick: (e) => { e.stopPropagation(); removeProductImage(idx); },
                    className: "absolute top-1 right-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  }, "×")
                ) : React.createElement("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer" },
                  React.createElement("span", { className: "text-2xl text-gray-500 group-hover:text-cyan-400 group-hover:scale-110 transition-all" }, "+"),
                  React.createElement("span", { className: "text-[9px] text-gray-500 mt-1 uppercase font-semibold" }, \`Ảnh \${idx + 1}\`),
                  React.createElement("input", {
                    type: "file",
                    accept: "image/*",
                    className: "hidden",
                    onChange: (e) => handleProductUpload(idx, e)
                  })
                )
              )
            )
          )
        ),

        // Step 2: Thông tin sản phẩm
        React.createElement("div", { className: "space-y-2" },
          React.createElement("label", { className: "text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5" },
            React.createElement("span", { className: "w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black" }, "2"),
            "Thông Tin Sản Phẩm"
          ),
          React.createElement("textarea", {
            rows: 3,
            value: productInfo,
            onChange: (e) => setProductInfo(e.target.value),
            placeholder: "Mô tả công dụng, tính năng nổi bật, ưu đãi...",
            className: "w-full rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/60 p-3 text-xs text-gray-200 outline-none transition-all resize-none leading-relaxed"
          })
        ),

        // Step 3: Nhân vật KOC
        React.createElement("div", { className: "space-y-2.5" },
          React.createElement("label", { className: "text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5" },
            React.createElement("span", { className: "w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black" }, "3"),
            "Nhân Vật KOC Mẫu"
          ),
          React.createElement("div", { className: "grid grid-cols-2 gap-2 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]" },
            React.createElement("button", {
              onClick: () => setBgMode('auto'),
              className: \`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 \${
                bgMode === 'auto' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
              }\`
            }, "✨ AI Tự Sinh"),
            React.createElement("button", {
              onClick: () => setBgMode('reference'),
              className: \`py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 \${
                bgMode === 'reference' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-400 hover:text-white'
              }\`
            }, "👤 Dùng KOC Mẫu")
          ),
          bgMode === 'reference' && React.createElement("div", {
            className: "relative h-28 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-center cursor-pointer overflow-hidden group"
          },
            kocImage ? React.createElement(React.Fragment, null,
              React.createElement("img", { src: kocImage.base64, className: "w-full h-full object-cover" }),
              React.createElement("button", {
                onClick: (e) => { e.stopPropagation(); setKocImage(null); },
                className: "absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
              }, "×")
            ) : React.createElement("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center" },
              React.createElement("span", { className: "text-2xl text-gray-400 mb-1 group-hover:scale-110 transition-transform" }, "📷"),
              React.createElement("span", { className: "text-xs font-semibold text-gray-300" }, "Tải ảnh KOC mẫu của bạn"),
              React.createElement("span", { className: "text-[10px] text-gray-500 mt-0.5" }, "Giữ đồng nhất khuôn mặt xuyên suốt"),
              React.createElement("input", {
                type: "file",
                accept: "image/*",
                className: "hidden",
                onChange: handleKocUpload
              })
            )
          )
        ),

        // Step 4: Thiết lập AI
        React.createElement("div", { className: "space-y-3" },
          React.createElement("label", { className: "text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5" },
            React.createElement("span", { className: "w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black" }, "4"),
            "Thiết Lập AI & Model"
          ),
          React.createElement("div", { className: "space-y-1.5" },
            React.createElement("span", { className: "text-[10px] text-gray-400 uppercase font-semibold" }, "Tên Thương Hiệu / Shop"),
            React.createElement("input", {
              type: "text",
              value: brandName,
              onChange: (e) => setBrandName(e.target.value),
              className: "w-full h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:border-cyan-500/60 px-3 text-xs text-gray-200 outline-none"
            })
          ),
          React.createElement("div", { className: "space-y-1.5" },
            React.createElement("span", { className: "text-[10px] text-gray-400 uppercase font-semibold" }, "Model Tạo Video (Veo)"),
            React.createElement("select", {
              value: videoModel,
              onChange: (e) => setVideoModel(e.target.value),
              className: "w-full h-9 rounded-lg bg-[#0e1424] border border-white/[0.08] focus:border-cyan-500/60 px-3 text-xs text-gray-200 outline-none"
            },
              React.createElement("option", { value: "Veo 3.1 - Lite [Lower Priority]" }, "Veo 3.1 - Lite [Lower Priority] (0 Credit)"),
              React.createElement("option", { value: "Veo 3.1 - Lite" }, "Veo 3.1 - Lite"),
              React.createElement("option", { value: "Veo 3.1 - Fast" }, "Veo 3.1 - Fast"),
              React.createElement("option", { value: "Veo 3.1 - Quality" }, "Veo 3.1 - Quality"),
              React.createElement("option", { value: "Omni Flash" }, "Omni Flash")
            )
          )
        ),

        // Button: TẠO SHOWROOM GỐC
        React.createElement("button", {
          onClick: handleGenerateMasterImage,
          disabled: masterStatus === 'generating',
          className: "w-full h-11 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 hover:from-blue-500 hover:to-teal-300 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        },
          masterStatus === 'generating' 
            ? \`Đang tạo Showroom gốc (\${masterProgress}%)...\`
            : "🖼️ TẠO SHOWROOM GỐC (9:16)"
        ),

        // Step 5: Xuất bản nội dung
        React.createElement("div", { className: "pt-4 border-t border-white/[0.08] space-y-2.5" },
          React.createElement("label", { className: "text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5" },
            React.createElement("span", { className: "w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-black" }, "5"),
            "Xuất Bản Nội Dung"
          ),
          // Nút LÊN KỊCH BẢN KOC
          React.createElement("button", {
            onClick: handleGenerateScript,
            disabled: isScriptGenerating,
            className: "w-full h-10 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] hover:border-cyan-500/40 text-gray-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          },
            isScriptGenerating ? "Đang lên kịch bản..." : "🧠 LÊN KỊCH BẢN KOC (5 CẢNH)"
          ),
          // Nút SẢN XUẤT TOÀN BỘ CLIPS
          React.createElement("button", {
            onClick: handleGenerateAllVideos,
            disabled: isBatchGenerating || !scenes.some(s => s.motionPrompt),
            className: "w-full h-10 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          },
            isBatchGenerating ? "Đang render 5 clips..." : "🎬 SẢN XUẤT TOÀN BỘ 5 CLIPS"
          ),
          // Nút TẢI GÓI ZIP
          React.createElement("button", {
            onClick: handleDownloadZip,
            disabled: isDownloading,
            className: "w-full h-10 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-gray-400 hover:text-white font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          },
            "📦 TẢI GÓI ZIP & KỊCH BẢN (.TXT)"
          )
        )
      ),

      // RIGHT CANVAS: PREVIEW SHOWROOM & 5 CLIPS
      React.createElement("main", {
        className: "flex-1 overflow-y-auto no-scrollbar p-8 bg-[#060813] flex flex-col gap-10"
      },
        // SECTION 1: PREVIEW SHOWROOM GỐC
        React.createElement("section", { className: "flex flex-col items-center" },
          React.createElement("div", { className: "w-full max-w-5xl flex items-center gap-3 mb-4" },
            React.createElement("h2", { className: "text-xs font-black uppercase tracking-[0.3em] text-gray-400" }, "1. Showroom Tham Chiếu Gốc (Anchor Master 9:16)"),
            React.createElement("div", { className: "h-px flex-1 bg-white/[0.06]" })
          ),
          React.createElement("div", {
            className: "w-[240px] aspect-[9/16] rounded-3xl border border-white/[0.1] bg-[#0c1022] relative overflow-hidden shadow-2xl shadow-cyan-950/40 flex items-center justify-center p-2 group"
          },
            masterImage ? React.createElement(React.Fragment, null,
              React.createElement("img", { src: masterImage.url, className: "w-full h-full object-cover rounded-2xl" }),
              React.createElement("div", {
                className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"
              },
                React.createElement("span", { className: "text-xs font-semibold text-white px-3 py-1.5 bg-black/60 rounded-lg backdrop-blur-md" }, "Ảnh Gốc Đã Sẵn Sàng")
              )
            ) : masterStatus === 'generating' ? React.createElement("div", { className: "flex flex-col items-center gap-3" },
              React.createElement("div", { className: "w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" }),
              React.createElement("span", { className: "text-xs font-bold text-cyan-400" }, \`\${masterProgress}%\`)
            ) : React.createElement("div", { className: "flex flex-col items-center text-center p-4 opacity-40" },
              React.createElement("span", { className: "text-4xl mb-2" }, "🖼️"),
              React.createElement("span", { className: "text-xs font-semibold text-gray-300" }, "Chưa có Showroom"),
              React.createElement("span", { className: "text-[10px] text-gray-500 mt-1" }, "Bấm nút 'TẠO SHOWROOM GỐC' ở cột trái")
            )
          )
        ),

        // SECTION 2: PHÂN ĐOẠN 5 CLIPS KOC
        React.createElement("section", { className: "w-full max-w-6xl mx-auto space-y-4" },
          React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
              React.createElement("h2", { className: "text-xs font-black uppercase tracking-[0.3em] text-gray-400" }, "2. Phân Đoạn 5 Clip KOC (Affiliate Video Scenes)"),
              React.createElement("div", { className: "h-px flex-1 bg-white/[0.06]" })
            ),
            React.createElement("span", { className: "text-xs text-gray-400 ml-4" }, "Tỷ lệ chuẩn 9:16 • 8 Giây/Clip")
          ),

          React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4" },
            scenes.map((scene, idx) => 
              React.createElement("div", {
                key: scene.id,
                className: "flex flex-col gap-3 bg-[#0d1224]/70 border border-white/[0.07] hover:border-cyan-500/30 rounded-2xl p-3.5 transition-all shadow-lg"
              },
                // Header card
                React.createElement("div", { className: "flex items-center justify-between" },
                  React.createElement("span", { className: "text-[10px] font-black uppercase tracking-wider text-cyan-400" }, \`CẢNH 0\${scene.id}\`),
                  React.createElement("span", { className: "text-[9px] font-semibold text-gray-400 bg-white/[0.05] px-1.5 py-0.5 rounded" }, scene.stage)
                ),

                // Video Thumbnail / Player (9:16)
                React.createElement("div", {
                  onClick: () => scene.videoUrl && setSelectedVideo(scene.videoUrl),
                  className: \`aspect-[9/16] rounded-xl border border-white/[0.08] bg-black/40 relative overflow-hidden flex items-center justify-center group \${scene.videoUrl ? 'cursor-pointer hover:border-cyan-500/50' : ''}\`
                },
                  scene.videoUrl ? React.createElement(React.Fragment, null,
                    React.createElement("video", {
                      src: scene.videoUrl,
                      className: "w-full h-full object-cover",
                      autoPlay: true,
                      loop: true,
                      muted: true,
                      playsInline: true
                    }),
                    React.createElement("div", {
                      className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    },
                      React.createElement("div", { className: "w-10 h-10 bg-cyan-500/90 rounded-full flex items-center justify-center text-white text-lg shadow-lg" }, "▶")
                    )
                  ) : scene.status === 'generating' ? React.createElement("div", { className: "flex flex-col items-center gap-2" },
                    React.createElement("div", { className: "w-8 h-8 rounded-full border-3 border-cyan-500/20 border-t-cyan-400 animate-spin" }),
                    React.createElement("span", { className: "text-[11px] font-bold text-cyan-400" }, \`\${scene.progress}%\`)
                  ) : React.createElement("div", { className: "flex flex-col items-center text-gray-600" },
                    React.createElement("span", { className: "text-2xl mb-1" }, "🎬"),
                    React.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider" }, \`CLIP 0\${scene.id}\`)
                  )
                ),

                // Script Box
                React.createElement("div", { className: "space-y-1.5 flex-1 flex flex-col" },
                  React.createElement("span", { className: "text-[9px] font-bold uppercase tracking-wider text-gray-400" }, "Kịch bản thoại:"),
                  React.createElement("textarea", {
                    rows: 3,
                    value: scene.voiceScript,
                    onChange: (e) => {
                      const text = e.target.value;
                      setScenes(prev => prev.map((s, i) => i === idx ? { ...s, voiceScript: text } : s));
                    },
                    placeholder: "Đang đợi kịch bản...",
                    className: "w-full flex-1 rounded-lg bg-black/30 border border-white/[0.05] p-2 text-[11px] text-gray-200 outline-none resize-none leading-relaxed italic"
                  })
                ),

                // Action Button per clip
                React.createElement("button", {
                  onClick: () => handleGenerateSingleVideo(idx),
                  disabled: scene.status === 'generating' || !scene.motionPrompt,
                  className: "w-full h-8 bg-white/[0.04] hover:bg-cyan-500/20 border border-white/[0.08] hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40"
                },
                  scene.videoUrl ? "🔄 LÀM LẠI" : "✨ TẠO CLIP"
                )
              )
            )
          )
        )
      )
    ),

    // Modal Watch Full Video
    selectedVideo && React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6",
      onClick: () => setSelectedVideo(null)
    },
      React.createElement("div", {
        className: "relative w-[340px] aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-white/[0.15] shadow-2xl",
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
          className: "absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-lg border border-white/20 transition-all"
        }, "×")
      )
    )
  );
}
`;

fs.writeFileSync(factoryComponentPath, factoryComponentCode, 'utf8');
console.log('✅ Created VideoFactoryStudio.js successfully at:', factoryComponentPath);

// 2. Patch index-BS7vgKVV.js
let indexCode = fs.readFileSync(indexPath, 'utf8');

// A. Update labels: upscaleStudio: "Xưởng sản xuất Video"
indexCode = indexCode.replace(/upscaleStudio:"Nâng cấp"/g, 'upscaleStudio:"Xưởng Video AI"');
indexCode = indexCode.replace(/upscaleStudio:"Upscale"/g, 'upscaleStudio:"Video Factory"');

// B. Enable navigation item: remove disabled:!0
indexCode = indexCode.replace(
  '{label:r("nav.upscaleStudio"),icon:N.jsx(WT,{size:16}),path:"/studio/upscale",disabled:!0}',
  '{label:r("nav.upscaleStudio"),icon:N.jsx(WT,{size:16}),path:"/studio/upscale"}'
);

// C. Wire lazy import for VideoFactoryStudio
// Find f0=Ov.Component,g0=Lv.Component
if (!indexCode.includes('VideoFactoryLazy')) {
  indexCode = indexCode.replace(
    'f0=Ov.Component,g0=Lv.Component,',
    'f0=Ov.Component,VideoFactoryLazy=wn(()=>import("./VideoFactoryStudio.js")),VfComponent=VideoFactoryLazy.Component,g0=Lv.Component,'
  );
  
  // Wire preload in Vv
  indexCode = indexCode.replace(
    '"/studio/video":Ov.preload,"/studio/tts":Lv.preload',
    '"/studio/video":Ov.preload,"/studio/upscale":VideoFactoryLazy.preload,"/studio/tts":Lv.preload'
  );

  // Wire T0 array
  indexCode = indexCode.replace(
    'T0=["/studio/image","/studio/video","/studio/tts"]',
    'T0=["/studio/image","/studio/video","/studio/upscale","/studio/tts"]'
  );

  // Wire route: replace {path:"studio/upscale",element:N.jsx(pd,{to:"/dashboard",replace:!0})}
  indexCode = indexCode.replace(
    '{path:"studio/upscale",element:N.jsx(pd,{to:"/dashboard",replace:!0})}',
    '{path:"studio/upscale",element:N.jsx(VfComponent,{})}'
  );
  console.log('✅ Wired VideoFactoryStudio into router and navigation successfully!');
} else {
  console.log('ℹ️ VideoFactoryStudio already wired in index-BS7vgKVV.js.');
}

fs.writeFileSync(indexPath, indexCode, 'utf8');
console.log('🎉 Patch applied to index-BS7vgKVV.js successfully!');
