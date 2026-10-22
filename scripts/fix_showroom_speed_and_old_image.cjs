const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'
];

for (const root of targetRoots) {
  const filePath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(filePath)) {
    console.log('Skipping (not found):', filePath);
    continue;
  }

  let code = fs.readFileSync(filePath, 'utf8');

  // 1. Replace geminiModels with fast active models and 3.5s timeout
  code = code.replace(
    /'gemini-3\.8-flash'[\s\S]*?setTimeout\(\(\)\s*=>\s*controller\.abort\(\),\s*12000\);/g,
    "'gemini-3.5-flash',\n        'gemini-3.1-flash-lite',\n        'gemini-3.6-flash'\n      ];\n      for (const mName of geminiModels) {\n        try {\n          const controller = new AbortController();\n          const timer = setTimeout(() => controller.abort(), 3500);"
  );
  console.log('Replaced geminiModels in', filePath);

  // 2. Set showroomRunStartTime when clicking generate showroom
  if (!code.includes('showroomRunStartTime: runStartTime')) {
    code = code.replace(
      'setIsShowroomGenerating(true);',
      'setIsShowroomGenerating(true);\n    const runStartTime = Date.now();'
    );
    code = code.replace(
      'showroomStatus: \'generating\',\n      showroomProgress: 15,\n      showroomJobId: null',
      'showroomStatus: \'generating\',\n      showroomProgress: 15,\n      showroomJobId: null,\n      showroomRunStartTime: runStartTime'
    );
    console.log('Added showroomRunStartTime in', filePath);
  }

  // 3. Update addJobs callback to include showroomRunStartTime and queue.resume()
  code = code.replace(
    'const res = await window.aiforge.queue.addJobs(jobs);',
    'const res = await window.aiforge.queue.addJobs(jobs);\n        try { window.aiforge?.queue?.resume?.(); } catch(_) {}'
  );
  code = code.replace(
    'showroomJobId: jId || null,\n              showroomStatus: \'generating\',\n              showroomProgress: 20',
    'showroomJobId: jId || null,\n              showroomStatus: \'generating\',\n              showroomProgress: 20,\n              showroomRunStartTime: runStartTime'
  );
  console.log('Updated addJobs handler in', filePath);

  // 4. Overhaul checkJobsAndAssetsDirectly:
  // Find where sJob is resolved in checkJobsAndAssetsDirectly
  const oldJobLookup = "if (!s.showroomImage || s.showroomJobId || s.showroomStatus === 'generating') {\n            let sJob = null;";
  if (code.includes(oldJobLookup)) {
    const endLookup = "if (sJob) {\n              if (sJob.status === 'Completed')";
    const p1 = code.indexOf(oldJobLookup);
    const p2 = code.indexOf(endLookup, p1);

    if (p1 !== -1 && p2 !== -1) {
      const newLookupBlock = `if (!s.showroomImage || s.showroomJobId || s.showroomStatus === 'generating') {
            let sJob = null;
            if (s.showroomJobId) {
              sJob = sortedJobs.find(j => j.id === s.showroomJobId);
            } else if (s.showroomRunStartTime) {
              // Chỉ tìm job được tạo trong đợt bấm tạo này
              sJob = sortedJobs.find(j => 
                j.type === 'Image' && 
                new Date(j.createdAt || 0).getTime() >= (s.showroomRunStartTime - 3000) &&
                (
                  (j.payload?.studioSource === 'video-factory' && (j.title?.includes('Cảnh ' + s.id + ':') || j.payload?.title?.includes('Cảnh ' + s.id + ':'))) ||
                  j.title?.includes('Showroom Cảnh ' + s.id + ':') ||
                  j.title?.includes('[Xưởng] Showroom Cảnh ' + s.id + ':')
                )
              );
            } else if (s.showroomStatus !== 'generating') {
              sJob = sortedJobs.find(j => 
                j.type === 'Image' && (
                  (j.payload?.studioSource === 'video-factory' && (j.title?.includes('Cảnh ' + s.id + ':') || j.payload?.title?.includes('Cảnh ' + s.id + ':'))) ||
                  j.title?.includes('Showroom Cảnh ' + s.id + ':') ||
                  j.title?.includes('[Xưởng] Showroom Cảnh ' + s.id + ':')
                )
              );
            }

            // NẾU ĐANG GENERATING VÀ CHƯA CÓ JOB: GIỮ NGUYÊN TRẠNG THÁI GENERATING, KHÔNG BAO GIỜ LẤY ẢNH CŨ
            if (s.showroomStatus === 'generating' && !sJob) {
              // Bỏ qua không làm gì để tiếp tục chờ job Banana chạy xong
            } else `;

      code = code.slice(0, p1) + newLookupBlock + code.slice(p2);
      console.log('Replaced job lookup logic in', filePath);
    }
  }

  // 5. Ensure fallbackAsset ONLY runs if s.showroomStatus !== 'generating'
  code = code.replace(
    '} else if (!s.showroomImage) {\n              // Tìm trong thư viện Assets',
    "} else if (!s.showroomImage && s.showroomStatus !== 'generating') {\n              // Tìm trong thư viện Assets"
  );

  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Saved:', filePath);

  try {
    execSync(`node --check "${filePath}"`);
    console.log('✅ Syntax valid for', filePath);
  } catch (err) {
    console.error('❌ Syntax error in', filePath, err.message);
  }
}
