const fs = require('fs');
const path = require('path');

console.log('=== ÁP DỤNG ROUND-ROBIN LOAD BALANCER CHO TẠO ẢNH TRONG XƯỞNG ===');

const file = path.join(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(file, 'utf8');

// 1. PATCH generateSingleStoryboardImage (pos ~ 69080)
const oldSingleImgAcc = `      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;`;

const newSingleImgAcc = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let curBananaAcc = undefined;
      let isManualBanana = false;
      if (!isAutoBanana) {
        curBananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId);
        isManualBanana = !!curBananaAcc;
      }
      if (!curBananaAcc && activeBananaAccs.length > 0) {
        window.__aiforge_koc_single_banana_counter = (window.__aiforge_koc_single_banana_counter || 0) + 1;
        curBananaAcc = activeBananaAccs[(window.__aiforge_koc_single_banana_counter - 1) % activeBananaAccs.length];
        isManualBanana = false;
      }
      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;`;

if (code.includes(oldSingleImgAcc)) {
  code = code.replace(oldSingleImgAcc, newSingleImgAcc);
  console.log('[1/5] generateSingleStoryboardImage: Đã nâng cấp Round-Robin cho ảnh đơn lẻ!');
}

// 2. PATCH renderAllStoryboards (pos ~ 72107)
// Trong renderAllStoryboards:
// Thay thế đoạn định nghĩa bananaAcc đầu hàm
const oldBatchBananaHead = `      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;

      // TRƯỜNG HỢP 1: CẢ CẢNH 1 VÀ CẢNH 3 ĐỀU ĐÃ CÓ ẢNH -> NẠP CẢ 7 CẢNH VỚI ĐỦ MỎ NEO!
      if (hasFrame1Asset && hasFrame3Asset) {
        const validFrame1Id = await ensureRegisteredAsset(frame1.imageAsset, 'koc_scene_1.jpg');
        const validFrame3Id = await ensureRegisteredAsset(frame3.imageAsset, 'koc_scene_3.jpg');
        toast?.info?.("🚀 Đang sản xuất toàn bộ 7 cảnh với đầy đủ chuỗi mỏ neo Cảnh 1 & Cảnh 3...");

        const jobs = cs.storyboard.map(frame => {`;

const newBatchBananaHead = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;

      // TRƯỜNG HỢP 1: CẢ CẢNH 1 VÀ CẢNH 3 ĐỀU ĐÃ CÓ ẢNH -> NẠP CẢ 7 CẢNH VỚI ĐỦ MỎ NEO!
      if (hasFrame1Asset && hasFrame3Asset) {
        const validFrame1Id = await ensureRegisteredAsset(frame1.imageAsset, 'koc_scene_1.jpg');
        const validFrame3Id = await ensureRegisteredAsset(frame3.imageAsset, 'koc_scene_3.jpg');
        toast?.info?.("🚀 Đang sản xuất toàn bộ 7 cảnh với đầy đủ chuỗi mỏ neo Cảnh 1 & Cảnh 3...");

        const jobs = cs.storyboard.map((frame, idx) => {
          let curAcc = undefined;
          let isManual = false;
          if (manualBananaAcc) {
            curAcc = manualBananaAcc;
            isManual = true;
          } else if (activeBananaAccs.length > 0) {
            // 🎯 ROUND-ROBIN BANANA: Chia đều ảnh cho từng tài khoản (2 acc -> 50/50, 3 acc -> chia 3)
            curAcc = activeBananaAccs[idx % activeBananaAccs.length];
            isManual = false;
          }
          const targetAccId = curAcc?.accountId || undefined;
          const targetAccName = curAcc?.accountDisplayName || curAcc?.accountEmail || curAcc?.accountName || undefined;`;

if (code.includes(oldBatchBananaHead)) {
  code = code.replace(oldBatchBananaHead, newBatchBananaHead);
  console.log('[2/5] renderAllStoryboards: Đã nâng cấp Trường hợp 1 (7 cảnh đồng loạt)!');
}

// Thay thế Trường hợp 2 trong renderAllStoryboards:
const oldCase2 = `        const targetFrames = cs.storyboard.filter(f => f.id === 2 || f.id === 3);
        const jobs = targetFrames.map(frame => {`;

const newCase2 = `        const targetFrames = cs.storyboard.filter(f => f.id === 2 || f.id === 3);
        const jobs = targetFrames.map((frame, idx) => {
          let curAcc = undefined;
          let isManual = false;
          if (manualBananaAcc) {
            curAcc = manualBananaAcc;
            isManual = true;
          } else if (activeBananaAccs.length > 0) {
            curAcc = activeBananaAccs[idx % activeBananaAccs.length];
            isManual = false;
          }
          const targetAccId = curAcc?.accountId || undefined;
          const targetAccName = curAcc?.accountDisplayName || curAcc?.accountEmail || curAcc?.accountName || undefined;`;

if (code.includes(oldCase2)) {
  code = code.replace(oldCase2, newCase2);
  console.log('[2/5] renderAllStoryboards: Đã nâng cấp Trường hợp 2 (Cảnh 2 & 3)!');
}

// 3. PATCH dispatchScenesWaitingAnchor1 (pos ~ 80612)
const oldAnchor1 = `      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;

      const jobs = waitingScenes.map(frame => {`;

const newAnchor1 = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;

      const jobs = waitingScenes.map((frame, idx) => {
        let curAcc = undefined;
        let isManual = false;
        if (manualBananaAcc) {
          curAcc = manualBananaAcc;
          isManual = true;
        } else if (activeBananaAccs.length > 0) {
          curAcc = activeBananaAccs[idx % activeBananaAccs.length];
          isManual = false;
        }
        const targetAccId = curAcc?.accountId || undefined;
        const targetAccName = curAcc?.accountDisplayName || curAcc?.accountEmail || curAcc?.accountName || undefined;`;

if (code.includes(oldAnchor1)) {
  code = code.replace(oldAnchor1, newAnchor1);
  console.log('[3/5] dispatchScenesWaitingAnchor1: Đã nâng cấp Round-Robin cho Cảnh 2 & 3 nối chuỗi!');
}

// 4. PATCH dispatchScenesWaitingAnchor3 (pos ~ 84132)
// Tìm đoạn dispatchScenesWaitingAnchor3
const pAnchor3 = code.indexOf('dispatchScenesWaitingAnchor3 = async (frame3Asset)');
if (pAnchor3 !== -1) {
  const sliceAnchor3 = code.slice(pAnchor3, pAnchor3 + 2500);
  const oldAnchor3Block = `      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetAccId = bananaAcc?.accountId || undefined;

      const jobs = waitingScenes.map(frame => {`;

  const newAnchor3Block = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;

      const jobs = waitingScenes.map((frame, idx) => {
        let curAcc = undefined;
        let isManual = false;
        if (manualBananaAcc) {
          curAcc = manualBananaAcc;
          isManual = true;
        } else if (activeBananaAccs.length > 0) {
          curAcc = activeBananaAccs[idx % activeBananaAccs.length];
          isManual = false;
        }
        const targetAccId = curAcc?.accountId || undefined;
        const targetAccName = curAcc?.accountDisplayName || curAcc?.accountEmail || curAcc?.accountName || undefined;`;

  if (code.includes(oldAnchor3Block)) {
    code = code.replace(oldAnchor3Block, newAnchor3Block);
    console.log('[4/5] dispatchScenesWaitingAnchor3: Đã nâng cấp Round-Robin cho Cảnh 4, 5, 6, 7!');
  }
}

// 5. PATCH generateShowroomModelImage (pos ~ 171623)
const oldShowroom = `      // Luôn lấy đúng tài khoản Banana (Ảnh Showroom) để không bao giờ bị nghẽn
      const bananaAcc = accounts.find(a => a.accountId === selectedBananaAccountId && a.providerId === 'banana')
        || accounts.find(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      const targetBananaAccId = bananaAcc?.accountId || undefined;

      if (window.aiforge?.queue?.addJobs) {

        const prodDesc = productInfo || niche.defaultInfo || brandName;

        const jobs = scenes.map((s, idx) => {`;

const newShowroom = `      // 🎯 ROUND-ROBIN CHO ẢNH SHOWROOM: Chia đều cho từng tài khoản Banana
      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && a.authStatus === 'Logged In');
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;

      if (window.aiforge?.queue?.addJobs) {

        const prodDesc = productInfo || niche.defaultInfo || brandName;

        const jobs = scenes.map((s, idx) => {
          let curAcc = undefined;
          let isManual = false;
          if (manualBananaAcc) {
            curAcc = manualBananaAcc;
            isManual = true;
          } else if (activeBananaAccs.length > 0) {
            curAcc = activeBananaAccs[idx % activeBananaAccs.length];
            isManual = false;
          }
          const targetBananaAccId = curAcc?.accountId || undefined;
          const targetBananaAccName = curAcc?.accountDisplayName || curAcc?.accountEmail || curAcc?.accountName || undefined;`;

if (code.includes(oldShowroom)) {
  code = code.replace(oldShowroom, newShowroom);
  console.log('[5/5] generateShowroomModelImage: Đã nâng cấp Round-Robin cho Ảnh Showroom!');
}

fs.writeFileSync(file, code, 'utf8');
console.log('=== HOÀN TẤT NÂNG CẤP TẠO ẢNH CHO XƯỞNG THỜI TRANG & SHOWROOM ===');
