// scripts/patch_universal_watermark_and_resolution.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 HOÀN THIỆN XÓA WATERMARK CHO CẢ ẢNH & VIDEO + NÚT CHỌN 720P/1080P 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// File nguồn media_watermark_cleaner.cjs
const cleanerSrc = path.join(__dirname, '../app/modules/media_watermark_cleaner.cjs');
const cleanerWrapperSrc = path.join(__dirname, '../app/modules/video_watermark_cleaner.cjs');

// 1. Sao chép cleaner sang tất cả các thư mục modules
for (const root of targetRoots) {
  const modDir = path.join(root, 'modules');
  if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });

  fs.copyFileSync(cleanerSrc, path.join(modDir, 'media_watermark_cleaner.cjs'));
  fs.copyFileSync(cleanerWrapperSrc, path.join(modDir, 'video_watermark_cleaner.cjs'));
  console.log('✅ Đã sao chép cleaner modules sang:', modDir);
}

// 2. Cập nhật google_flow_web_runner.js trong tất cả các thư mục
for (const root of targetRoots) {
  const runnerPath = path.join(root, 'modules/google_flow_web_runner.js');
  if (!fs.existsSync(runnerPath)) continue;

  let runnerCode = fs.readFileSync(runnerPath, 'utf8');

  // A. Xử lý Video: Xóa Watermark & Upscale
  const oldVideoBlock = `    // 🛡️ TỰ ĐỘNG XÓA WATERMARK & UPSCALE 1080P FULL HD
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

  const newVideoBlock = `    // 🛡️ TÙY CHỌN XÓA WATERMARK & UPSCALE VIDEO
    const shouldRemoveWatermark = job.payload?.removeWatermark === true;
    const shouldUpscale = job.payload?.upscale1080p === true || job.payload?.upsampleResolution === '1080p' || job.payload?.resolution === '1080p';

    if (shouldRemoveWatermark || shouldUpscale) {
      try {
        context.updateProgress?.(97, shouldUpscale ? 'Đang nâng nét 1080p và xóa logo...' : 'Đang xóa Watermark logo video...');
        const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');
        const cleaner = new MediaWatermarkCleaner();
        await cleaner.cleanMediaWatermark(targetFile, null, {
          upscale1080p: shouldUpscale
        });
      } catch (postErr) {
        console.warn('[PostProcessing Video] Lỗi xử lý watermark/upscale:', postErr);
      }
    }`;

  if (runnerCode.includes(oldVideoBlock)) {
    runnerCode = runnerCode.replace(oldVideoBlock, newVideoBlock);
  } else if (!runnerCode.includes('shouldRemoveWatermark')) {
    runnerCode = runnerCode.replace(
      'await downloadUrlToFile(videoDownloadUrl, targetFile);',
      `await downloadUrlToFile(videoDownloadUrl, targetFile);\n\n${newVideoBlock}`
    );
  }

  // B. Xử lý Ảnh Showroom: Xóa Watermark trên Ảnh
  const imageAnchor = 'await downloadUrlToFile(imgUrl, targetFile);';
  const imagePostBlock = `await downloadUrlToFile(imgUrl, targetFile);

    // 🛡️ TÙY CHỌN XÓA WATERMARK TRÊN ẢNH SHOWROOM
    if (job.payload?.removeWatermark === true) {
      try {
        context.updateProgress?.(92, 'Đang xóa Watermark logo trên ảnh Showroom...');
        const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');
        const cleaner = new MediaWatermarkCleaner();
        await cleaner.cleanMediaWatermark(targetFile);
      } catch (imgErr) {
        console.warn('[PostProcessing Image] Lỗi xóa watermark ảnh:', imgErr);
      }
    }`;

  if (!runnerCode.includes('XÓA WATERMARK TRÊN ẢNH SHOWROOM')) {
    runnerCode = runnerCode.replace(imageAnchor, imagePostBlock);
  }

  fs.writeFileSync(runnerPath, runnerCode, 'utf8');
  console.log('✅ Đã cập nhật google_flow_web_runner.js tại:', runnerPath);
}

// 3. Cập nhật VideoFactoryStudio.js
for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let vfCode = fs.readFileSync(vfPath, 'utf8');

  // Cài đặt mặc định: 720p (Nhanh & Nhẹ) và Tùy chọn nút bấm
  vfCode = vfCode.replace(
    /const \[removeWatermark, setRemoveWatermark\] = React\.useState\(globalStudioState\?\.removeWatermark !== false\);/g,
    'const [removeWatermark, setRemoveWatermark] = React.useState(globalStudioState?.removeWatermark === true);'
  );
  vfCode = vfCode.replace(
    /const \[videoResolution, setVideoResolution\] = React\.useState\(globalStudioState\?\.videoResolution \|\| '1080p'\);/g,
    "const [videoResolution, setVideoResolution] = React.useState(globalStudioState?.videoResolution || '720p');"
  );

  // Đảm bảo Showroom Job truyền removeWatermark
  if (!vfCode.includes('studioSource: "video-factory",\n              removeWatermark: removeWatermark')) {
    vfCode = vfCode.replace(
      'studioSource: "video-factory"',
      'studioSource: "video-factory",\n              removeWatermark: removeWatermark'
    );
  }

  // Thay thế khối UI điều khiển chất lượng và logo với các nút bấm chuyên nghiệp
  const oldUIBlockRegex = /\/\/ CHẤT LƯỢNG & XÓA WATERMARK LOGO[\s\S]*?React\.createElement\("div", \{ className: "space-y-1\.5 pt-0\.5" \}[\s\S]*?\),/g;
  const newUIBlock = `// NÚT ĐIỀU KHIỂN CHẤT LƯỢNG & XÓA WATERMARK CHO CẢ ẢNH & VIDEO
            React.createElement("div", { className: "space-y-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.08]" },
              React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("span", { className: "text-[10px] font-bold text-gray-300 uppercase tracking-wider" }, "ĐỘ NÉT VIDEO:"),
                React.createElement("div", { className: "flex gap-1" },
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setVideoResolution('720p'),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${videoResolution === '720p' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "⚡ 720p (Nhanh)"),
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setVideoResolution('1080p'),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${videoResolution === '1080p' ? 'bg-amber-400 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "🌟 1080p Full HD")
                )
              ),
              React.createElement("div", { className: "flex items-center justify-between pt-1 border-t border-white/[0.05]" },
                React.createElement("span", { className: "text-[10px] font-bold text-gray-300 uppercase tracking-wider" }, "XÓA WATERMARK (ẢNH & CLIP):"),
                React.createElement("div", { className: "flex gap-1" },
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setRemoveWatermark(false),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${!removeWatermark ? 'bg-gray-600 text-white shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "🏷️ Giữ Gốc"),
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setRemoveWatermark(true),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${removeWatermark ? 'bg-emerald-500 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "✨ Bật Xóa Logo")
                )
              )
            ),`;

  if (oldUIBlockRegex.test(vfCode)) {
    vfCode = vfCode.replace(oldUIBlockRegex, newUIBlock);
  }

  fs.writeFileSync(vfPath, vfCode, 'utf8');
  console.log('✅ Đã cập nhật VideoFactoryStudio.js tại:', vfPath);
}

// Kiểm tra AST
try {
  execSync('node -c app/out/renderer/assets/VideoFactoryStudio.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] VideoFactoryStudio.js AST Syntax 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] VideoFactoryStudio.js AST Syntax lỗi!');
  process.exit(1);
}

console.log('\\n💎 HOÀN TẤT TÍCH HỢP XÓA WATERMARK CHO CẢ ẢNH & VIDEO CÙNG NÚT BẤM ĐỘ NÉT 720P/1080P!');
