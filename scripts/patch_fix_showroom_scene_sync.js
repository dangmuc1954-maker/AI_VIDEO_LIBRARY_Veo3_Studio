// scripts/patch_fix_showroom_scene_sync.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 FIX ĐỒNG BỘ ẢNH SHOWROOM & VIDEO VÀO BÀN CẢNH SIÊU TỐC VÀ BỀN VỮNG 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let vfCode = fs.readFileSync(vfPath, 'utf8');

  // 1. Cập nhật hàm checkJobsAndAssetsDirectly
  const oldCheckStart = '// ⚡ BỘ ĐỒNG BỘ SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1 GIÂY) KHI ẢNH/VIDEO XONG';
  const oldCheckEnd = '// Lắng nghe queue.onChanged, assets.onChanged VÀ Fast Polling 1200ms siêu tốc';

  const newCheckFunc = `// ⚡ BỘ ĐỒNG BỘ SIÊU TỐC: TỰ ĐỘNG QUÉT VÀ NẠP NGAY LẬP TỨC (< 1 GIÂY) KHI ẢNH/VIDEO XONG
  const checkJobsAndAssetsDirectly = React.useCallback(async () => {
    try {
      const queueApi = window.aiforge?.queue || window.aivideo?.queue;
      const assetsApi = window.aiforge?.assets || window.aivideo?.assets;
      if (!queueApi?.list) return;

      const [rawJobs, allAssets] = await Promise.all([
        queueApi.list().catch(() => []),
        assetsApi?.list ? assetsApi.list().catch(() => []) : Promise.resolve([])
      ]);

      if (!Array.isArray(rawJobs)) return;

      // Sắp xếp jobs theo thời gian mới nhất lên đầu để luôn ưu tiên nạp thành phẩm vừa xong
      const jobs = [...rawJobs].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setScenes(prev => {
        let changed = false;
        const next = prev.map(scene => {
          let s = { ...scene };

          // 1. Kiểm tra ảnh Showroom của cảnh (Tự động nạp ngay cả khi vừa chuyển tab)
          if (!s.showroomImage || s.showroomJobId || s.showroomStatus === 'generating') {
            const sJob = jobs.find(j => 
              (s.showroomJobId && j.id === s.showroomJobId) || 
              (j.type === 'Image' && j.payload?.studioSource === 'video-factory' && (j.title?.includes(\`Cảnh \${s.id}:\`) || j.payload?.title?.includes(\`Cảnh \${s.id}:\`))) ||
              (j.type === 'Image' && j.title?.includes(\`Showroom Cảnh \${s.id}:\`))
            );

            // Quét trong thư viện Assets
            const matchedAsset = (allAssets || []).find(a => 
              (sJob && a.jobId === sJob.id) ||
              (sJob && (a.id === sJob.resultAssetId || a.id === sJob.result?.assetId || a.id === sJob.result?.assets?.[0]?.assetId || a.id === sJob.result?.assets?.[0]?.id)) ||
              (a.type === 'image' && (a.name?.toLowerCase().includes(\`canh_\${s.id}\`) || a.name?.toLowerCase().includes(\`canh\${s.id}\`) || a.prompt?.includes(\`Scene \${s.id}\`)))
            );

            if (matchedAsset && (matchedAsset.url || matchedAsset.localPath || matchedAsset.thumbnailUrl)) {
              const bestUrl = matchedAsset.thumbnailUrl || matchedAsset.url || (matchedAsset.localPath ? 'file:///' + matchedAsset.localPath.replace(/\\\\/g, '/') : '');
              s.showroomStatus = 'done';
              s.showroomProgress = 100;
              s.showroomJobId = null;
              s.showroomImage = {
                url: bestUrl,
                localPath: matchedAsset.localPath || '',
                assetId: matchedAsset.id,
                base64: bestUrl,
                mimeType: matchedAsset.mimeType || 'image/jpeg'
              };
              changed = true;
            } else if (sJob) {
              if (sJob.status === 'Completed') {
                const resAsset = sJob.result?.assets?.[0];
                if (resAsset && (resAsset.url || resAsset.localPath || resAsset.path)) {
                  const bestUrl = resAsset.thumbnailUrl || resAsset.url || (resAsset.localPath ? 'file:///' + resAsset.localPath.replace(/\\\\/g, '/') : '');
                  s.showroomStatus = 'done';
                  s.showroomProgress = 100;
                  s.showroomJobId = null;
                  s.showroomImage = {
                    url: bestUrl,
                    localPath: resAsset.localPath || '',
                    assetId: resAsset.assetId || resAsset.id,
                    base64: bestUrl,
                    mimeType: resAsset.mimeType || 'image/jpeg'
                  };
                  changed = true;
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
              }
            }
          }

          // 2. Kiểm tra Video Clip của cảnh
          if (!s.videoUrl || s.jobId || s.videoStatus === 'generating') {
            const vJob = jobs.find(j => 
              (s.jobId && j.id === s.jobId) || 
              (j.type === 'Video' && j.payload?.studioSource === 'video-factory' && (j.title?.includes(\`Cảnh \${s.id}:\`) || j.payload?.title?.includes(\`Cảnh \${s.id}:\`))) ||
              (j.type === 'Video' && j.title?.includes(\`[Xưởng] Cảnh \${s.id}:\`))
            );

            const matchedVideoAsset = (allAssets || []).find(a => 
              (vJob && a.jobId === vJob.id) ||
              (vJob && (a.id === vJob.resultAssetId || a.id === vJob.result?.assetId || a.id === vJob.result?.assets?.[0]?.assetId || a.id === vJob.result?.assets?.[0]?.id)) ||
              (a.type === 'video' && a.name?.toLowerCase().includes(\`canh_\${s.id}\`))
            );

            if (matchedVideoAsset && (matchedVideoAsset.url || matchedVideoAsset.localPath)) {
              const bestUrl = matchedVideoAsset.url || (matchedVideoAsset.localPath ? 'file:///' + matchedVideoAsset.localPath.replace(/\\\\/g, '/') : '');
              s.videoStatus = 'done';
              s.videoProgress = 100;
              s.jobId = null;
              s.videoUrl = bestUrl;
              s.assetId = matchedVideoAsset.id;
              changed = true;
            } else if (vJob) {
              if (vJob.status === 'Completed') {
                const resAsset = vJob.result?.assets?.[0];
                if (resAsset && (resAsset.url || resAsset.localPath || resAsset.path)) {
                  const bestUrl = resAsset.url || (resAsset.localPath ? 'file:///' + resAsset.localPath.replace(/\\\\/g, '/') : '');
                  s.videoStatus = 'done';
                  s.videoProgress = 100;
                  s.jobId = null;
                  s.videoUrl = bestUrl;
                  s.assetId = resAsset.assetId || resAsset.id;
                  changed = true;
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
  }, []);`;

  const idx1 = vfCode.indexOf(oldCheckStart);
  const idx2 = vfCode.indexOf(oldCheckEnd);
  if (idx1 !== -1 && idx2 !== -1) {
    vfCode = vfCode.slice(0, idx1) + newCheckFunc + '\n\n  ' + vfCode.slice(idx2);
  }

  // 2. Thêm onError fallback cho thẻ img của Showroom (cả active phone mockup và bàn cảnh)
  vfCode = vfCode.replace(
    'src: activeScene.showroomImage.url || activeScene.showroomImage.base64,\n                style: { width: \'100%\', height: \'100%\', objectFit: \'cover\', display: \'block\' }',
    `src: activeScene.showroomImage.thumbnailUrl || activeScene.showroomImage.url || activeScene.showroomImage.base64,
                onError: (e) => { if (activeScene.showroomImage?.localPath) e.target.src = 'file:///' + activeScene.showroomImage.localPath.replace(/\\\\/g, '/'); },
                style: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }`
  );

  vfCode = vfCode.replace(
    'src: scene.showroomImage.url || scene.showroomImage.base64,\n                        style: { width: \'100%\', height: \'100%\', objectFit: \'cover\' }',
    `src: scene.showroomImage.thumbnailUrl || scene.showroomImage.url || scene.showroomImage.base64,
                        onError: (e) => { if (scene.showroomImage?.localPath) e.target.src = 'file:///' + scene.showroomImage.localPath.replace(/\\\\/g, '/'); },
                        style: { width: '100%', height: '100%', objectFit: 'cover' }`
  );

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

console.log('\\n💎 HOÀN TẤT VÁ LỖI NẠP ẢNH SHOWROOM VÀ VIDEO VÀO BÀN CẢNH!');
