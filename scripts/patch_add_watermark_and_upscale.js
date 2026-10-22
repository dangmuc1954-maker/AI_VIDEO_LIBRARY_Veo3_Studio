// scripts/patch_add_watermark_and_upscale.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 TÍCH HỢP TỰ ĐỘNG XÓA WATERMARK & UPSCALE 1080P FULL HD CHO VEO 3 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// 1. Cập nhật app/modules/google_flow_web_runner.js và modules/video_watermark_cleaner.js
for (const root of targetRoots) {
  const runnerPath = path.join(root, 'modules/google_flow_web_runner.js');
  const cleanerPath = path.join(root, 'modules/video_watermark_cleaner.js');

  // Cập nhật cleaner nếu chưa có upscale1080p
  if (fs.existsSync(cleanerPath)) {
    let cleanerCode = fs.readFileSync(cleanerPath, 'utf8');
    if (!cleanerCode.includes('options.upscale1080p')) {
      cleanerCode = cleanerCode.replace(
        "const filterStr = `[0:v]delogo=x=${roi.x}:y=${roi.y}:w=${roi.w}:h=${roi.h}[v]`;",
        `let filterStr = \`[0:v]delogo=x=\${roi.x}:y=\${roi.y}:w=\${roi.w}:h=\${roi.h}[v]\`;
    if (options.upscale1080p) {
      const isPortrait = dims.height > dims.width;
      const targetW = isPortrait ? 1080 : 1920;
      const targetH = isPortrait ? 1920 : 1080;
      filterStr = \`[0:v]delogo=x=\${roi.x}:y=\${roi.y}:w=\${roi.w}:h=\${roi.h},scale=\${targetW}:\${targetH}:flags=lanczos[v]\`;
    }`
      );
      fs.writeFileSync(cleanerPath, cleanerCode, 'utf8');
      console.log('✅ Đã cập nhật video_watermark_cleaner.js tại:', cleanerPath);
    }
  }

  // Cập nhật runner nếu chưa có xóa watermark và upscale
  if (fs.existsSync(runnerPath)) {
    let runnerCode = fs.readFileSync(runnerPath, 'utf8');
    if (!runnerCode.includes('shouldRemoveWatermark')) {
      const targetAnchor = 'await downloadUrlToFile(videoDownloadUrl, targetFile);';
      const replacement = `await downloadUrlToFile(videoDownloadUrl, targetFile);

    // 🛡️ TỰ ĐỘNG XÓA WATERMARK & UPSCALE 1080P FULL HD
    const shouldRemoveWatermark = job.payload?.removeWatermark !== false;
    const shouldUpscale = job.payload?.upscale1080p === true || job.payload?.upsampleResolution === '1080p' || job.payload?.resolution === '1080p';

    if (shouldRemoveWatermark || shouldUpscale) {
      try {
        context.updateProgress?.(97, shouldUpscale ? 'Đang xóa logo và nâng nét 1080p Full HD...' : 'Đang tự động xóa Watermark & Logo AI...');
        const VideoWatermarkCleaner = require('./video_watermark_cleaner.js');
        const cleaner = new VideoWatermarkCleaner();
        await cleaner.cleanVideoWatermark(targetFile, null, {
          upscale1080p: shouldUpscale
        });
      } catch (postErr) {
        console.warn('[PostProcessing] Lỗi xử lý watermark/upscale:', postErr);
      }
    }`;
      runnerCode = runnerCode.replace(targetAnchor, replacement);
      fs.writeFileSync(runnerPath, runnerCode, 'utf8');
      console.log('✅ Đã cập nhật google_flow_web_runner.js tại:', runnerPath);
    }
  }
}

// 2. Cập nhật VideoFactoryStudio.js giao diện thêm 2 nút bật tắt và payload
for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let vfCode = fs.readFileSync(vfPath, 'utf8');

  // Thêm state removeWatermark & videoResolution
  if (!vfCode.includes('removeWatermark, setRemoveWatermark')) {
    vfCode = vfCode.replace(
      "const [videoModel, setVideoModel] = React.useState(globalStudioState?.videoModel || 'Veo 3.1 - Lite [Lower Priority]');",
      `const [videoModel, setVideoModel] = React.useState(globalStudioState?.videoModel || 'Veo 3.1 - Lite [Lower Priority]');
  const [removeWatermark, setRemoveWatermark] = React.useState(globalStudioState?.removeWatermark !== false);
  const [videoResolution, setVideoResolution] = React.useState(globalStudioState?.videoResolution || '1080p');`
    );
  }

  // Thêm vào persistence state
  if (!vfCode.includes('removeWatermark,\n      videoResolution,')) {
    vfCode = vfCode.replace(
      "videoModel,\n      sceneCount,\n      scenes",
      "videoModel,\n      removeWatermark,\n      videoResolution,\n      sceneCount,\n      scenes"
    );
    vfCode = vfCode.replace(
      "[currentNiche, products, productInfo, brandName, bgMode, kocImage, videoModel, sceneCount, scenes]",
      "[currentNiche, products, productInfo, brandName, bgMode, kocImage, videoModel, removeWatermark, videoResolution, sceneCount, scenes]"
    );
  }

  // Thêm vào payload tạo video
  if (!vfCode.includes('removeWatermark: removeWatermark,')) {
    vfCode = vfCode.replace(
      'studioSource: "video-factory",',
      `studioSource: "video-factory",
            removeWatermark: removeWatermark,
            upscale1080p: videoResolution === '1080p',
            upsampleResolution: videoResolution,
            resolution: videoResolution,`
    );
  }

  // Thêm UI vào Section 4 (dưới Model Video)
  if (!vfCode.includes("CHẤT LƯỢNG & LOGO VIDEO")) {
    const uiAnchor = `React.createElement(FieldDropdown, {
              label: "MODEL VIDEO",
              value: videoModel,
              options: VIDEO_MODELS,
              onChange: (v) => setVideoModel(v)
            }),`;

    const uiReplacement = `React.createElement(FieldDropdown, {
              label: "MODEL VIDEO",
              value: videoModel,
              options: VIDEO_MODELS,
              onChange: (v) => setVideoModel(v)
            }),

            // CHẤT LƯỢNG & XÓA WATERMARK LOGO
            React.createElement("div", { className: "space-y-1.5 pt-0.5" },
              React.createElement("p", { className: "text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-0.5" }, "CHẤT LƯỢNG & LOGO VIDEO"),
              React.createElement(SegmentedToggle, {
                value: removeWatermark ? 'clean' : 'keep',
                onChange: (v) => setRemoveWatermark(v === 'clean'),
                items: [
                  { value: 'clean', label: 'Tự Động Xóa Logo', icon: React.createElement("span", { className: "text-xs" }, "✨") },
                  { value: 'keep', label: 'Giữ Logo Gốc', icon: React.createElement("span", { className: "text-xs" }, "🏷️") }
                ]
              }),
              React.createElement(SegmentedToggle, {
                value: videoResolution,
                onChange: (v) => setVideoResolution(v),
                className: "mt-1",
                items: [
                  { value: '1080p', label: '1080p Full HD', icon: React.createElement("span", { className: "text-xs font-bold text-amber-300" }, "🌟") },
                  { value: '720p', label: '720p Chuẩn', icon: React.createElement("span", { className: "text-xs font-medium" }, "⚡") }
                ]
              })
            ),`;

    vfCode = vfCode.replace(uiAnchor, uiReplacement);
  }

  fs.writeFileSync(vfPath, vfCode, 'utf8');
  console.log('✅ Đã cập nhật VideoFactoryStudio.js tại:', vfPath);
}

// Kiểm tra cú pháp AST
try {
  execSync('node -c app/out/renderer/assets/VideoFactoryStudio.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] VideoFactoryStudio.js AST Syntax 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] VideoFactoryStudio.js AST Syntax lỗi!');
  process.exit(1);
}

console.log('\\n💎 HOÀN TẤT TÍCH HỢP TÍNH NĂNG XÓA WATERMARK & UPSCALE 1080P FULL HD!');
