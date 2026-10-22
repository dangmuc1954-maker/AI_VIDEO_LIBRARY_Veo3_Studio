const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync('scripts/catalog_full.json', 'utf-8'));

// Helper to create valid node structure
function makeNode(id, type, title, x, y, width, height, inputs, outputs, config, slug) {
  return {
    id,
    type,
    title,
    x,
    y,
    width: width || 320,
    height: height || 200,
    enabled: true,
    active: false,
    inputs: inputs || [],
    outputs: outputs || [],
    config: config || {},
    slug: slug || type
  };
}

function makeConn(id, fromNode, fromPort, toNode, toPort) {
  return { id, fromNode, fromPort, toNode, toPort };
}

// Map each product to a full node definition
const workflowDefinitions = {
  // 1. Công xưởng gia công đa ngành
  "2f0f0fed-b25f-4970-af89-1a2d0a05423c": {
    name: "Workflow Quảng Cáo Công Xưởng Gia Công Đa Ngành | 16s",
    description: "Tự động tạo video quảng cáo năng lực sản xuất, quy mô công xưởng và mẫu mã sản phẩm gia công theo yêu cầu.",
    steps: 5,
    nodes: [
      makeNode("prompt-cx-1", "prompt", "Prompt - Kịch Bản Công Xưởng", 80, 150, 360, 260, [], [
        { id: "prompt-cx-1-out-txt", type: "text" }
      ], {
        prompt: "Quay cận cảnh dây chuyền sản xuất hiện đại tại nhà máy gia công đa ngành, công nhân mặc đồng phục làm việc tỉ mỉ, máy móc dập may tự động hóa, các kiện hàng túi vải, balo, đồ gia dụng cao cấp xếp ngay ngắn, ánh sáng công xưởng sáng sủa chuyên nghiệp, chất lượng 4K sắc nét."
      }, "prompt_script"),
      makeNode("flow-cx-1", "google-flow", "Flow - Video Generator (Cảnh Xưởng)", 500, 100, 360, 680, [
        { id: "flow-cx-1-in-txt", type: "text" },
        { id: "flow-cx-1-in-img", type: "image" }
      ], [
        { id: "flow-cx-1-out-vid", type: "video" }
      ], {
        prompt: "",
        concurrency: "1c",
        mode: "Video",
        model: "Omni Flash",
        quality: "Standard",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video_1"),
      makeNode("tts-cx-1", "elevenlabs", "ElevenLabs - Giọng Thuyết Minh Doanh Nghiệp", 500, 820, 360, 360, [
        { id: "tts-cx-1-in-txt", type: "text" }
      ], [
        { id: "tts-cx-1-out-aud", type: "audio" }
      ], {
        prompt: "Chào mừng quý đối tác đến với xưởng gia công quy mô lớn của chúng tôi. Nhận sản xuất đa ngành số lượng lớn, cam kết đúng tiến độ và chất lượng chuẩn xuất khẩu.",
        voiceName: "Adam - Professional",
        voiceId: "pNInz6obpgDQGcFmaJgB",
        modelId: "eleven_v3",
        outputFormat: "MP3",
        speed: 1
      }, "tts_voice"),
      makeNode("dub-cx-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ Video", 940, 300, 340, 320, [
        { id: "dub-cx-1-in-vid", type: "video" },
        { id: "dub-cx-1-in-aud", type: "audio" }
      ], [
        { id: "dub-cx-1-out-vid", type: "video" }
      ], {
        speedMode: "auto",
        voiceVolume: 100,
        removeOriginalAudio: true
      }, "video_dubbing"),
      makeNode("dl-cx-1", "download", "Auto Download Thành Phẩm", 1340, 360, 260, 100, [
        { id: "dl-cx-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-cx-1", "prompt-cx-1", "prompt-cx-1-out-txt", "flow-cx-1", "flow-cx-1-in-txt"),
      makeConn("c-cx-2", "prompt-cx-1", "prompt-cx-1-out-txt", "tts-cx-1", "tts-cx-1-in-txt"),
      makeConn("c-cx-3", "flow-cx-1", "flow-cx-1-out-vid", "dub-cx-1", "dub-cx-1-in-vid"),
      makeConn("c-cx-4", "tts-cx-1", "tts-cx-1-out-aud", "dub-cx-1", "dub-cx-1-in-aud"),
      makeConn("c-cx-5", "dub-cx-1", "dub-cx-1-out-vid", "dl-cx-1", "dl-cx-1-in-vid")
    ]
  },

  // 2. Người que Trending 60s
  "88c8dbea-dcef-42f2-953a-2d2392ee7e3a": {
    name: "Người Que Trending Đa Dạng Chủ Đề | 60s",
    description: "Workflow tạo video người que tự động chỉ từ một chủ đề. AI tự phân tích nội dung, viết kịch bản, dựng storyboard, tạo từng cảnh video và ghép thành clip hoàn chỉnh.",
    steps: 5,
    nodes: [
      makeNode("prompt-nq-1", "prompt", "Chủ Đề Người Que Hài Hước", 80, 150, 360, 240, [], [
        { id: "prompt-nq-1-out-txt", type: "text" }
      ], {
        prompt: "Một nhân vật người que stickman hoạt hình nét vẽ đơn giản màu trắng trên nền tối, hành động vụng về khi đi phỏng vấn xin việc, biểu cảm hài hước, cử chỉ sinh động gây cười, phong cách TikTok viral."
      }, "prompt_topic"),
      makeNode("flow-nq-1", "google-flow", "Flow - Video Người Que", 500, 100, 360, 680, [
        { id: "flow-nq-1-in-txt", type: "text" }
      ], [
        { id: "flow-nq-1-out-vid", type: "video" }
      ], {
        prompt: "",
        concurrency: "1c",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("stt-nq-1", "video-script-extract", "Đọc Kịch Bản (Âm thanh → Văn bản)", 920, 100, 340, 240, [
        { id: "stt-nq-1-in-vid", type: "video" }
      ], [
        { id: "stt-nq-1-out-txt", type: "text" }
      ], {
        language: "vi",
        prompt: "Bóc kịch bản lời thoại hài hước"
      }, "script_extract"),
      makeNode("tts-nq-1", "elevenlabs", "ElevenLabs - Giọng Đọc Hài Hước", 920, 380, 360, 360, [
        { id: "tts-nq-1-in-txt", type: "text" }
      ], [
        { id: "tts-nq-1-out-aud", type: "audio" }
      ], {
        voiceName: "Gia Huy - Hài Hước",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3",
        outputFormat: "MP3"
      }, "tts_voice"),
      makeNode("dub-nq-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ Video", 1340, 200, 340, 320, [
        { id: "dub-nq-1-in-vid", type: "video" },
        { id: "dub-nq-1-in-aud", type: "audio" }
      ], [
        { id: "dub-nq-1-out-vid", type: "video" }
      ], {
        speedMode: "auto",
        voiceVolume: 100
      }, "video_dubbing")
    ],
    connections: [
      makeConn("c-nq-1", "prompt-nq-1", "prompt-nq-1-out-txt", "flow-nq-1", "flow-nq-1-in-txt"),
      makeConn("c-nq-2", "flow-nq-1", "flow-nq-1-out-vid", "stt-nq-1", "stt-nq-1-in-vid"),
      makeConn("c-nq-3", "stt-nq-1", "stt-nq-1-out-txt", "tts-nq-1", "tts-nq-1-in-txt"),
      makeConn("c-nq-4", "flow-nq-1", "flow-nq-1-out-vid", "dub-nq-1", "dub-nq-1-in-vid"),
      makeConn("c-nq-5", "tts-nq-1", "tts-nq-1-out-aud", "dub-nq-1", "dub-nq-1-in-aud")
    ]
  },

  // 3. Mẹ & Em Bé
  "dc285a49-338e-424b-8db6-e18768b2934e": {
    name: "Workflow Mẹ & Em Bé – Tạo Video Chân Thật Mẹ và bé",
    description: "Tự động tạo video mẹ và em bé phong cách quay điện thoại chân thật, cử chỉ tự nhiên, thoại tiếng Việt, tiếng bé và nhạc nền nhẹ nhàng.",
    steps: 5,
    nodes: [
      makeNode("prompt-mb-1", "prompt", "Kịch Bản Mẹ & Bé Chân Thật", 80, 150, 360, 240, [], [
        { id: "prompt-mb-1-out-txt", type: "text" }
      ], {
        prompt: "Góc máy dọc 9:16 chân thật tự nhiên như quay bằng iPhone tại phòng ngủ ấm cúng, người mẹ trẻ Việt Nam dịu dàng ôm nựng em bé 6 tháng tuổi mũm mĩm cười tươi ê a, ánh sáng tự nhiên từ cửa sổ chiếu vào ấm áp, khoảnh khắc gia đình yêu thương."
      }, "prompt_script"),
      makeNode("flow-mb-1", "google-flow", "Flow - Video Mẹ & Bé", 500, 100, 360, 680, [
        { id: "flow-mb-1-in-txt", type: "text" }
      ], [
        { id: "flow-mb-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-mb-1", "elevenlabs", "ElevenLabs - Giọng Mẹ Dịu Dàng", 500, 820, 360, 360, [
        { id: "tts-mb-1-in-txt", type: "text" }
      ], [
        { id: "tts-mb-1-out-aud", type: "audio" }
      ], {
        prompt: "Mỗi ngày nhìn thấy con cười ngoan là mẹ thấy bao nhiêu mệt mỏi tan biến hết. Yêu thiên thần nhỏ của mẹ nhất trần đời.",
        voiceName: "Thảo Vy - Dịu Dàng",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-mb-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-mb-1-in-vid", type: "video" },
        { id: "dub-mb-1-in-aud", type: "audio" }
      ], [
        { id: "dub-mb-1-out-vid", type: "video" }
      ], {
        voiceVolume: 90
      }, "video_dubbing"),
      makeNode("dl-mb-1", "download", "Auto Download Video", 1340, 300, 260, 100, [
        { id: "dl-mb-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-mb-1", "prompt-mb-1", "prompt-mb-1-out-txt", "flow-mb-1", "flow-mb-1-in-txt"),
      makeConn("c-mb-2", "prompt-mb-1", "prompt-mb-1-out-txt", "tts-mb-1", "tts-mb-1-in-txt"),
      makeConn("c-mb-3", "flow-mb-1", "flow-mb-1-out-vid", "dub-mb-1", "dub-mb-1-in-vid"),
      makeConn("c-mb-4", "tts-mb-1", "tts-mb-1-out-aud", "dub-mb-1", "dub-mb-1-in-aud"),
      makeConn("c-mb-5", "dub-mb-1", "dub-mb-1-out-vid", "dl-mb-1", "dl-mb-1-in-vid")
    ]
  },

  // 4. Gối Chặn Đầu Sơ Sinh
  "d9697c7b-1ab1-48cb-a17c-9280568d433e": {
    name: "Gối Chặn Đầu Sơ Sinh",
    description: "Quy trình tạo video ngắn quảng cáo/affiliate sản phẩm gối chặn đầu cho bé sơ sinh. Tự động hóa prompt hình ảnh, kịch bản lồng tiếng chân thực.",
    steps: 5,
    nodes: [
      makeNode("prompt-gc-1", "prompt", "Prompt Sản Phẩm Gối Chặn", 80, 150, 360, 240, [], [
        { id: "prompt-gc-1-out-txt", type: "text" }
      ], {
        prompt: "Quay cận cảnh sản phẩm gối chặn chống méo đầu và chống giật mình cho trẻ sơ sinh, chất liệu vải organic xốp mềm thông thoáng, bé sơ sinh ngủ say giấc ngon lành, tông màu kem be pastel dịu mắt chuẩn phong cách affiliate TikTok Shop."
      }, "prompt_product"),
      makeNode("flow-gc-1", "google-flow", "Flow - Video Gối Chặn", 500, 100, 360, 680, [
        { id: "flow-gc-1-in-txt", type: "text" }
      ], [
        { id: "flow-gc-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-gc-1", "elevenlabs", "ElevenLabs - Giọng Review Bỉm Sữa", 500, 820, 360, 360, [
        { id: "tts-gc-1-in-txt", type: "text" }
      ], [
        { id: "tts-gc-1-out-aud", type: "audio" }
      ], {
        prompt: "Bé nhà các mom có hay bị giật mình hay nghiêng một bên đầu khi ngủ không? Từ ngày có gối chặn này, con ngủ sâu giấc hơn hẳn, đầu tròn vo xinh xắn luôn nè.",
        voiceName: "Linh Đan - Reviewer",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-gc-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-gc-1-in-vid", type: "video" },
        { id: "dub-gc-1-in-aud", type: "audio" }
      ], [
        { id: "dub-gc-1-out-vid", type: "video" }
      ], {
        voiceVolume: 100
      }, "video_dubbing"),
      makeNode("dl-gc-1", "download", "Auto Download Video", 1340, 300, 260, 100, [
        { id: "dl-gc-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-gc-1", "prompt-gc-1", "prompt-gc-1-out-txt", "flow-gc-1", "flow-gc-1-in-txt"),
      makeConn("c-gc-2", "prompt-gc-1", "prompt-gc-1-out-txt", "tts-gc-1", "tts-gc-1-in-txt"),
      makeConn("c-gc-3", "flow-gc-1", "flow-gc-1-out-vid", "dub-gc-1", "dub-gc-1-in-vid"),
      makeConn("c-gc-4", "tts-gc-1", "tts-gc-1-out-aud", "dub-gc-1", "dub-gc-1-in-aud"),
      makeConn("c-gc-5", "dub-gc-1", "dub-gc-1-out-vid", "dl-gc-1", "dl-gc-1-in-vid")
    ]
  },

  // 5. AFFILIATE Review Đồ Gia Dụng Tự Động
  "2bbf79ea-f055-423b-9c0a-cb3870321607": {
    name: "AFFILIATE Review Đồ Gia Dụng Tự Động",
    description: "Tự động tạo clip review đồ gia dụng chỉ từ ảnh sản phẩm, mô tả sản phẩm và model. Hệ thống sẽ tự phân tích sản phẩm, xây storyboard nhiều cảnh và ghép hoàn chỉnh.",
    steps: 5,
    nodes: [
      makeNode("prompt-gd-1", "prompt", "Thông Tin Sản Phẩm Gia Dụng", 80, 150, 360, 240, [], [
        { id: "prompt-gd-1-out-txt", type: "text" }
      ], {
        prompt: "Review chi tiết món đồ gia dụng thông minh trong nhà bếp: máy ép chậm mini tiện lợi, quay cận cảnh rót nước ép trái cây nguyên chất thơm ngon, thiết kế nhỏ gọn đẹp mắt, phong cách video KOC review triệu view."
      }, "prompt_review"),
      makeNode("flow-gd-1", "google-flow", "Flow - Video Trải Nghiệm Gia Dụng", 500, 100, 360, 680, [
        { id: "flow-gd-1-in-txt", type: "text" }
      ], [
        { id: "flow-gd-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-gd-1", "elevenlabs", "ElevenLabs - Giọng KOC Chốt Đơn", 500, 820, 360, 360, [
        { id: "tts-gd-1-in-txt", type: "text" }
      ], [
        { id: "tts-gd-1-out-aud", type: "audio" }
      ], {
        prompt: "Món đồ bếp chân ái mà ai cũng nên có trong nhà nè mọi người. Vừa nhỏ gọn, vệ sinh cực nhanh mà giá đang sale rẻ rúng luôn, bấm ngay góc trái nhé!",
        voiceName: "Thảo Vy - Dịu Dàng",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-gd-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-gd-1-in-vid", type: "video" },
        { id: "dub-gd-1-in-aud", type: "audio" }
      ], [
        { id: "dub-gd-1-out-vid", type: "video" }
      ], {
        voiceVolume: 100
      }, "video_dubbing"),
      makeNode("dl-gd-1", "download", "Auto Download", 1340, 300, 260, 100, [
        { id: "dl-gd-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-gd-1", "prompt-gd-1", "prompt-gd-1-out-txt", "flow-gd-1", "flow-gd-1-in-txt"),
      makeConn("c-gd-2", "prompt-gd-1", "prompt-gd-1-out-txt", "tts-gd-1", "tts-gd-1-in-txt"),
      makeConn("c-gd-3", "flow-gd-1", "flow-gd-1-out-vid", "dub-gd-1", "dub-gd-1-in-vid"),
      makeConn("c-gd-4", "tts-gd-1", "tts-gd-1-out-aud", "dub-gd-1", "dub-gd-1-in-aud"),
      makeConn("c-gd-5", "dub-gd-1", "dub-gd-1-out-vid", "dl-gd-1", "dl-gd-1-in-vid")
    ]
  },

  // 6. Biến hình trang phục trên máy chạy bộ
  "cmtwimoa000wot001t5x2c5ah": {
    name: "Biến hình trang phục trên máy chạy bộ",
    description: "Workflow tự động biến đổi nhiều outfit trên cùng một người mẫu đang đi trên máy chạy bộ, giữ nguyên model và bối cảnh, tạo chuyển động liền mạch làm affiliate thời trang.",
    steps: 4,
    nodes: [
      makeNode("prompt-cb-1", "prompt", "Prompt Thời Trang Chạy Bộ", 80, 150, 360, 240, [], [
        { id: "prompt-cb-1-out-txt", type: "text" }
      ], {
        prompt: "Người mẫu nữ châu Á dáng chuẩn đang sải bước tự tin trên máy chạy bộ hiện đại trong phòng gym, chuyển cảnh mượt mà thay đổi liên tục các bộ trang phục thể thao năng động, màu sắc thời thượng, hiệu ứng biến hình hút mắt."
      }, "prompt_runway"),
      makeNode("flow-cb-1", "google-flow", "Flow - Video Biến Hình", 500, 100, 360, 680, [
        { id: "flow-cb-1-in-txt", type: "text" }
      ], [
        { id: "flow-cb-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-cb-1", "elevenlabs", "Voice Nhạc Nền / Beat Trend", 500, 820, 360, 360, [
        { id: "tts-cb-1-in-txt", type: "text" }
      ], [
        { id: "tts-cb-1-out-aud", type: "audio" }
      ], {
        prompt: "Một chiếc outfit tập luyện vừa tôn dáng vừa thoáng mát. Thử thách 1 tuần 7 ngày 7 bộ đồ xinh cùng mình nhé!",
        voiceName: "Linh Đan",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-cb-1", "video-dubbing", "Lồng Tiếng & Ghép Nhạc", 940, 250, 340, 320, [
        { id: "dub-cb-1-in-vid", type: "video" },
        { id: "dub-cb-1-in-aud", type: "audio" }
      ], [
        { id: "dub-cb-1-out-vid", type: "video" }
      ], {}, "video_dubbing")
    ],
    connections: [
      makeConn("c-cb-1", "prompt-cb-1", "prompt-cb-1-out-txt", "flow-cb-1", "flow-cb-1-in-txt"),
      makeConn("c-cb-2", "prompt-cb-1", "prompt-cb-1-out-txt", "tts-cb-1", "tts-cb-1-in-txt"),
      makeConn("c-cb-3", "flow-cb-1", "flow-cb-1-out-vid", "dub-cb-1", "dub-cb-1-in-vid"),
      makeConn("c-cb-4", "tts-cb-1", "tts-cb-1-out-aud", "dub-cb-1", "dub-cb-1-in-aud")
    ]
  },

  // 7. Thay quần áo cho mẫu selfie tự động
  "cmtv9z12500qznx01eyewy9i2": {
    name: "Thay quần áo cho mẫu selfie tự động",
    description: "Tự động thay đổi quần áo hàng loạt cho mẫu theo như ảnh yêu cầu, tạo video biến hình lookbook nhanh chóng.",
    steps: 3,
    nodes: [
      makeNode("prompt-sf-1", "prompt", "Mô Tả Outfit Biến Hình", 80, 150, 360, 240, [], [
        { id: "prompt-sf-1-out-txt", type: "text" }
      ], {
        prompt: "Cận cảnh cô gái trẻ selfie trước camera điện thoại mỉm cười nhẹ nhàng, chớp mắt tự nhiên, sau 1 nhịp chớp mắt trang phục áo thun tự động biến thành áo len dệt kim thanh lịch, phong cách thời trang trẻ trung Hàn Quốc."
      }, "prompt_selfie"),
      makeNode("flow-sf-1", "google-flow", "Flow - Video Thay Trang Phục", 500, 100, 360, 680, [
        { id: "flow-sf-1-in-txt", type: "text" }
      ], [
        { id: "flow-sf-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("dl-sf-1", "download", "Tải Video Lookbook", 940, 250, 260, 100, [
        { id: "dl-sf-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-sf-1", "prompt-sf-1", "prompt-sf-1-out-txt", "flow-sf-1", "flow-sf-1-in-txt"),
      makeConn("c-sf-2", "flow-sf-1", "flow-sf-1-out-vid", "dl-sf-1", "dl-sf-1-in-vid")
    ]
  },

  // 8. Người mẫu Selfie trước gương
  "cmtv34ycm00brnx01i8fd9avx": {
    name: "Người mẫu Selfie trước gương",
    description: "Workflow tự động tạo video người mẫu selfie trước gương từ ảnh model + ảnh sản phẩm. Tự động thay outfit, giữ phong cách đồng nhất.",
    steps: 4,
    nodes: [
      makeNode("prompt-mg-1", "prompt", "Prompt Mẫu Trước Gương", 80, 150, 360, 240, [], [
        { id: "prompt-mg-1-out-txt", type: "text" }
      ], {
        prompt: "Người mẫu nữ sành điệu đứng cầm điện thoại chụp ảnh selfie trước gương toàn thân trong phòng thử đồ ánh sáng sang trọng, tạo dáng khoe trọn outfit đầm dạ hội tôn dáng, thần thái cuốn hút chuyên nghiệp."
      }, "prompt_mirror"),
      makeNode("flow-mg-1", "google-flow", "Flow - Video Mẫu Trước Gương", 500, 100, 360, 680, [
        { id: "flow-mg-1-in-txt", type: "text" }
      ], [
        { id: "flow-mg-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-mg-1", "elevenlabs", "ElevenLabs - Giọng Review Thời Trang", 500, 820, 360, 360, [
        { id: "tts-mg-1-in-txt", type: "text" }
      ], [
        { id: "tts-mg-1-out-aud", type: "audio" }
      ], {
        prompt: "Một chiếc đầm xuất sắc cho buổi tiệc tối nay. Form dáng ôm cực chuẩn, chất vải dày dặn mà không hề bị bí bách chút nào luôn!",
        voiceName: "Thảo Vy - Dịu Dàng",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-mg-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-mg-1-in-vid", type: "video" },
        { id: "dub-mg-1-in-aud", type: "audio" }
      ], [
        { id: "dub-mg-1-out-vid", type: "video" }
      ], {}, "video_dubbing")
    ],
    connections: [
      makeConn("c-mg-1", "prompt-mg-1", "prompt-mg-1-out-txt", "flow-mg-1", "flow-mg-1-in-txt"),
      makeConn("c-mg-2", "prompt-mg-1", "prompt-mg-1-out-txt", "tts-mg-1", "tts-mg-1-in-txt"),
      makeConn("c-mg-3", "flow-mg-1", "flow-mg-1-out-vid", "dub-mg-1", "dub-mg-1-in-vid"),
      makeConn("c-mg-4", "tts-mg-1", "tts-mg-1-out-aud", "dub-mg-1", "dub-mg-1-in-aud")
    ]
  },

  // 9. Chú Thợ Điện Thông Thái: Series Tình Huống Kéo View & Affiliate | 40s
  "cmthkzsvl00f5qu01f2pec1mk": {
    name: "Workflow Chú Thợ Điện Thông Thái: Series Tình Huống Kéo View & Affiliate | 40s",
    description: "Quy trình tự động hóa sản xuất trọn bộ series video ngắn hài hước về 'Chú thợ điện thông thái và anh thanh niên'. Giữ nguyên tính nhất quán nhân vật, kịch bản tình huống cuốn hút.",
    steps: 5,
    nodes: [
      makeNode("prompt-td-1", "prompt", "Kịch Bản Series Chú Thợ Điện", 80, 150, 360, 260, [], [
        { id: "prompt-td-1-out-txt", type: "text" }
      ], {
        prompt: "Chú thợ điện trung niên mặc áo bảo hộ màu cam cầm bút thử điện thông minh, biểu cảm hài hước chỉ bảo cậu thanh niên lóng ngóng cách cắm phích điện an toàn, không gian nhà ở bình dị, góc quay sinh động lôi cuốn chuẩn phim ngắn TikTok."
      }, "prompt_script"),
      makeNode("flow-td-1", "google-flow", "Flow - Video Tình Huống", 500, 100, 360, 680, [
        { id: "flow-td-1-in-txt", type: "text" }
      ], [
        { id: "flow-td-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-td-1", "elevenlabs", "ElevenLabs - Giọng Chú Thợ Điện", 500, 820, 360, 360, [
        { id: "tts-td-1-in-txt", type: "text" }
      ], [
        { id: "tts-td-1-out-aud", type: "audio" }
      ], {
        prompt: "Ấy ấy! Làm điện đóm là không có được ẩu nha con! Muốn an toàn thì phải có cái bút thử điện cảm ứng này nè, để gần là nó tít tít báo ngay!",
        voiceName: "Gia Huy",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-td-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-td-1-in-vid", type: "video" },
        { id: "dub-td-1-in-aud", type: "audio" }
      ], [
        { id: "dub-td-1-out-vid", type: "video" }
      ], {
        voiceVolume: 100
      }, "video_dubbing"),
      makeNode("dl-td-1", "download", "Auto Download", 1340, 300, 260, 100, [
        { id: "dl-td-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-td-1", "prompt-td-1", "prompt-td-1-out-txt", "flow-td-1", "flow-td-1-in-txt"),
      makeConn("c-td-2", "prompt-td-1", "prompt-td-1-out-txt", "tts-td-1", "tts-td-1-in-txt"),
      makeConn("c-td-3", "flow-td-1", "flow-td-1-out-vid", "dub-td-1", "dub-td-1-in-vid"),
      makeConn("c-td-4", "tts-td-1", "tts-td-1-out-aud", "dub-td-1", "dub-td-1-in-aud"),
      makeConn("c-td-5", "dub-td-1", "dub-td-1-out-vid", "dl-td-1", "dl-td-1-in-vid")
    ]
  },

  // 10. Workflow Tự Động Tạo Video Bán Mọi Loại Đồ Đạc | 10s
  "cmtcbvpbp000gms01hcoqwwug": {
    name: "Workflow Tự Động Tạo Video Bán Mọi Loại Đồ Đạc | 10s",
    description: "Workflow AI tự động hóa quy trình sản xuất video affiliate đa năng: Từ đồ gia dụng, thời trang, phụ kiện công nghệ đến decor.",
    steps: 5,
    nodes: [
      makeNode("prompt-dd-1", "prompt", "Prompt Đa Năng Bán Mọi Đồ Đạc", 80, 150, 360, 240, [], [
        { id: "prompt-dd-1-out-txt", type: "text" }
      ], {
        prompt: "Quay cận cảnh sản phẩm công nghệ mini đa năng trên bàn làm việc hiện đại phong cách tối giản, đèn LED dịu nhẹ, chuyển động xoay 360 độ mượt mà làm nổi bật từng góc cạnh và tính năng độc đáo, video sắc nét chất lượng cao."
      }, "prompt_harness"),
      makeNode("flow-dd-1", "google-flow", "Flow - Video Bán Hàng 10s", 500, 100, 360, 680, [
        { id: "flow-dd-1-in-txt", type: "text" }
      ], [
        { id: "flow-dd-1-out-vid", type: "video" }
      ], {
        prompt: "",
        mode: "Video",
        model: "Omni Flash",
        duration: "8s",
        aspect: "9:16"
      }, "flow_video"),
      makeNode("tts-dd-1", "elevenlabs", "ElevenLabs - Giọng Bán Hàng Thúc Đẩy", 500, 820, 360, 360, [
        { id: "tts-dd-1-in-txt", type: "text" }
      ], [
        { id: "tts-dd-1-out-aud", type: "audio" }
      ], {
        prompt: "Ai bảo đồ xịn là phải đắt tiền? Món này dùng cực mê mà giá chỉ bằng hai ly trà sữa. Link mua ưu đãi ngay bên dưới nha!",
        voiceName: "Linh Đan",
        voiceId: "tQ4MEZFJOzsahSEEZtHK",
        modelId: "eleven_v3"
      }, "tts_voice"),
      makeNode("dub-dd-1", "video-dubbing", "Lồng Tiếng & Đồng Bộ", 940, 250, 340, 320, [
        { id: "dub-dd-1-in-vid", type: "video" },
        { id: "dub-dd-1-in-aud", type: "audio" }
      ], [
        { id: "dub-dd-1-out-vid", type: "video" }
      ], {
        voiceVolume: 100
      }, "video_dubbing"),
      makeNode("dl-dd-1", "download", "Auto Download", 1340, 300, 260, 100, [
        { id: "dl-dd-1-in-vid", type: "video" }
      ], [], {}, "auto_download")
    ],
    connections: [
      makeConn("c-dd-1", "prompt-dd-1", "prompt-dd-1-out-txt", "flow-dd-1", "flow-dd-1-in-txt"),
      makeConn("c-dd-2", "prompt-dd-1", "prompt-dd-1-out-txt", "tts-dd-1", "tts-dd-1-in-txt"),
      makeConn("c-dd-3", "flow-dd-1", "flow-dd-1-out-vid", "dub-dd-1", "dub-dd-1-in-vid"),
      makeConn("c-dd-4", "tts-dd-1", "tts-dd-1-out-aud", "dub-dd-1", "dub-dd-1-in-aud"),
      makeConn("c-dd-5", "dub-dd-1", "dub-dd-1-out-vid", "dl-dd-1", "dl-dd-1-in-vid")
    ]
  }
};

const workflowsDataFile = path.join(__dirname, '..', 'vercel_server', 'api', 'workflowsData.json');
fs.writeFileSync(workflowsDataFile, JSON.stringify({
  groups: catalog.groups,
  products: catalog.products,
  definitions: workflowDefinitions
}, null, 2), 'utf-8');

console.log('Successfully wrote vercel_server/api/workflowsData.json!');
