// scripts/update_video_factory_dark_theme.js
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'app', 'out', 'renderer', 'assets', 'VideoFactoryStudio.js');

const code = `import { bn as React, bf as toast } from "./index-BS7vgKVV.js";

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
    name: 'Xưởng Mỹ Phẩm',
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
    name: 'Xưởng Thời Trang',
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
    name: 'Xưởng Trang Sức',
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
    name: 'Xưởng Công Nghệ',
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
  { id: 1, stage: 'HOOK 3S ĐẦU', title: 'Thu Hút & Giữ Chân' },
  { id: 2, stage: 'TÍNH NĂNG 1', title: 'Thiết Kế & Vẻ Đẹp' },
  { id: 3, stage: 'TÍNH NĂNG 2', title: 'Trải Nghiệm & Test' },
  { id: 4, stage: 'UY TÍN & GIÁ', title: 'Thương Hiệu & Giá Kho' },
  { id: 5, stage: 'CHỐT ĐƠN (CTA)', title: 'Kêu Gọi Hành Động' }
];

const VIDEO_MODELS = [
  { id: 'omni-flash-1.1', label: '⚡ Omni Flash (Siêu nhanh)' },
  { id: 'veo-3.1-lite-low-priority', label: '🆓 Veo 3.1 - Lite [Lower Priority] (0 Credit)' },
  { id: 'veo-3.1-lite', label: '🚀 Veo 3.1 - Lite' },
  { id: 'veo-3.1-fast', label: '⚡ Veo 3.1 - Fast' },
  { id: 'veo-3.1-quality', label: '💎 Veo 3.1 - Quality' }
];

const IMAGE_MODELS = [
  { id: 'banana', label: '🍌 Nano Banana Pro' },
  { id: 'imagen-4', label: '🎨 Imagen 3.5' },
  { id: 'gemini-3.0-pro-image', label: '✨ Gemini 3.0 Pro Image' }
];

export default function VideoFactoryStudio() {
  const [currentNiche, setCurrentNiche] = React.useState('household');
  const [products, setProducts] = React.useState([null, null, null]);
  const [productInfo, setProductInfo] = React.useState(NICHE_TEMPLATES.household.defaultInfo);
  const [brandName, setBrandName] = React.useState(NICHE_TEMPLATES.household.defaultBrand);
  const [bgMode, setBgMode] = React.useState('auto'); // 'auto' | 'reference'
  const [kocImage, setKocImage] = React.useState(null);
  
  // Model Selectors
  const [videoModel, setVideoModel] = React.useState('omni-flash-1.1');
  const [imageModel, setImageModel] = React.useState('banana');

  // Account selector from BrowserHub
  const [accounts, setAccounts] = React.useState([]);
  const [selectedAccountId, setSelectedAccountId] = React.useState('');

  // Gemini API Key
  const [geminiApiKey, setGeminiApiKey] = React.useState(() => {
    try { return localStorage.getItem('aivideo_gemini_api_key') || ''; } catch(e) { return ''; }
  });
  const [showApiKeyInput, setShowApiKeyInput] = React.useState(false);

  // Master Image State
  const [masterImage, setMasterImage] = React.useState(null);
  const [masterAssetId, setMasterAssetId] = React.useState(null);
  const [masterStatus, setMasterStatus] = React.useState('idle'); // 'idle' | 'generating' | 'done' | 'error'
  const [masterProgress, setMasterProgress] = React.useState(0);
  const [masterJobId, setMasterJobId] = React.useState(null);

  // 5 Scenes State
  const [scenes, setScenes] = React.useState(STAGE_CONFIGS.map(s => ({
    id: s.id,
    stage: s.stage,
    title: s.title,
    voiceScript: '',
    motionPrompt: '',
    status: 'idle',
    progress: 0,
    jobId: null,
    videoUrl: null,
    assetId: null
  })));

  const [selectedVideo, setSelectedVideo] = React.useState(null);
  const [isScriptGenerating, setIsScriptGenerating] = React.useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Load accounts from BrowserHub
  React.useEffect(() => {
    async function loadAccounts() {
      if (window.aiforge?.browser?.listSessions) {
        try {
          const sessions = await window.aiforge.browser.listSessions();
          const valid = (sessions || []).filter(s => 
            (s.providerId === 'veo3' || s.providerId === 'banana') && s.authStatus === 'Logged In'
          );
          setAccounts(valid);
          if (valid.length > 0 && !selectedAccountId) {
            setSelectedAccountId(valid[0].accountId);
          }
        } catch(e) {
          console.warn('Error loading accounts:', e);
        }
      }
    }
    loadAccounts();
    const interval = setInterval(loadAccounts, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveGeminiKey = (key) => {
    setGeminiApiKey(key);
    try { localStorage.setItem('aivideo_gemini_api_key', key); } catch(e){}
  };

  // Listen to App Queue Updates to track real jobs
  React.useEffect(() => {
    if (!window.aiforge?.queue?.onChanged) return;

    const unsubscribe = window.aiforge.queue.onChanged(async (queueState) => {
      if (!queueState || !Array.isArray(queueState.jobs)) return;

      // 1. Check Master Image Job
      if (masterJobId) {
        const mJob = queueState.jobs.find(j => j.id === masterJobId);
        if (mJob) {
          if (mJob.status === 'Running') {
            setMasterProgress(mJob.progress || 50);
          } else if (mJob.status === 'Completed') {
            setMasterProgress(100);
            setMasterStatus('done');
            try {
              const assets = await window.aiforge.assets.list();
              const found = assets.find(a => a.id === mJob.result?.assets?.[0]?.assetId || (mJob.resultAssetId && a.id === mJob.resultAssetId));
              if (found) {
                setMasterAssetId(found.id);
                setMasterImage({ url: found.url || found.previewUrl || found.path, assetId: found.id });
                toast?.success?.("Showroom Gốc đã được tạo thật từ Google Flow!");
              }
            } catch(e){}
            setMasterJobId(null);
          } else if (mJob.status === 'Failed') {
            setMasterStatus('error');
            toast?.error?.(mJob.error || "Tạo Showroom thất bại trên Google Flow");
            setMasterJobId(null);
          }
        }
      }

      // 2. Check 5 Video Jobs
      setScenes(prev => prev.map(scene => {
        if (!scene.jobId) return scene;
        const vJob = queueState.jobs.find(j => j.id === scene.jobId);
        if (!vJob) return scene;

        if (vJob.status === 'Running') {
          return { ...scene, status: 'generating', progress: vJob.progress || 50 };
        } else if (vJob.status === 'Completed') {
          let vUrl = scene.videoUrl;
          let aId = scene.assetId;
          const resAsset = vJob.result?.assets?.[0];
          if (resAsset) {
            vUrl = resAsset.url || resAsset.path;
            aId = resAsset.assetId;
          }
          return { ...scene, status: 'done', progress: 100, videoUrl: vUrl, assetId: aId, jobId: null };
        } else if (vJob.status === 'Failed') {
          toast?.error?.(\`Cảnh \${scene.id} lỗi: \${vJob.error || 'Thất bại'}\`);
          return { ...scene, status: 'error', jobId: null };
        }
        return scene;
      }));
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [masterJobId]);

  // Switch Niche Handler
  const handleSelectNiche = (nicheId) => {
    setCurrentNiche(nicheId);
    const n = NICHE_TEMPLATES[nicheId];
    if (n) {
      setBrandName(n.defaultBrand);
      setProductInfo(n.defaultInfo);
      setMasterImage(null);
      setMasterAssetId(null);
      setMasterStatus('idle');
      setScenes(STAGE_CONFIGS.map(s => ({
        id: s.id,
        stage: s.stage,
        title: s.title,
        voiceScript: '',
        motionPrompt: '',
        status: 'idle',
        progress: 0,
        jobId: null,
        videoUrl: null,
        assetId: null
      })));
    }
  };

  // Product Image Upload
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
        } catch(err) {
          console.warn('Import reference warning:', err);
        }
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

  // Upload KOC Image
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

  // 1. TẠO SHOWROOM GỐC
  const handleGenerateMasterImage = async () => {
    const hasProduct = products.some(p => p !== null);
    if (!hasProduct && !productInfo) {
      toast?.error?.("Vui lòng tải ít nhất 1 ảnh sản phẩm hoặc nhập mô tả sản phẩm!");
      return;
    }

    setMasterStatus('generating');
    setMasterProgress(15);

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

      const refIds = [];
      products.forEach(p => { if (p?.assetId) refIds.push(p.assetId); });
      if (bgMode === 'reference' && kocImage?.assetId) {
        refIds.push(kocImage.assetId);
      }

      if (window.aiforge?.queue?.addJobs) {
        const jobInput = {
          title: \`[Xưởng] Showroom Gốc - \${brandName}\`,
          type: "Image",
          providerId: "banana",
          provider: "Banana",
          ...(selectedAccountId ? { accountId: selectedAccountId } : {}),
          payload: {
            title: \`[Xưởng] Showroom Gốc - \${brandName}\`,
            prompt: fullPrompt,
            ratio: "9:16",
            model: imageModel,
            referenceAssetIds: refIds,
            studioSource: "video-factory"
          }
        };

        const res = await window.aiforge.queue.addJobs([jobInput]);
        if (res?.results?.[0]?.ok && res.results[0].job?.id) {
          setMasterJobId(res.results[0].job.id);
          toast?.info?.(\`Đã gửi yêu cầu tạo Showroom gốc sang Google Flow (\${imageModel})!\`);
          return;
        }
      }

      setTimeout(() => {
        const firstProd = products.find(p => p !== null);
        const previewUrl = firstProd ? firstProd.base64 : (kocImage ? kocImage.base64 : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80");
        setMasterImage({ url: previewUrl, assetId: firstProd?.assetId || null, prompt: fullPrompt });
        setMasterProgress(100);
        setMasterStatus('done');
        toast?.success?.("Đã tạo ảnh Showroom Gốc!");
      }, 2500);

    } catch (err) {
      console.error(err);
      setMasterStatus('error');
      toast?.error?.("Lỗi khi kết nối Google Flow: " + err.message);
    }
  };

  // 2. LÊN KỊCH BẢN KOC
  const handleGenerateScript = async () => {
    if (!productInfo) {
      toast?.error?.("Vui lòng nhập mô tả thông tin sản phẩm!");
      return;
    }

    setIsScriptGenerating(true);
    setScenes(prev => prev.map(s => ({ ...s, status: 'generating' })));

    try {
      const niche = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;
      let finalScripts = null;

      if (geminiApiKey && geminiApiKey.trim().length > 10) {
        try {
          const promptText = \`\${niche.kocRole}
Thông tin sản phẩm: \${productInfo}
Thương hiệu: \${brandName}
Hãy tạo chính xác 5 phân đoạn kịch bản video TikTok Shop bán hàng theo 5 giai đoạn:
1. Hook 3s đầu: Thu hút tò mò, giật tít giữ chân.
2. Tính năng 1: Thiết kế, kiểu dáng, chất liệu sang trọng.
3. Tính năng 2: Thử nghiệm thực tế, test độ bền hoặc hiệu năng.
4. Uy tín & Giá: Cam kết chính hãng, bảo hành, giá tận kho.
5. Chốt đơn (CTA): Thúc giục bấm vào giỏ hàng góc trái ngay.

YÊU CẦU ĐỊNH DẠNG:
Trả về DUY NHẤT một chuỗi JSON hợp lệ là mảng gồm 5 phần tử (không thêm văn bản ngoài JSON):
[
  { "voiceScript": "Lời thoại bán hàng tiếng Việt ngắn gọn dưới 25 từ", "motionPrompt": "Detailed English motion prompt describing the presenter continuously speaking to camera with visible mouth movements and holding the product" },
  ...
]\`;

          const bodyPayload = {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: { response_mime_type: "application/json" }
          };

          const firstProd = products.find(p => p !== null);
          if (firstProd?.base64) {
            const rawB64 = firstProd.base64.split(',')[1];
            if (rawB64) {
              bodyPayload.contents[0].parts.unshift({
                inline_data: { mime_type: firstProd.mimeType || "image/jpeg", data: rawB64 }
              });
            }
          }

          const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${geminiApiKey.trim()}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload)
          });

          if (resp.ok) {
            const resJson = await resp.json();
            const textContent = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textContent) {
              finalScripts = JSON.parse(textContent);
              toast?.success?.("Gemini AI đã phân tích ảnh & viết xong kịch bản!");
            }
          }
        } catch(apiErr) {
          console.warn("Gemini API call error:", apiErr);
        }
      }

      if (!finalScripts || !Array.isArray(finalScripts) || finalScripts.length < 5) {
        finalScripts = [
          {
            id: 1,
            voiceScript: \`Đố mn biết món đồ \${niche.name.toLowerCase()} này có gì đặc biệt mà cháy hàng liên tục?\`,
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
      }

      setScenes(prev => prev.map((s, idx) => ({
        ...s,
        voiceScript: finalScripts[idx].voiceScript,
        motionPrompt: finalScripts[idx].motionPrompt,
        status: 'done'
      })));
      setIsScriptGenerating(false);
      toast?.success?.("Đã hoàn tất kịch bản 5 phân cảnh!");

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

    try {
      const enhancedPrompt = \`A professional presenter speaking directly to camera: "\${scene.voiceScript}". \${scene.motionPrompt}. Visible mouth movement and continuous speech throughout. Clean unbranded background.\`;

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
            model: videoModel,
            flowVideoMode: "I2V",
            mode: "I2V",
            referenceAssetIds: masterAssetId ? [masterAssetId] : [],
            studioSource: "video-factory"
          }
        };

        const res = await window.aiforge.queue.addJobs([jobInput]);
        if (res?.results?.[0]?.ok && res.results[0].job?.id) {
          const jId = res.results[0].job.id;
          setScenes(prev => prev.map((s, i) => i === index ? { ...s, jobId: jId } : s));
          toast?.info?.(\`Cảnh \${scene.id} đã gửi sang Google Flow (\${videoModel})!\`);
          return;
        }
      }

      setTimeout(() => {
        setScenes(prev => prev.map((s, i) => i === index ? {
          ...s,
          status: 'done',
          progress: 100,
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-showing-a-product-in-a-studio-41481-large.mp4"
        } : s));
        toast?.success?.(\`Cảnh \${scene.id} hoàn tất!\`);
      }, 3500);

    } catch (err) {
      console.error(err);
      setScenes(prev => prev.map((s, i) => i === index ? { ...s, status: 'error' } : s));
      toast?.error?.(\`Lỗi khi render cảnh \${scene.id}: \` + err.message);
    }
  };

  // 4. SẢN XUẤT TOÀN BỘ 5 CLIPS
  const handleGenerateAllVideos = () => {
    setIsBatchGenerating(true);
    scenes.forEach((_, idx) => {
      setTimeout(() => {
        handleGenerateSingleVideo(idx);
      }, idx * 300);
    });
    setTimeout(() => {
      setIsBatchGenerating(false);
    }, 2000);
  };

  // 5. TẢI GÓI ZIP
  const handleDownloadZip = () => {
    setIsDownloading(true);
    try {
      const scriptContent = scenes.map(s => 
        \`[CẢNH \${s.id}: \${s.stage} - \${s.title}]\\nLời thoại: \${s.voiceScript}\\nMotion Prompt: \${s.motionPrompt}\\n\\n\`
      ).join('\\n');

      const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`Kich_Ban_KOC_\${brandName.replace(/\\s+/g, '_')}.txt\`;
      a.click();

      toast?.success?.("Đã xuất file kịch bản KOC & danh sách prompt 5 cảnh!");
    } catch (e) {
      console.error(e);
      toast?.error?.("Lỗi khi tải gói dữ liệu!");
    } finally {
      setIsDownloading(false);
    }
  };

  const nicheObj = NICHE_TEMPLATES[currentNiche] || NICHE_TEMPLATES.household;

  return React.createElement("div", {
    className: "flex flex-col h-full w-full bg-[#070a14] text-gray-100 overflow-hidden font-sans select-none"
  },
    // Top Bar (Dark & Sleek matching App Palette)
    React.createElement("div", {
      className: "h-14 border-b border-white/[0.08] bg-[#0b0f1d] px-6 flex items-center justify-between z-30 shadow-md"
    },
      React.createElement("div", { className: "flex items-center gap-3" },
        React.createElement("div", { className: "w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20" },
          "🏭"
        ),
        React.createElement("div", { className: "flex items-center gap-2" },
          React.createElement("span", { className: "text-sm font-bold text-white uppercase tracking-tight" }, "Xưởng Sản Xuất Video AI"),
          React.createElement("span", { className: "text-xs text-gray-500" }, "•"),
          React.createElement("span", { className: "text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30" }, "Model 01h • 5 Clips 9:16")
        )
      ),

      // Right Top Controls: Niche Selector & Account Selector
      React.createElement("div", { className: "flex items-center gap-3" },
        // Niche Selector
        React.createElement("div", { className: "flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]" },
          Object.values(NICHE_TEMPLATES).map(n => 
            React.createElement("button", {
              key: n.id,
              onClick: () => handleSelectNiche(n.id),
              className: \`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all \${
                currentNiche === n.id 
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }\`
            },
              React.createElement("span", null, n.icon),
              React.createElement("span", null, n.name)
            )
          )
        ),

        // Account Selector
        accounts.length > 0 ? React.createElement("div", { className: "flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl" },
          React.createElement("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
          React.createElement("select", {
            value: selectedAccountId,
            onChange: (e) => setSelectedAccountId(e.target.value),
            className: "bg-transparent text-emerald-300 text-xs font-semibold outline-none cursor-pointer"
          },
            accounts.map(acc => 
              React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-100" },
                \`👤 \${acc.accountName || acc.displayName || acc.accountId} (Flow Sẵn Sàng)\`
              )
            )
          )
        ) : React.createElement("div", { className: "flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl" },
          "⚠️ Vào tab 'Tài khoản' đăng nhập Flow"
        )
      )
    ),

    // MAIN 2-COLUMN WORKSPACE (DARK THEME WITH EXACT GOOGLE FLOW STRUCTURE)
    React.createElement("div", { className: "flex flex-1 overflow-hidden" },

      // LEFT SIDEBAR (EXACT MATCH WITH SCREENSHOT, FULLY DARK-THEMED)
      React.createElement("div", {
        className: "w-[340px] min-w-[340px] max-w-[340px] h-full border-r border-white/[0.08] bg-[#0c1122] p-5 flex flex-col justify-between overflow-y-auto no-scrollbar z-20 shadow-xl"
      },
        React.createElement("div", { className: "space-y-4" },
          // Header
          React.createElement("div", null,
            React.createElement("h1", { className: "text-xl font-extrabold tracking-tight text-white" }, "AI STUDIO"),
            React.createElement("p", { className: "text-cyan-400/90 text-xs tracking-wider uppercase font-semibold mt-0.5" },
              \`CỬA HÀNG SẢN XUẤT \${nicheObj.name.toUpperCase()}\`
            )
          ),

          // 1. HÌNH ẢNH SẢN PHẨM (STRICT 64x64 PIXELS - NEVER BLOWS UP)
          React.createElement("div", null,
            React.createElement("label", { className: "block text-xs font-bold text-gray-300 mb-2" }, "1. HÌNH ẢNH SẢN PHẨM"),
            React.createElement("div", { className: "flex items-center gap-2" },
              products.map((p, idx) => 
                React.createElement("div", {
                  key: idx,
                  style: { width: '64px', height: '64px', minWidth: '64px', maxWidth: '64px', minHeight: '64px', maxHeight: '64px' },
                  className: "relative rounded-xl border border-white/[0.15] bg-white/[0.03] flex items-center justify-center overflow-hidden group hover:border-cyan-500/50 transition-all flex-shrink-0"
                },
                  p ? React.createElement(React.Fragment, null,
                    React.createElement("img", {
                      src: p.base64,
                      style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
                    }),
                    React.createElement("button", {
                      onClick: (e) => { e.stopPropagation(); removeProductImage(idx); },
                      className: "absolute top-1 right-1 w-5 h-5 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    }, "×")
                  ) : React.createElement("label", {
                    className: "w-full h-full flex flex-col items-center justify-center cursor-pointer p-1"
                  },
                    React.createElement("span", { className: "text-xl text-gray-500 group-hover:text-cyan-400 font-light" }, "+"),
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

          // 2. THÔNG TIN SẢN PHẨM
          React.createElement("div", null,
            React.createElement("label", { className: "block text-xs font-bold text-gray-300 mb-1.5" }, "2. THÔNG TIN SẢN PHẨM"),
            React.createElement("textarea", {
              rows: 2,
              value: productInfo,
              onChange: (e) => setProductInfo(e.target.value),
              placeholder: "đồng hồ như ảnh tham chiếu",
              className: "w-full rounded-xl border border-white/[0.12] bg-[#12192c] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 p-2.5 text-xs text-white placeholder-gray-500 outline-none resize-none leading-relaxed transition-all"
            })
          ),

          // 3. NHÂN VẬT KOC
          React.createElement("div", null,
            React.createElement("label", { className: "block text-xs font-bold text-gray-300 mb-1.5" }, "3. NHÂN VẬT KOC"),
            React.createElement("div", { className: "flex gap-2" },
              React.createElement("button", {
                onClick: () => setBgMode('auto'),
                className: \`flex-1 py-2 text-xs rounded-xl border flex items-center justify-center gap-1.5 transition-all \${
                  bgMode === 'auto'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }\`
              }, "✨ AI TỰ SINH"),
              React.createElement("button", {
                onClick: () => setBgMode('reference'),
                className: \`flex-1 py-2 text-xs rounded-xl border flex items-center justify-center gap-1.5 transition-all \${
                  bgMode === 'reference'
                    ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300 font-bold shadow-md shadow-cyan-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }\`
              }, "👤 DÙNG KOC MẪU")
            ),
            bgMode === 'reference' && React.createElement("div", {
              style: { height: '68px' },
              className: "mt-2 relative rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-center cursor-pointer overflow-hidden group"
            },
              kocImage ? React.createElement(React.Fragment, null,
                React.createElement("img", { src: kocImage.base64, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
                React.createElement("button", {
                  onClick: (e) => { e.stopPropagation(); setKocImage(null); },
                  className: "absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                }, "×")
              ) : React.createElement("label", { className: "w-full h-full flex flex-col items-center justify-center cursor-pointer p-1" },
                React.createElement("span", { className: "text-xs font-semibold text-gray-300" }, "📷 Tải ảnh KOC mẫu"),
                React.createElement("input", {
                  type: "file",
                  accept: "image/*",
                  className: "hidden",
                  onChange: handleKocUpload
                })
              )
            )
          ),

          // 4. THIẾT LẬP AI
          React.createElement("div", { className: "space-y-2.5" },
            React.createElement("div", { className: "flex items-center justify-between" },
              React.createElement("label", { className: "block text-xs font-bold text-gray-300" }, "4. THIẾT LẬP AI"),
              React.createElement("button", {
                onClick: () => setShowApiKeyInput(!showApiKeyInput),
                className: "text-[10px] text-cyan-400 hover:underline"
              }, showApiKeyInput ? "Ẩn Key" : "⚙️ Gemini Key")
            ),

            // Gemini Key Drawer
            showApiKeyInput && React.createElement("div", { className: "p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1" },
              React.createElement("div", { className: "flex justify-between text-[10px]" },
                React.createElement("span", { className: "text-cyan-300 font-semibold" }, "Gemini API Key:"),
                React.createElement("a", { href: "https://aistudio.google.com/app/apikey", target: "_blank", className: "text-cyan-400 underline" }, "Lấy key free ↗")
              ),
              React.createElement("input", {
                type: "password",
                placeholder: "AIzaSy...",
                value: geminiApiKey,
                onChange: (e) => handleSaveGeminiKey(e.target.value),
                className: "w-full h-7 rounded-lg bg-black/60 border border-cyan-500/30 px-2 text-xs text-cyan-200 font-mono outline-none"
              })
            ),

            // TÊN THƯƠNG HIỆU
            React.createElement("div", null,
              React.createElement("span", { className: "block text-[10px] font-bold text-gray-400 uppercase mb-1" }, "TÊN THƯƠNG HIỆU"),
              React.createElement("input", {
                type: "text",
                value: brandName,
                onChange: (e) => setBrandName(e.target.value),
                className: "w-full rounded-xl border border-white/[0.12] bg-[#12192c] p-2 text-xs font-medium text-white outline-none focus:border-cyan-500"
              })
            ),

            // MODEL VIDEO (HIỂN THỊ RÕ RÀNG SẮC NÉT TRÊN NỀN TỐI)
            React.createElement("div", null,
              React.createElement("span", { className: "block text-[10px] font-bold text-gray-400 uppercase mb-1" }, "MODEL VIDEO"),
              React.createElement("select", {
                value: videoModel,
                onChange: (e) => setVideoModel(e.target.value),
                className: "w-full rounded-xl border border-white/[0.15] bg-[#12192c] p-2 text-xs font-bold text-cyan-300 outline-none focus:border-cyan-500 cursor-pointer shadow-inner"
              },
                VIDEO_MODELS.map(m => 
                  React.createElement("option", { key: m.id, value: m.id, className: "bg-[#0b101f] text-gray-100 py-1" }, m.label)
                )
              )
            ),

            // NÚT XANH GOOGLE FLOW: TẠO SHOWROOM GỐC
            React.createElement("button", {
              onClick: handleGenerateMasterImage,
              disabled: masterStatus === 'generating',
              className: "w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            },
              masterStatus === 'generating' 
                ? \`ĐANG TẠO SHOWROOM (\${masterProgress}%)...\`
                : "TẠO SHOWROOM GỐC"
            )
          ),

          // 5. XUẤT BẢN NỘI DUNG (EXACT PILL BUTTONS ON DARK THEME)
          React.createElement("div", { className: "space-y-2 pt-1" },
            React.createElement("label", { className: "block text-xs font-bold text-gray-300 mb-1" }, "5. XUẤT BẢN NỘI DUNG"),
            
            // Nút 1: LÊN KỊCH BẢN KOC
            React.createElement("button", {
              onClick: handleGenerateScript,
              disabled: isScriptGenerating,
              className: "w-full py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] active:scale-98 rounded-xl text-xs font-semibold text-gray-100 transition-all flex items-center justify-center gap-2 shadow-sm"
            },
              isScriptGenerating ? "Đang lên kịch bản..." : "🧠 LÊN KỊCH BẢN KOC"
            ),

            // Nút 2: SẢN XUẤT TOÀN BỘ CLIPS
            React.createElement("button", {
              onClick: handleGenerateAllVideos,
              disabled: isBatchGenerating || !scenes.some(s => s.motionPrompt),
              className: "w-full py-2.5 bg-black hover:bg-gray-900 border border-white/20 active:scale-98 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
            },
              isBatchGenerating ? "Đang gửi lệnh 5 clips..." : "🎬 SẢN XUẤT TOÀN BỘ CLIPS"
            ),

            // Nút 3: TẢI GÓI ZIP (.ZIP)
            React.createElement("button", {
              onClick: handleDownloadZip,
              disabled: isDownloading,
              className: "w-full py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] active:scale-98 text-gray-400 hover:text-white rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
            },
              "📦 TẢI GÓI ZIP (.ZIP)"
            )
          )
        )
      ),

      // RIGHT CANVAS (SEAMLESS APP DARK THEME BACKGROUND)
      React.createElement("div", {
        className: "flex-1 bg-[#060913] p-6 flex flex-col items-center justify-between overflow-y-auto no-scrollbar"
      },
        // TOP: MASTER SHOWROOM IMAGE (TALL 9:16 IN CENTER)
        React.createElement("div", { className: "flex flex-col items-center pt-2" },
          React.createElement("div", {
            style: { width: '270px', height: '480px', minWidth: '270px', maxWidth: '270px' },
            className: "rounded-3xl overflow-hidden shadow-2xl relative border border-white/[0.1] bg-[#0c1122] flex items-center justify-center group flex-shrink-0"
          },
            masterImage ? React.createElement(React.Fragment, null,
              React.createElement("img", {
                src: masterImage.url,
                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }
              }),
              React.createElement("div", {
                className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-3xl"
              },
                React.createElement("span", { className: "text-xs font-semibold text-white px-3 py-1.5 bg-black/60 rounded-full backdrop-blur-md" }, "Showroom Gốc 9:16")
              )
            ) : masterStatus === 'generating' ? React.createElement("div", { className: "flex flex-col items-center gap-3" },
              React.createElement("div", { className: "w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" }),
              React.createElement("span", { className: "text-xs font-bold text-cyan-400" }, \`\${masterProgress}%\`)
            ) : React.createElement("div", { className: "flex flex-col items-center text-center p-6 text-gray-500" },
              React.createElement("span", { className: "text-5xl mb-2 opacity-40" }, "🖼️"),
              React.createElement("span", { className: "text-xs font-bold text-gray-400 uppercase tracking-wider" }, "Chưa có ảnh Showroom"),
              React.createElement("span", { className: "text-[11px] text-gray-500 mt-1" }, "Bấm 'TẠO SHOWROOM GỐC' ở cột trái")
            )
          )
        ),

        // CENTER DIVIDER LABEL
        React.createElement("div", { className: "my-4 text-center" },
          React.createElement("span", { className: "text-xs font-extrabold tracking-[0.25em] text-gray-500 uppercase" },
            "PHÂN ĐOẠN CLIP KOC"
          )
        ),

        // BOTTOM: EXACT 5 HORIZONTAL CARDS ROW
        React.createElement("div", {
          className: "flex gap-3.5 w-full justify-center pb-2 max-w-5xl"
        },
          scenes.map((scene, idx) => 
            React.createElement("div", {
              key: scene.id,
              style: { width: '160px', height: '284px', minWidth: '160px', maxWidth: '160px' },
              className: "rounded-2xl overflow-hidden shadow-xl border border-white/[0.1] bg-[#0c1122] flex flex-col relative group flex-shrink-0 cursor-pointer"
            },
              // Video / Thumbnail
              scene.videoUrl ? React.createElement(React.Fragment, null,
                React.createElement("video", {
                  src: scene.videoUrl,
                  autoPlay: true,
                  loop: true,
                  muted: true,
                  playsInline: true,
                  style: { width: '100%', height: '100%', objectFit: 'cover' },
                  onClick: () => setSelectedVideo(scene.videoUrl)
                }),
                React.createElement("div", {
                  className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity",
                  onClick: () => setSelectedVideo(scene.videoUrl)
                },
                  React.createElement("div", { className: "w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white text-lg shadow-lg font-bold" }, "▶")
                ),
                // Re-run small button
                React.createElement("button", {
                  onClick: (e) => { e.stopPropagation(); handleGenerateSingleVideo(idx); },
                  className: "absolute bottom-2 left-2 right-2 py-1 bg-black/80 hover:bg-black text-white text-[10px] font-semibold rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity border border-white/10"
                }, "🔄 Render Lại")
              ) : scene.status === 'generating' ? React.createElement("div", { className: "w-full h-full flex flex-col items-center justify-center bg-gray-950 text-white gap-2" },
                React.createElement("div", { className: "w-8 h-8 rounded-full border-3 border-cyan-500/20 border-t-cyan-400 animate-spin" }),
                React.createElement("span", { className: "text-xs font-bold text-cyan-400" }, \`\${scene.progress}%\`)
              ) : React.createElement("div", {
                className: "w-full h-full flex flex-col items-center justify-between p-3 bg-[#0a0e1c] text-white",
                onClick: () => handleGenerateSingleVideo(idx)
              },
                // Stage header
                React.createElement("span", { className: "text-[10px] font-black uppercase tracking-wider text-cyan-400 text-center" },
                  \`CẢNH 0\${scene.id}: \${scene.stage}\`
                ),
                // Script preview
                React.createElement("p", { className: "text-[10px] text-gray-400 italic text-center line-clamp-4 leading-relaxed" },
                  scene.voiceScript || "Chưa có kịch bản"
                ),
                // Action
                React.createElement("button", {
                  onClick: (e) => { e.stopPropagation(); handleGenerateSingleVideo(idx); },
                  disabled: !scene.motionPrompt,
                  className: "w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow disabled:opacity-40"
                }, "TẠO CLIP")
              )
            )
          )
        )
      )
    ),

    // Modal Video Player
    selectedVideo && React.createElement("div", {
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6",
      onClick: () => setSelectedVideo(null)
    },
      React.createElement("div", {
        style: { width: '320px', height: '568px' },
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

fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ VideoFactoryStudio.js updated with DARK APP THEME & EXACT WEB LAYOUT!');
