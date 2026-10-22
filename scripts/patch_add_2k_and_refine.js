// scripts/patch_add_2k_and_refine.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 BỔ SUNG CHẤT LƯỢNG 2K CHO ẢNH SHOWROOM & ĐIỀU KHIỂN ĐỘC LẬP 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// 1. Cập nhật app/modules/media_watermark_cleaner.cjs
const cleanerSrcPath = path.join(__dirname, '../app/modules/media_watermark_cleaner.cjs');
let cleanerContent = `/**
 * MediaWatermarkCleaner - Làm sạch Watermark & Logo AI độc quyền cho AI VIDEO LIBRARY
 * Hỗ trợ cả ẢNH (.png, .jpg, .webp) và VIDEO (.mp4, .mov, .webm)
 * Tích hợp bộ lọc Delogo và Upscale Lanczos 2K (Ảnh) & 1080p (Video)
 */
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MediaWatermarkCleaner {
  constructor(customFfmpegPath) {
    this.ffmpegPath = customFfmpegPath || this._resolveFfmpeg();
  }

  _resolveFfmpeg() {
    try {
      const fStatic = require('ffmpeg-static');
      if (typeof fStatic === 'string' && fs.existsSync(fStatic)) return fStatic;
    } catch (_) {}

    const candidates = [
      path.join(__dirname, '../node_modules/ffmpeg-static/ffmpeg.exe'),
      path.join(__dirname, '../../node_modules/ffmpeg-static/ffmpeg.exe'),
      path.join(__dirname, '../../../node_modules/ffmpeg-static/ffmpeg.exe'),
      path.join(__dirname, '../../app/node_modules/ffmpeg-static/ffmpeg.exe'),
      process.resourcesPath ? path.join(process.resourcesPath, 'app/node_modules/ffmpeg-static/ffmpeg.exe') : '',
      process.resourcesPath ? path.join(process.resourcesPath, 'app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe') : '',
      'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe'
    ];

    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }

    return 'ffmpeg';
  }

  async probeDimensions(mediaPath) {
    return new Promise((resolve) => {
      exec(\`"\${this.ffmpegPath}" -i "\${mediaPath}"\`, (err, stdout, stderr) => {
        const out = (stderr || '') + (stdout || '');
        const match = out.match(/Stream.*(?:Video|Image):.*,\\s*(\\d{3,4})x(\\d{3,4})/i) ||
                      out.match(/,\\s*(\\d{3,4})x(\\d{3,4})/);
        if (match) {
          resolve({ width: parseInt(match[1], 10), height: parseInt(match[2], 10) });
        } else {
          resolve({ width: 720, height: 1280 });
        }
      });
    });
  }

  computeWatermarkRoi(width, height) {
    const isPortrait = height > width;
    const shortEdge = Math.min(width, height);
    
    const s = Math.round(shortEdge / 15);
    const boxW = Math.round(s * 1.35);
    const boxH = Math.round(s * 1.35);

    let marginX = isPortrait ? Math.round(shortEdge * 0.08) : Math.round(shortEdge * 0.07);
    let marginY = isPortrait ? Math.round(shortEdge * 0.08) : Math.round(shortEdge * 0.07);

    let x = width - marginX - boxW;
    let y = height - marginY - boxH;

    x = Math.max(0, Math.min(x, width - boxW));
    y = Math.max(0, Math.min(y, height - boxH));

    return { x, y, w: boxW, h: boxH, s };
  }

  async cleanMediaWatermark(inputPath, outputPath, options = {}) {
    if (!fs.existsSync(inputPath)) {
      throw new Error(\`Media file not found: \${inputPath}\`);
    }

    const ext = path.extname(inputPath).toLowerCase();
    const isImage = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
    const sameFile = !outputPath || path.resolve(inputPath) === path.resolve(outputPath);
    const targetOutput = sameFile 
      ? path.join(path.dirname(inputPath), \`delogo_tmp_\${Date.now()}_\${path.basename(inputPath)}\`)
      : outputPath;

    const dims = await this.probeDimensions(inputPath);
    const roi = this.computeWatermarkRoi(dims.width, dims.height);

    const shouldDelogo = options.removeWatermark !== false;
    const shouldUpscale = isImage 
      ? (options.upscale2k === true || options.imageResolution === '2k')
      : (options.upscale1080p === true || options.videoResolution === '1080p');

    if (!shouldDelogo && !shouldUpscale) {
      return { success: true, path: inputPath, dims };
    }

    const isPortrait = dims.height > dims.width;
    let targetW = dims.width;
    let targetH = dims.height;

    if (shouldUpscale) {
      if (isImage) {
        targetW = isPortrait ? 1440 : 2560;
        targetH = isPortrait ? 2560 : 1440;
      } else {
        targetW = isPortrait ? 1080 : 1920;
        targetH = isPortrait ? 1920 : 1080;
      }
    }

    let filterSteps = [];
    if (shouldDelogo) {
      filterSteps.push(\`delogo=x=\${roi.x}:y=\${roi.y}:w=\${roi.w}:h=\${roi.h}\`);
    }
    if (shouldUpscale) {
      filterSteps.push(\`scale=\${targetW}:\${targetH}:flags=lanczos\`);
    }

    const filterStr = \`[0:v]\${filterSteps.join(',')}[v]\`;

    let args = [];
    if (isImage) {
      args = [
        '-y',
        '-i', inputPath,
        '-filter_complex', filterStr,
        '-map', '[v]',
        targetOutput
      ];
    } else {
      const crf = options.crf || 18;
      const preset = options.preset || 'veryfast';
      args = [
        '-y',
        '-i', inputPath,
        '-filter_complex', filterStr,
        '-map', '[v]',
        '-map', '0:a?',
        '-c:v', 'libx264',
        '-crf', String(crf),
        '-preset', preset,
        '-c:a', 'copy',
        targetOutput
      ];
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(this.ffmpegPath, args);
      let stderrLog = '';

      proc.stderr.on('data', (d) => {
        stderrLog += d.toString();
        if (options.onProgress) {
          options.onProgress(d.toString());
        }
      });

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(targetOutput)) {
          if (sameFile) {
            try {
              fs.unlinkSync(inputPath);
              fs.renameSync(targetOutput, inputPath);
              resolve({ success: true, path: inputPath, roi, dims, isImage });
            } catch (renameErr) {
              reject(renameErr);
            }
          } else {
            resolve({ success: true, path: targetOutput, roi, dims, isImage });
          }
        } else {
          if (fs.existsSync(targetOutput)) {
            try { fs.unlinkSync(targetOutput); } catch(e) {}
          }
          reject(new Error(\`FFmpeg delogo/upscale failed with exit code \${code}: \${stderrLog.slice(-500)}\`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }
}

MediaWatermarkCleaner.MediaWatermarkCleaner = MediaWatermarkCleaner;
MediaWatermarkCleaner.VideoWatermarkCleaner = MediaWatermarkCleaner;
module.exports = MediaWatermarkCleaner;
`;

fs.writeFileSync(cleanerSrcPath, cleanerContent, 'utf8');

// Copy sang các target roots
for (const root of targetRoots) {
  const modDir = path.join(root, 'modules');
  if (!fs.existsSync(modDir)) fs.mkdirSync(modDir, { recursive: true });
  fs.copyFileSync(cleanerSrcPath, path.join(modDir, 'media_watermark_cleaner.cjs'));
  console.log('✅ Đã cập nhật media_watermark_cleaner.cjs tại:', modDir);
}

// 2. Cập nhật google_flow_web_runner.js
for (const root of targetRoots) {
  const runnerPath = path.join(root, 'modules/google_flow_web_runner.js');
  if (!fs.existsSync(runnerPath)) continue;

  let rCode = fs.readFileSync(runnerPath, 'utf8');

  // Đảm bảo Image job hỗ trợ cả upscale2k
  const imgBlockRegex = /\/\/ 🛡️ TÙY CHỌN XÓA WATERMARK TRÊN ẢNH SHOWROOM[\s\S]*?console\.warn\('\[PostProcessing Image\] Lỗi xóa watermark ảnh:', imgErr\);\s*\}\s*\}/g;
  const newImgBlock = `// 🛡️ TÙY CHỌN XÓA WATERMARK & UPSCALE 2K ẢNH SHOWROOM
    const shouldRemoveWatermark = job.payload?.removeWatermark === true;
    const shouldUpscale2k = job.payload?.upscale2k === true || job.payload?.imageResolution === '2k' || job.payload?.resolution === '2k';

    if (shouldRemoveWatermark || shouldUpscale2k) {
      try {
        context.updateProgress?.(92, shouldUpscale2k ? 'Đang nâng nét 2K và xóa logo ảnh...' : 'Đang xóa logo ảnh Showroom...');
        const MediaWatermarkCleaner = require('./media_watermark_cleaner.cjs');
        const cleaner = new MediaWatermarkCleaner();
        await cleaner.cleanMediaWatermark(targetFile, null, {
          removeWatermark: shouldRemoveWatermark,
          upscale2k: shouldUpscale2k
        });
      } catch (imgErr) {
        console.warn('[PostProcessing Image] Lỗi xử lý ảnh:', imgErr);
      }
    }`;

  if (imgBlockRegex.test(rCode)) {
    rCode = rCode.replace(imgBlockRegex, newImgBlock);
  } else if (!rCode.includes('UPSCALE 2K ẢNH SHOWROOM')) {
    rCode = rCode.replace('await downloadUrlToFile(imgUrl, targetFile);', `await downloadUrlToFile(imgUrl, targetFile);\n\n    ${newImgBlock}`);
  }

  fs.writeFileSync(runnerPath, rCode, 'utf8');
  console.log('✅ Đã cập nhật google_flow_web_runner.js tại:', runnerPath);
}

// 3. Cập nhật VideoFactoryStudio.js
const newControlsBlock = `// NÚT ĐIỀU KHIỂN CHẤT LƯỢNG & XÓA WATERMARK CHO CẢ ẢNH & VIDEO
            React.createElement("div", { className: "space-y-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.08]" },
              // 1. Độ nét Ảnh Showroom
              React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("span", { className: "text-[10px] font-bold text-gray-300 uppercase tracking-wider" }, "ĐỘ NÉT ẢNH SHOWROOM:"),
                React.createElement("div", { className: "flex gap-1" },
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setImageResolution('standard'),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${imageResolution !== '2k' ? 'bg-cyan-500 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "⚡ Chuẩn"),
                  React.createElement("button", {
                    type: "button",
                    onClick: () => setImageResolution('2k'),
                    className: \`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all \${imageResolution === '2k' ? 'bg-amber-400 text-black shadow-md' : 'bg-white/5 text-gray-400 hover:text-white'}\`
                  }, "🌟 2K Siêu Nét")
                )
              ),
              // 2. Độ nét Video Clip
              React.createElement("div", { className: "flex items-center justify-between pt-1 border-t border-white/[0.05]" },
                React.createElement("span", { className: "text-[10px] font-bold text-gray-300 uppercase tracking-wider" }, "ĐỘ NÉT VIDEO CLIP:"),
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
              // 3. Xóa Watermark (Ảnh & Video)
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

for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let vfCode = fs.readFileSync(vfPath, 'utf8');

  // Thêm state imageResolution
  if (!vfCode.includes('imageResolution, setImageResolution')) {
    vfCode = vfCode.replace(
      "const [videoResolution, setVideoResolution] = React.useState(globalStudioState?.videoResolution || '720p');",
      `const [videoResolution, setVideoResolution] = React.useState(globalStudioState?.videoResolution || '720p');
  const [imageResolution, setImageResolution] = React.useState(globalStudioState?.imageResolution || 'standard');`
    );
  }

  // Thêm vào persistence state
  if (!vfCode.includes('imageResolution,')) {
    vfCode = vfCode.replace(
      "videoResolution,\n      sceneCount,",
      "videoResolution,\n      imageResolution,\n      sceneCount,"
    );
    vfCode = vfCode.replace(
      "videoResolution, sceneCount, scenes]",
      "videoResolution, imageResolution, sceneCount, scenes]"
    );
  }

  // Cập nhật Showroom payload truyền imageResolution & upscale2k
  if (!vfCode.includes("upscale2k: imageResolution === '2k'")) {
    vfCode = vfCode.replace(
      'removeWatermark: removeWatermark',
      'removeWatermark: removeWatermark,\n              imageResolution: imageResolution,\n              upscale2k: imageResolution === \'2k\''
    );
  }

  // Thay thế khối điều khiển chính xác giữa MODEL VIDEO và NÚT TẠO SHOWROOM
  const modelAnchor = 'onChange: (v) => setVideoModel(v)\n            }),';
  const showroomAnchor = '// NÚT TẠO SHOWROOM (X CẢNH)';

  if (vfCode.includes(modelAnchor) && vfCode.includes(showroomAnchor)) {
    const idx1 = vfCode.indexOf(modelAnchor) + modelAnchor.length;
    const idx2 = vfCode.indexOf(showroomAnchor);
    if (idx1 < idx2) {
      vfCode = vfCode.slice(0, idx1) + '\n\n            ' + newControlsBlock + '\n\n            ' + vfCode.slice(idx2);
    }
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

console.log('\\n💎 HOÀN TẤT TÍCH HỢP ĐỘ NÉT 2K CHO ẢNH SHOWROOM & 1080P CHO VIDEO!');
