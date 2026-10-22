const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let code = fs.readFileSync(targetFile, 'utf8');
console.log('[*] Original VideoFactoryStudio.js length:', code.length);

// 1. Helper function definition to place inside FashionKocProStudio
const helperDef = `  // 🎯 TRUY VẤN TÀI KHOẢN BANANA LIVE TỪ BROWSER HUB TRÁNH STALE PROPS
  const resolveBananaAccounts = async () => {
    const bApi = window.aiforge?.browser || window.aivideo?.browser;
    let pool = Array.isArray(accounts) ? [...accounts] : [];
    if (pool.length === 0 || !pool.some(a => a.providerId === 'banana')) {
      try {
        const live = await bApi?.listSessions?.();
        if (live && live.length > 0) pool = live;
      } catch (_) {}
    }
    let active = pool.filter(a =>
      (a.providerId === 'banana' || (a.provider && a.provider.toLowerCase().includes('banana'))) &&
      (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled)
    );
    if (active.length === 0) {
      active = pool.filter(a =>
        a.providerId === 'banana' || (a.provider && a.provider.toLowerCase().includes('banana'))
      );
    }
    return { pool, active };
  };
`;

// Insert helper before generateSingleImage if not already present
if (!code.includes('const resolveBananaAccounts = async')) {
  const targetAnchor = '  const generateSingleImage = async (frameId) => {';
  const posAnchor = code.indexOf(targetAnchor);
  if (posAnchor === -1) {
    console.error('❌ Could not find targetAnchor generateSingleImage');
    process.exit(1);
  }
  code = code.substring(0, posAnchor) + helperDef + '\n' + code.substring(posAnchor);
  console.log('  ✓ Đã chèn resolveBananaAccounts helper');
}

// 2. Patch generateSingleImage to use resolveBananaAccounts and add promptOrder & sceneName
const oldSingleAcc = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
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
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        autoRemoveWatermark: cs.removeWatermark === true,
        removeWatermark: cs.removeWatermark === true,
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          prompt: finalPrompt,`;

const newSingleAcc = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      const { pool: bananaPool, active: activeBananaAccs } = await resolveBananaAccounts();
      let curBananaAcc = undefined;
      let isManualBanana = false;
      if (!isAutoBanana) {
        curBananaAcc = bananaPool.find(a => a.accountId === selectedBananaAccountId);
        isManualBanana = !!curBananaAcc;
      }
      if (!curBananaAcc && activeBananaAccs.length > 0) {
        window.__aiforge_koc_single_banana_counter = (window.__aiforge_koc_single_banana_counter || 0) + 1;
        curBananaAcc = activeBananaAccs[(window.__aiforge_koc_single_banana_counter - 1) % activeBananaAccs.length];
        isManualBanana = false;
      }
      const targetAccId = curBananaAcc?.accountId || undefined;
      const targetAccName = curBananaAcc?.accountDisplayName || curBananaAcc?.accountEmail || curBananaAcc?.accountName || undefined;

      const jobInput = {
        title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
        type: "Image",
        providerId: "banana",
        provider: "Banana",
        autoRemoveWatermark: cs.removeWatermark === true,
        removeWatermark: cs.removeWatermark === true,
        ...(targetAccId ? { accountId: targetAccId, account: targetAccName } : {}),
        payload: {
          title: \`[KOC Thời Trang] Storyboard Cảnh \${frameId}\`,
          promptOrder: Number(frameId),
          sceneIndex: Number(frameId),
          sceneName: \`Cảnh \${frameId}\`,
          prompt: finalPrompt,`;

if (code.includes(oldSingleAcc)) {
  code = code.replace(oldSingleAcc, newSingleAcc);
  console.log('  ✓ Đã cập nhật generateSingleImage (live session + scene label)');
} else {
  console.log('  [*] oldSingleAcc pattern not found, might already be updated');
}

// 3. Patch generateAllImages start
const oldAllStart = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      let activeBananaAccs = accounts.filter(a => a.providerId === 'banana' && (a.authStatus === 'Logged In' || a.authStatus === 'active' || !a.disabled));
      if (activeBananaAccs.length === 0) activeBananaAccs = accounts.filter(a => a.providerId === 'banana');
      let manualBananaAcc = !isAutoBanana ? accounts.find(a => a.accountId === selectedBananaAccountId) : undefined;`;

const newAllStart = `      const isAutoBanana = !selectedBananaAccountId || selectedBananaAccountId === 'auto';
      const { pool: bananaPool, active: activeBananaAccs } = await resolveBananaAccounts();
      let manualBananaAcc = !isAutoBanana ? bananaPool.find(a => a.accountId === selectedBananaAccountId) : undefined;`;

if (code.includes(oldAllStart)) {
  code = code.replace(oldAllStart, newAllStart);
  console.log('  ✓ Đã cập nhật generateAllImages session resolution');
}

// 4. Patch Case 1 payload in generateAllImages
const oldCase1Payload = `            payload: {
              title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
              prompt: finalPrompt,`;

const newCase1Payload = `            payload: {
              title: \`[KOC Thời Trang] Storyboard Cảnh \${frame.id}\`,
              promptOrder: Number(frame.id),
              sceneIndex: Number(frame.id),
              sceneName: \`Cảnh \${frame.id}\`,
              prompt: finalPrompt,`;

if (code.includes(oldCase1Payload)) {
  code = code.replaceAll(oldCase1Payload, newCase1Payload);
  console.log('  ✓ Đã gắn promptOrder & sceneName vào các case của generateAllImages / dispatch');
}

// 5. Patch Case 3 payload in generateAllImages
const oldCase3Payload = `          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            prompt: f1Prompt,`;

const newCase3Payload = `          payload: {
            title: \`[KOC Thời Trang] Storyboard Cảnh 1\`,
            promptOrder: 1,
            sceneIndex: 1,
            sceneName: 'Cảnh 1',
            prompt: f1Prompt,`;

if (code.includes(oldCase3Payload)) {
  code = code.replace(oldCase3Payload, newCase3Payload);
  console.log('  ✓ Đã gắn promptOrder & sceneName vào Case 3 (Cảnh 1 anchor)');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log('[+] Đã lưu VideoFactoryStudio.js thành công. Chiều dài mới:', code.length);
