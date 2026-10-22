const fs = require('fs');

const serverFile = 'vercel_server/api/index.js';
let content = fs.readFileSync(serverFile, 'utf8');

// Backup
fs.writeFileSync(serverFile + '.bak_before_custom_keys', content, 'utf8');
console.log('Backed up vercel_server/api/index.js');

// 1. Thêm plan 'custom' vào PLANS
const customPlanDef = `  {
    code: 'custom',
    name: 'Gói Tùy Chọn',
    tier: 'pro',
    badge: 'Gói Tùy Chọn (Cấp Thử/Đặc Biệt)',
    accentColor: '#10b981',
    recommended: false,
    trialEnabled: false,
    trialDays: 0,
    trialOncePerMachine: false,
    allowPromotion: false,
    maxDevices: 1,
    features: [
      'Trải nghiệm đầy đủ tính năng AI Forge Veo 3 Studio',
      'Tạo Video Veo 3 & Grok chất lượng cao',
      'Tạo ảnh Google Flow Nano & ChatGPT',
      'Giọng đọc AI ElevenLabs TTS không giới hạn',
      'Sử dụng bản quyền trên 1 máy tính duy nhất'
    ],
    billingOptions: [
      { durationCode: 'CUSTOM', durationDays: 1, priceVnd: 0, originalPriceVnd: 0, sortOrder: 1 }
    ],
    imageConcurrency: 30,
    videoConcurrency: 15,
    ttsConcurrency: 30,
    unlimited: true
  },
`;

const plansAnchor = "const PLANS = [";
if (content.includes(plansAnchor)) {
  content = content.replace(plansAnchor, plansAnchor + "\n" + customPlanDef);
  console.log('1. Added custom plan to PLANS');
} else {
  throw new Error('Could not find PLANS array');
}

// 2. Cải tiến hydrateFromCloud: tăng timeout 6000ms, retry, và không ép 1D thành trial nếu là custom
const oldHydrateHead = `async function hydrateFromCloud(force = false) {
  const now = Date.now();
  if (!force && inMemoryStore.hydrated && (now - lastHydratedAt < 3000)) return;
  lastHydratedAt = now;
  try {
    const res = await fetch(\`\${REMOTE_API_BASE}/\${MASTER_CLOUD_ID}\`, { signal: AbortSignal.timeout(3500) });`;

const newHydrateHead = `async function hydrateFromCloud(force = false) {
  const now = Date.now();
  if (!force && inMemoryStore.hydrated && (now - lastHydratedAt < 5000)) return;
  lastHydratedAt = now;
  try {
    let res = null;
    try {
      res = await fetch(\`\${REMOTE_API_BASE}/\${MASTER_CLOUD_ID}\`, { signal: AbortSignal.timeout(6000) });
    } catch (e1) {
      // Retry once after 300ms if failed
      await new Promise(r => setTimeout(r, 300));
      res = await fetch(\`\${REMOTE_API_BASE}/\${MASTER_CLOUD_ID}\`, { signal: AbortSignal.timeout(6000) });
    }`;

if (content.includes(oldHydrateHead)) {
  content = content.replace(oldHydrateHead, newHydrateHead);
  console.log('2. Enhanced hydrateFromCloud with retry & 6000ms timeout');
} else {
  throw new Error('Could not find oldHydrateHead');
}

// 2.2 Sửa việc ép 1D thành trial trong hydrateFromCloud
const oldIsTrialKey = "const isTrial = k.planCode === 'trial' || cleanK.includes('TRIAL') || cleanK.includes('1D');";
const newIsTrialKey = "const isTrial = (k.planCode === 'trial' || cleanK.includes('TRIAL')) && k.planCode !== 'custom' && !cleanK.includes('CUSTOM');";
if (content.includes(oldIsTrialKey)) {
  content = content.replace(oldIsTrialKey, newIsTrialKey);
  console.log('2.2 Fixed isTrial check for keys in hydrate');
}

const oldIsTrialMachine = "const isTrial = m.planCode === 'trial' || (m.licenseKey && (m.licenseKey.includes('TRIAL') || m.licenseKey.includes('1D')));";
const newIsTrialMachine = "const isTrial = (m.planCode === 'trial' || (m.licenseKey && m.licenseKey.includes('TRIAL'))) && m.planCode !== 'custom' && !(m.licenseKey && m.licenseKey.includes('CUSTOM'));";
if (content.includes(oldIsTrialMachine)) {
  content = content.replace(oldIsTrialMachine, newIsTrialMachine);
  console.log('2.3 Fixed isTrial check for machines in hydrate');
}

// 3. Sửa A9. Admin Generate Keys để hỗ trợ 'custom' với durationDays tùy ý
const oldGenLogic = `    const isTrial = planCode === 'trial';
    const matchedPlan = PLANS.find(p => p.code === planCode) || (isTrial ? PLANS[0] : (PLANS.find(p => p.code === 'basic') || PLANS[1]));
    const days = isTrial ? 1 : (parseInt(durationDays) || (matchedPlan.billingOptions?.[0]?.durationDays || 30));
    const num = Math.min(50, Math.max(1, parseInt(count) || 1));
    const effectiveDevices = parseInt(maxDevices) || (matchedPlan.maxDevices || 1);

    let effectivePlanName = planName || matchedPlan.name;
    let effectivePlanTier = planTier || matchedPlan.tier;

    if (planCode === 'gold') {
      effectivePlanName = 'Gold VIP';
      effectivePlanTier = 'ultra';
    } else if (planCode === 'silver') {
      effectivePlanName = 'Silver';
      effectivePlanTier = 'pro';
    } else if (planCode === 'trial') {
      effectivePlanName = 'Trial 1 Ngày';
      effectivePlanTier = 'pro';
    } else {
      effectivePlanName = 'Basic';
      effectivePlanTier = 'pro';
    }`;

const newGenLogic = `    const isTrial = planCode === 'trial';
    const isCustom = planCode === 'custom';
    const matchedPlan = PLANS.find(p => p.code === planCode) || (isTrial ? PLANS[0] : (PLANS.find(p => p.code === 'basic') || PLANS[1]));
    
    let days = 30;
    if (isTrial) {
      days = 1;
    } else if (isCustom) {
      days = Math.max(1, parseInt(durationDays) || 1);
    } else {
      days = parseInt(durationDays) || (matchedPlan.billingOptions?.[0]?.durationDays || 30);
    }

    const num = Math.min(50, Math.max(1, parseInt(count) || 1));
    const effectiveDevices = parseInt(maxDevices) || (matchedPlan.maxDevices || 1);

    let effectivePlanName = planName;
    let effectivePlanTier = planTier || 'pro';

    if (planCode === 'gold') {
      effectivePlanName = effectivePlanName || 'Gold VIP';
      effectivePlanTier = 'ultra';
    } else if (planCode === 'silver') {
      effectivePlanName = effectivePlanName || 'Silver';
      effectivePlanTier = 'pro';
    } else if (planCode === 'trial') {
      effectivePlanName = 'Trial 1 Ngày';
      effectivePlanTier = 'pro';
    } else if (planCode === 'custom') {
      effectivePlanName = effectivePlanName || \`Gói Tùy Chọn (\${days} Ngày)\`;
      effectivePlanTier = 'pro';
    } else {
      effectivePlanName = effectivePlanName || 'Basic';
      effectivePlanTier = 'pro';
    }`;

if (content.includes(oldGenLogic)) {
  content = content.replace(oldGenLogic, newGenLogic);
  console.log('3. Enhanced A9. Admin Generate Keys with custom duration');
} else {
  throw new Error('Could not find oldGenLogic');
}

// 4. Sửa B5. Manual Key Activation: Key Custom KHÔNG bị chặn bởi trialUsedMachines
const oldTrialCheckInActivate = `    // 5. KIỂM TRA TRIAL 1 NGÀY: 1 MÁY CHỈ DÙNG TRIAL 1 LẦN DUY NHẤT TRONG ĐỜI!
    const isTrial = keyObj.planCode === 'trial' || (keyObj.durationDays && keyObj.durationDays <= 1) || cleanKey.includes('TRIAL') || cleanKey.includes('1D');
    if (isTrial) {
      if (inMemoryStore.trialUsedMachines.has(cleanMachine)) {
        return sendJson(res, 403, {
          error: {
            code: 'TRIAL_ALREADY_USED',
            message: 'Máy tính này đã từng kích hoạt gói trải nghiệm Trial 1 ngày! Quý khách vui lòng mua gói Basic, Silver hoặc Gold VIP để tiếp tục sử dụng.'
          }
        });
      }
    }`;

const newTrialCheckInActivate = `    // 5. KIỂM TRA TRIAL: Chỉ chặn nếu là gói trial thông thường. Gói 'custom' (tùy chọn số ngày) do Admin cấp là key đặc biệt/VIP/test, KHÔNG bị chặn bởi trialUsedMachines!
    const isCustomKey = keyObj.planCode === 'custom' || cleanKey.includes('CUSTOM');
    const isTrial = !isCustomKey && (keyObj.planCode === 'trial' || cleanKey.includes('TRIAL'));
    if (isTrial) {
      if (inMemoryStore.trialUsedMachines.has(cleanMachine)) {
        return sendJson(res, 403, {
          error: {
            code: 'TRIAL_ALREADY_USED',
            message: 'Máy tính này đã từng kích hoạt gói trải nghiệm Trial 1 ngày! Quý khách vui lòng mua gói Basic, Silver hoặc Gold VIP để tiếp tục sử dụng.'
          }
        });
      }
    }`;

if (content.includes(oldTrialCheckInActivate)) {
  content = content.replace(oldTrialCheckInActivate, newTrialCheckInActivate);
  console.log('4. Updated activation trial check to exempt custom keys');
} else {
  throw new Error('Could not find oldTrialCheckInActivate');
}

// 4.2 Cập nhật thời hạn sử dụng và tên gói trong activate
const oldActivateExp = `    const now = new Date();
    const durationDays = isTrial ? 1 : (Number(keyObj.durationDays) || 30);
    const expDate = new Date(now.getTime() + durationDays * 86400000).toISOString();

    keyObj.status = 'active';
    keyObj.isConsumed = true;
    keyObj.planCode = isTrial ? 'trial' : keyObj.planCode;
    keyObj.planName = isTrial ? 'Trial 1 Ngày' : keyObj.planName;
    keyObj.durationDays = durationDays;`;

const newActivateExp = `    const now = new Date();
    const durationDays = isTrial ? 1 : (Number(keyObj.durationDays) || 30);
    const expDate = new Date(now.getTime() + durationDays * 86400000).toISOString();

    keyObj.status = 'active';
    keyObj.isConsumed = true;
    keyObj.planCode = isTrial ? 'trial' : (isCustomKey ? 'custom' : keyObj.planCode);
    keyObj.planName = isTrial ? 'Trial 1 Ngày' : (isCustomKey ? (keyObj.planName || \`Gói Tùy Chọn (\${durationDays} Ngày)\`) : keyObj.planName);
    keyObj.durationDays = durationDays;`;

if (content.includes(oldActivateExp)) {
  content = content.replace(oldActivateExp, newActivateExp);
  console.log('4.2 Updated activate exp and planCode logic');
} else {
  throw new Error('Could not find oldActivateExp');
}

// 5. Cải tiến B8. Check-In để KHÔNG BAO GIỜ bị mất kết nối giữa chừng
const oldCheckinKeyLookup = `    let keyObj = targetKey ? inMemoryStore.keys.get(targetKey) : null;
    if (!keyObj && targetKey) {
      for (const [k, v] of inMemoryStore.keys.entries()) {
        if (k.toUpperCase() === targetKey || v.id === targetKey) { keyObj = v; break; }
      }
    }`;

const newCheckinKeyLookup = `    let keyObj = targetKey ? inMemoryStore.keys.get(targetKey) : null;
    if (!keyObj && targetKey) {
      for (const [k, v] of inMemoryStore.keys.entries()) {
        if (k.toUpperCase() === targetKey || v.id === targetKey) { keyObj = v; break; }
      }
    }

    // Nếu chưa tìm thấy key trong memory, hydrate cưỡng bức từ cloud 1 lần trước khi từ chối
    if (!keyObj && (targetKey || cleanMachine)) {
      await hydrateFromCloud(true);
      if (targetKey) {
        keyObj = inMemoryStore.keys.get(targetKey);
        if (!keyObj) {
          for (const [k, v] of inMemoryStore.keys.entries()) {
            if (k.toUpperCase() === targetKey || v.id === targetKey) { keyObj = v; break; }
          }
        }
      }
    }`;

if (content.includes(oldCheckinKeyLookup)) {
  content = content.replace(oldCheckinKeyLookup, newCheckinKeyLookup);
  console.log('5. Added force hydrate fallback in check-in');
} else {
  throw new Error('Could not find oldCheckinKeyLookup');
}

fs.writeFileSync(serverFile, content, 'utf8');
console.log('✅ Successfully patched vercel_server/api/index.js!');
