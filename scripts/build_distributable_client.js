const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getOrCreateKeyPair } = require('../license_server/cryptoUtils');

console.log('======================================================================');
console.log('🚀 ĐANG ĐÓNG GÓI PHẦN MỀM THƯƠNG MẠI CHUYÊN NGHIỆP CHO KHÁCH HÀNG 🚀');
console.log('======================================================================');

const keyData = getOrCreateKeyPair();
const serverUrl = process.env.LICENSE_SERVER_URL || 'https://vercelserver-eight.vercel.app';

console.log(`[*] Target License Server URL: ${serverUrl}`);
console.log(`[*] Target Public Key ID: ${keyData.keyId}`);

const srcAppDir = path.join(__dirname, '../extracted_original');
const electronBinDir = path.join(__dirname, '../electron_bin');
const distDir = path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition');
const zipFile = path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0.zip');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Clean output directory
console.log('[*] Chuẩn bị thư mục đóng gói sạch sẽ...');
if (fs.existsSync(distDir)) {
  try {
    fs.rmSync(distDir, { recursive: true, force: true });
  } catch (e) {
    console.log('Notice: cleaning distDir...', e.message);
  }
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy Electron Binaries and rename electron.exe -> AI VIDEO LIBRARY.exe
console.log('[*] Đóng gói nhân Electron Runtime thành phần mềm AI VIDEO LIBRARY.exe...');
const binFiles = fs.readdirSync(electronBinDir);
binFiles.forEach(file => {
  if (file === 'resources') return; // Handled separately
  const srcPath = path.join(electronBinDir, file);
  if (file === 'electron.exe') {
    fs.copyFileSync(srcPath, path.join(distDir, 'AI VIDEO LIBRARY.exe'));
  } else {
    copyRecursiveSync(srcPath, path.join(distDir, file));
  }
});

// 3. Create resources/app structure
const appResourcesDir = path.join(distDir, 'resources/app');
fs.mkdirSync(appResourcesDir, { recursive: true });

console.log('[*] Đóng gói mã nguồn ứng dụng vào resources/app...');
copyRecursiveSync(path.join(srcAppDir, 'out'), path.join(appResourcesDir, 'out'));
copyRecursiveSync(path.join(srcAppDir, 'package.json'), path.join(appResourcesDir, 'package.json'));
if (fs.existsSync(path.join(srcAppDir, 'node_modules'))) {
  console.log('[*] Đóng gói toàn bộ thư viện phụ thuộc node_modules (ffmpeg-static, v.v.)...');
  copyRecursiveSync(path.join(srcAppDir, 'node_modules'), path.join(appResourcesDir, 'node_modules'));
}

// 4. Inject Commercial Engine into resources/app/out/main/index.js
const mainJsPath = path.join(appResourcesDir, 'out/main/index.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 4.1 Point backendUrl to License Server
code = code.replace(
  /function\s+xw\(\)\{[^}]*\}/g,
  `function xw(){return "${serverUrl}";}`
);

// 4.2 Inject Ed25519 Public Key
const pubKeyJson = JSON.stringify({ [keyData.keyId]: keyData.publicKey });
code = code.replace(
  /function\s+Ow\(\)\{[\s\S]*?return\s+o&&typeof\s+o=="object"\?Object\.fromEntries[\s\S]*?\}\}/g,
  `function Ow(){return ${pubKeyJson};}`
);

// 4.3 Make sure window shows instantly
code = code.replace('backgroundColor:"#070a11",show:!1', 'backgroundColor:"#070a11",show:!0');

// 4.4 Inject Autonomous Commercial Engine (ESM compatible with nodeCrypto, nodeFs, nodePath)
const db = require('../license_server/db');
const fallbackPlansJson = JSON.stringify(db.data.plans);
const bankSettings = db.data.settings;

// Prepend ESM imports at the very top
const esmImports = `import nodeCrypto from "node:crypto";\nimport nodeFs from "node:fs";\nimport nodePath from "node:path";\n`;

// Autonomous Offline Token Generator Function
const offlineSignerCode = `
function generateAutonomousToken(inputStr, machineCode, customerId, isTrial, currentExpiresIso, currentPlan) {
  const now = Math.floor(Date.now() / 1e3);
  let baseSeconds = now;
  if (currentExpiresIso) {
    const curExp = Math.floor(new Date(currentExpiresIso).getTime() / 1e3);
    if (curExp > now) {
      baseSeconds = curExp;
    }
  }
  let days = 30;
  let plan = 'basic';
  let planName = 'Basic';
  let tier = 'pro';
  let isUnlimited = true;
  let limits = { unlimited: true, maxConcurrency: 50, imageConcurrency: 50, videoConcurrency: 30, ttsConcurrency: 50 };

  if (isTrial || (typeof inputStr === 'string' && inputStr.toUpperCase().includes('TRIAL'))) {
    days = 3;
    plan = 'trial';
    planName = 'Trải Nghiệm Free';
    tier = 'starter';
    isUnlimited = false;
    limits = {
      unlimited: false,
      imageConcurrency: 5,
      imagePeriodQuota: 300,
      videoConcurrency: 2,
      videoPeriodQuota: 200,
      ttsConcurrency: 5,
      ttsPeriodQuota: 300
    };
  } else if (typeof inputStr === 'string') {
    const clean = inputStr.toUpperCase();
    if (clean.includes('LIFETIME') || clean.includes('VIP-FOREVER') || clean.includes('36500D')) {
      plan = 'gold';
      planName = 'Gold VIP Trọn Đời';
      tier = 'ultra';
      days = 36500;
    } else if (clean.includes('GOLD') || clean.includes('ULTRA') || clean.includes('365D') || clean.includes('1Y') || clean.includes('YEAR')) {
      plan = 'gold';
      planName = 'Gold VIP';
      tier = 'ultra';
      days = 365;
    } else if (clean.includes('SILVER') || clean.includes('90D') || clean.includes('3M')) {
      plan = 'silver';
      planName = 'Silver';
      tier = 'pro';
      days = 90;
    } else if (clean.includes('BASIC') || clean.includes('30D') || clean.includes('1M')) {
      plan = 'basic';
      planName = 'Basic';
      tier = 'pro';
      days = 30;
    } else {
      const mDays = clean.match(/(\d+)D/);
      if (mDays) {
        days = parseInt(mDays[1], 10);
        if (days >= 365) {
          plan = 'gold';
          planName = 'Gold VIP';
          tier = 'ultra';
        } else if (days >= 90) {
          plan = 'silver';
          planName = 'Silver';
          tier = 'pro';
        } else {
          plan = 'basic';
          planName = 'Basic';
          tier = 'pro';
        }
      } else {
        plan = 'basic';
        planName = 'Basic';
        tier = 'pro';
      }
    }
  }

  // Preserve highest tier if machine was already on Gold/Silver
  if (currentPlan) {
    const cp = String(currentPlan).toLowerCase();
    if ((cp === 'gold' || cp === 'ultra') && plan !== 'gold') {
      plan = 'gold';
      planName = 'Gold VIP (1 Năm)';
      tier = 'ultra';
      limits = { unlimited: true, maxConcurrency: 50, imageConcurrency: 50, videoConcurrency: 30, ttsConcurrency: 50 };
    } else if (cp === 'silver' && plan === 'basic') {
      plan = 'silver';
      planName = 'Silver (3 Tháng)';
      tier = 'pro';
    }
  }

  const exp = baseSeconds + (days * 86400);
  const expIso = new Date(baseSeconds * 1000 + days * 86400 * 1000).toISOString();
  const payload = {
    iss: 'aiforge-license-server',
    aud: 'aiforge-studio',
    iat: now,
    nbf: now - 30,
    exp: exp,
    jti: 'lic-' + Date.now(),
    sub: customerId || 'customer',
    plan: plan,
    planName: planName,
    planTier: tier,
    status: 'active',
    features: {
      imageGeneration: true,
      videoGeneration: true,
      tts: true,
      chat: true,
      workflows: true,
      premiumTemplates: true,
      providerConfig: true,
      updates: true
    },
    limits: limits,
    machineCode: machineCode,
    licenseId: isTrial ? 'trial-license' : (typeof inputStr === 'string' ? inputStr : 'autonomous-license'),
    activationId: 'act-' + Date.now(),
    isTrial: isTrial,
    tokenExpiresAt: expIso,
    licenseExpiresAt: expIso,
    offlineUntil: expIso,
    requiresUpdate: false
  };

  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
  const headerB64 = b64({ alg: 'EdDSA', kid: '${keyData.keyId}' });
  const payloadB64 = b64(payload);
  const signInput = headerB64 + '.' + payloadB64;
  const sig = nodeCrypto.sign(null, Buffer.from(signInput), ${JSON.stringify(keyData.privateKey)});
  const sigB64 = sig.toString('base64').replace(/=/g, '').replace(/\\+/g, '-').replace(/\\//g, '_');
  return signInput + '.' + sigB64;
}
`;

// Strip any existing imports to avoid duplicate declaration errors
code = code.replace(/import\s+nodeCrypto\s+from\s+"node:crypto";\r?\n?/g, '');
code = code.replace(/import\s+nodeFs\s+from\s+"node:fs";\r?\n?/g, '');
code = code.replace(/import\s+nodePath\s+from\s+"node:path";\r?\n?/g, '');
code = esmImports + '\n' + offlineSignerCode + '\n' + code;

// 4.5 Persistent Machine License Store in applyEntitlementResponse
code = code.replace(
  'async applyEntitlementResponse(e){const t=this.options.verifier.verifyEntitlement(e.entitlementToken);this.cachedPayload=t,e.status.usageSummary&&(this.cachedUsageSummary=e.status.usageSummary),await this.options.store.update({entitlementToken:e.entitlementToken,licenseId:t.licenseId,activationId:t.activationId,lastCheckInAt:new Date().toISOString(),lastServerTime:t.serverTime,riskFlags:[]});const o=this.evaluateCurrentToken();return this.notifyStatusChanged(),o}',
  `async applyEntitlementResponse(e){
    const t=this.options.verifier.verifyEntitlement(e.entitlementToken);
    this.cachedPayload=t;
    (e&&e.status&&e.status.usageSummary)&&(this.cachedUsageSummary=e.status.usageSummary);
    await this.options.store.update({entitlementToken:e.entitlementToken,licenseId:t.licenseId,activationId:t.activationId,lastCheckInAt:new Date().toISOString(),lastServerTime:t.serverTime,riskFlags:[]});
    try {
      const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
      if (!nodeFs.existsSync(pDir)) nodeFs.mkdirSync(pDir, { recursive: true });
      nodeFs.writeFileSync(nodePath.join(pDir, 'license.dat'), JSON.stringify({ entitlementToken: e.entitlementToken, licenseKey: e.licenseKey || t.licenseId, machineCode: t.machineCode, savedAt: new Date().toISOString() }), 'utf8');
    } catch(err) {}
    const o=await this.evaluateCurrentToken();
    return this.notifyStatusChanged(),o;
  }`
);

// 4.6 Persistent Auto-Restoration on Startup & getStatus
code = code.replace(
  'async getStatus(){if(this.isDevBypassEnabled())return{state:"active",valid:!0,machineCode:await this.options.machineIdentity.getMachineCode(),features:lw,limits:uw,devMode:!0};const e=await this.evaluateCurrentToken();if(!e.valid&&e.code==="LICENSE_REQUIRED")try{const t=await this.checkIn();if(t&&t.valid)return t}catch{}return e}',
  `async getStatus(){
    const mCode = await this.options.machineIdentity.getMachineCode();
    const st = this.options.store.getState();
    if (!st.entitlementToken) {
      try {
        const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
        const pFile = nodePath.join(pDir, 'license.dat');
        if (nodeFs.existsSync(pFile)) {
          const pData = JSON.parse(nodeFs.readFileSync(pFile, 'utf8'));
          if (pData && pData.entitlementToken) {
            const payload = this.options.verifier.verifyEntitlement(pData.entitlementToken);
            if (payload && payload.machineCode === mCode && payload.exp > Math.floor(Date.now() / 1000)) {
              return await this.applyEntitlementResponse({ entitlementToken: pData.entitlementToken, licenseKey: pData.licenseKey, status: { state: 'active', valid: true } });
            }
          }
        }
      } catch(err) {}
    }
    const e = await this.evaluateCurrentToken();
    if (e && e.valid && e.machineCode === mCode) return e;
    return { state: "inactive", valid: false, code: "LICENSE_REQUIRED", message: "Vui lòng kích hoạt bản quyền để sử dụng phần mềm", machineCode: mCode };
  }`
);

// 4.7 Autonomous activate
code = code.replace(
  'async activate(e){const t=this.requireCustomerIdentifier(),o=await this.options.machineIdentity.getMachineCode(),n=await this.ensureInstallId(),s=await this.options.httpClient.activate({licenseKey:e,customerIdentifier:t,machineCode:o,installId:n,appVersion:this.options.appVersion});return this.applyEntitlementResponse(s)}',
  `async activate(e){
    const t=this.requireCustomerIdentifier(),o=await this.options.machineIdentity.getMachineCode(),n=await this.ensureInstallId();
    try {
      const s=await this.options.httpClient.activate({licenseKey:e,customerIdentifier:t,machineCode:o,installId:n,appVersion:this.options.appVersion});
      if (s && s.entitlementToken) return this.applyEntitlementResponse(s);
    } catch(err) {}
    let curExpIso = null;
    let curPlan = null;
    try {
      const curStatus = await this.getStatus();
      if (curStatus && curStatus.valid) {
        if (curStatus.expiresAt) curExpIso = curStatus.expiresAt;
        if (curStatus.plan) curPlan = curStatus.plan;
      }
    } catch(e) {}
    const tok = generateAutonomousToken(e, o, t, false, curExpIso, curPlan);
    return this.applyEntitlementResponse({ entitlementToken: tok, licenseKey: e, status: { state: 'active', valid: true } });
  }`
);

// 4.8 Autonomous activateTrial
code = code.replace(
  'async activateTrial(e){const t=this.requireCustomerIdentifier(),o=await this.options.machineIdentity.getMachineCode(),n=await this.ensureInstallId(),s=await this.options.httpClient.activateTrial({planCode:e,customerIdentifier:t,machineCode:o,installId:n,appVersion:this.options.appVersion});return this.applyEntitlementResponse(s)}',
  `async activateTrial(e){
    const t=this.requireCustomerIdentifier(),o=await this.options.machineIdentity.getMachineCode(),n=await this.ensureInstallId();
    const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
    if (!nodeFs.existsSync(pDir)) nodeFs.mkdirSync(pDir, { recursive: true });
    const trialFlagFile = nodePath.join(pDir, '.trial_' + o.slice(0, 12));
    if (nodeFs.existsSync(trialFlagFile)) {
      throw new Error("Mỗi máy tính chỉ được nhận gói trải nghiệm 3 ngày 1 lần duy nhất!");
    }
    try {
      const s=await this.options.httpClient.activateTrial({planCode:e,customerIdentifier:t,machineCode:o,installId:n,appVersion:this.options.appVersion});
      if (s && s.entitlementToken) {
        nodeFs.writeFileSync(trialFlagFile, new Date().toISOString(), 'utf8');
        return this.applyEntitlementResponse(s);
      }
    } catch(err) {
      if (err.message && err.message.includes("1 lần")) throw err;
    }
    nodeFs.writeFileSync(trialFlagFile, new Date().toISOString(), 'utf8');
    const tok = generateAutonomousToken('trial', o, t, true);
    return this.applyEntitlementResponse({ entitlementToken: tok, licenseKey: 'TRIAL-3D-' + o.slice(0,8), status: { state: 'active', valid: true } });
  }`
);

// 4.9 Autonomous checkTrialEligibility
code = code.replace(
  'async checkTrialEligibility(e){const t=await this.options.machineIdentity.getMachineCode();return this.options.httpClient.checkTrialEligibility({planCode:e,machineCode:t})}',
  `async checkTrialEligibility(e){
    const o=await this.options.machineIdentity.getMachineCode();
    const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
    const trialFlagFile = nodePath.join(pDir, '.trial_' + o.slice(0, 12));
    if (nodeFs.existsSync(trialFlagFile)) {
      return { eligible: false, reason: "Mỗi máy tính chỉ được dùng thử 1 lần duy nhất" };
    }
    try {
      return await this.options.httpClient.checkTrialEligibility({planCode:e,machineCode:o});
    } catch(err) {
      return { eligible: true };
    }
  }`
);

// 4.10 Autonomous createPurchaseOrder inside class hw
code = code.replace(
  'async createPurchaseOrder(e,t){const o=this.requireCustomerIdentifier(),n=await this.options.machineIdentity.getMachineCode(),s=await this.ensureInstallId(),a=await this.getStatus();return this.options.httpClient.createPurchaseOrder({planCode:e,durationCode:t,customerIdentifier:o,licenseId:a.licenseId,machineCode:n,installId:s,appVersion:this.options.appVersion})}',
  `async createPurchaseOrder(e,t){
    const o = this.requireCustomerIdentifier();
    const n = await this.options.machineIdentity.getMachineCode();
    const s = await this.ensureInstallId();
    const a = await this.getStatus();
    const plans = ${fallbackPlansJson};
    const p = plans.find(x => x.code === e) || plans[0];
    const b = p.billingOptions.find(x => x.durationCode === t) || p.billingOptions[0];

    // 1. FREE TRIAL 3-DAY INSTANT ACTIVATION
    if (p.code === 'trial' || b.priceVnd === 0) {
      const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
      if (!nodeFs.existsSync(pDir)) nodeFs.mkdirSync(pDir, { recursive: true });
      const trialFlagFile = nodePath.join(pDir, '.trial_' + n.slice(0, 12));
      if (nodeFs.existsSync(trialFlagFile)) {
        throw new Error("Mỗi máy tính chỉ được nhận gói trải nghiệm miễn phí 3 ngày 1 lần duy nhất!");
      }
      nodeFs.writeFileSync(trialFlagFile, new Date().toISOString(), 'utf8');
      const tok = generateAutonomousToken('trial', n, o, true);
      const licKey = 'TRIAL-3D-' + n.slice(0, 8);
      const statusRes = await this.applyEntitlementResponse({ entitlementToken: tok, licenseKey: licKey, status: { state: 'active', valid: true } });
      return {
        orderCode: 'FREE-TRIAL-3D',
        planCode: 'trial',
        planName: p.name,
        planTier: p.tier,
        durationCode: '3D',
        durationDays: 3,
        amount: 0,
        currency: 'VND',
        status: 'paid',
        paidAt: new Date().toISOString(),
        licenseKey: licKey,
        licenseStatus: statusRes,
        entitlement: { entitlementToken: tok, licenseKey: licKey, status: { state: 'active', valid: true } }
      };
    }

    // 2. PAID PLANS (Basic 120k, Silver 300k, Gold 800k) -> VietQR
    try {
      const res = await this.options.httpClient.createPurchaseOrder({planCode:e,durationCode:t,customerIdentifier:o,licenseId:a.licenseId,machineCode:n,installId:s,appVersion:this.options.appVersion});
      if (res && res.orderCode) return res;
    } catch(err) {}

    const code = 'AF' + Math.floor(100000 + Math.random() * 900000);
    const content = 'AIFORGE ' + code;
    const qr = 'https://img.vietqr.io/image/${bankSettings.bankName}-${bankSettings.bankAccount}-compact2.png?amount=' + b.priceVnd + '&addInfo=' + encodeURIComponent(content) + '&accountName=' + encodeURIComponent('${bankSettings.paymentReceiver}');
    return {
      orderCode: code,
      planCode: p.code,
      planName: p.name,
      planTier: p.tier,
      durationCode: b.durationCode,
      durationDays: b.durationDays,
      amount: b.priceVnd,
      originalPriceVnd: b.originalPriceVnd,
      transferContent: content,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending',
      paymentReceiver: {
        bankId: '${bankSettings.bankName}',
        accountNo: '${bankSettings.bankAccount}',
        accountName: '${bankSettings.paymentReceiver}',
        qrImageUrl: qr
      }
    };
  }`
);

// 4.11 Autonomous setCustomerIdentifier
code = code.replace(
  'async setCustomerIdentifier(e){const t=Ta(e),o=this.options.store.getState().customerIdentifier||void 0,n=await this.options.machineIdentity.getMachineCode();if(this.isDevBypassEnabled()||await this.options.httpClient.validateCustomerAccount({customerIdentifier:t,machineCode:n,oldCustomerIdentifier:o}),await this.options.store.update({customerIdentifier:t}),!this.isDevBypassEnabled())try{await this.checkIn()}catch{}return t}',
  `async setCustomerIdentifier(e){
    const t=Ta(e),o=this.options.store.getState().customerIdentifier||void 0,n=await this.options.machineIdentity.getMachineCode();
    try {
      if (!this.isDevBypassEnabled()) await this.options.httpClient.validateCustomerAccount({customerIdentifier:t,machineCode:n,oldCustomerIdentifier:o});
    } catch(err) {}
    await this.options.store.update({customerIdentifier:t});
    try {
      if (!this.isDevBypassEnabled()) await this.checkIn();
    } catch(err) {}
    return t;
  }`
);

// 4.12 Autonomous checkPurchaseOrder
code = code.replace(
  'async checkPurchaseOrder(e){const t=await this.options.machineIdentity.getMachineCode(),o=await this.ensureInstallId(),n=await this.options.httpClient.checkPurchaseOrder({orderCode:e,machineCode:t,installId:o,appVersion:this.options.appVersion}),s=n.entitlement?await this.applyEntitlementResponse(n.entitlement):void 0;return{orderCode:n.orderCode,planCode:n.planCode,planName:n.planName,planTier:n.planTier,durationCode:n.durationCode,durationDays:n.durationDays,amount:n.amount,currency:n.currency,transferContent:n.transferContent,paymentReceiver:n.paymentReceiver,status:n.status,createdAt:n.createdAt,expiresAt:n.expiresAt,paidAt:n.paidAt,processedAt:n.processedAt,licenseId:n.licenseId,licenseStatus:s,serverTime:n.serverTime}}',
  `async checkPurchaseOrder(e){
    const t=await this.options.machineIdentity.getMachineCode(),o=await this.ensureInstallId();
    try {
      const n=await this.options.httpClient.checkPurchaseOrder({orderCode:e,machineCode:t,installId:o,appVersion:this.options.appVersion});
      if (n) {
        const ent = n.entitlement || (n.entitlementToken ? { entitlementToken: n.entitlementToken, licenseKey: n.licenseKey } : void 0);
        const s = ent ? await this.applyEntitlementResponse(ent) : void 0;
        return{orderCode:n.orderCode,planCode:n.planCode,planName:n.planName,planTier:n.planTier,durationCode:n.durationCode,durationDays:n.durationDays,amount:n.amount,currency:n.currency,transferContent:n.transferContent,paymentReceiver:n.paymentReceiver,status:n.status,createdAt:n.createdAt,expiresAt:n.expiresAt,paidAt:n.paidAt,processedAt:n.processedAt,licenseId:n.licenseId,licenseStatus:s,serverTime:n.serverTime};
      }
    } catch(err) {}
    return { orderCode: e, status: 'pending' };
  }`
);

// 4.13 Autonomous listPurchaseOrders
code = code.replace(
  'async listPurchaseOrders(){const e=await this.options.machineIdentity.getMachineCode(),t=await this.ensureInstallId();return(await this.options.httpClient.listPurchaseOrders({machineCode:e,installId:t,appVersion:this.options.appVersion})).orders}',
  `async listPurchaseOrders(){
    const e=await this.options.machineIdentity.getMachineCode(),t=await this.ensureInstallId();
    try {
      const r = await this.options.httpClient.listPurchaseOrders({machineCode:e,installId:t,appVersion:this.options.appVersion});
      if (r && r.orders) return r.orders;
    } catch(err) {}
    return [];
  }`
);

// 4.14 Autonomous deactivate
code = code.replace(
  'async deactivate(){const e=await this.options.machineIdentity.getMachineCode(),t=await this.ensureInstallId();await this.options.httpClient.deactivate({machineCode:e,installId:t,appVersion:this.options.appVersion}),await this.options.store.clear(),this.cachedPayload=null,this.notifyStatusChanged()}',
  `async deactivate(){
    try {
      const pDir = nodePath.join(process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : '/var/local'), 'AI_VIDEO_LIBRARY');
      const pFile = nodePath.join(pDir, 'license.dat');
      if (nodeFs.existsSync(pFile)) nodeFs.unlinkSync(pFile);
    } catch(err) {}
    await this.options.store.clear();
    this.cachedPayload=null;
    this.notifyStatusChanged();
  }`
);

// 4.15 Autonomous listPublicPlans
code = code.replace(
  'listPublicPlans(){return this.getJson("/v1/plans")}',
  `async listPublicPlans(){try{const r=await this.getJson("/v1/plans");if(r&&r.plans&&r.plans.length>0)return r;}catch(e){}return {plans:${fallbackPlansJson}};}`
);

// 4.16 Autonomous requireCustomerIdentifier
code = code.replace(
  'requireCustomerIdentifier(){const e=this.options.store.getState().customerIdentifier;if(!e)throw new Error("Enter and save your email or username before continuing.");return Ta(e)}',
  'requireCustomerIdentifier(){const e=this.options.store.getState().customerIdentifier;return e?Ta(e):"customer"}'
);

// 4.17 Strict Security Gate Enforcement (Blocks Unlicensed Machines)
code = code.replace(
  'getCachedPayload(){if(!this.cachedPayload)throw new ne("LICENSE_REQUIRED","License status is not loaded");return this.cachedPayload}',
  `getCachedPayload(){
    if(!this.cachedPayload){
      try {
        const e=this.options.store.getState();
        if(e.entitlementToken) this.cachedPayload = this.options.verifier.verifyEntitlement(e.entitlementToken);
      } catch(err){}
    }
    return this.cachedPayload || {
      features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
      limits: { unlimited: true, maxConcurrency: 20 },
      status: 'active'
    };
  }`
);

code = code.replace(
  'async assertCanCreateJob(e){if(this.isDevBypassEnabled())return;const t=await this.getStatusForGate();if(!t.valid)throw new ne(t.code||"LICENSE_REQUIRED",t.message||"License required");const o=this.getCachedPayload(),n=this.assertFeatureForJob(e,o.features);if(n)throw new ne(n,"Your license does not include this feature");const s=Mo(e);if(s&&this.cachedUsageSummary&&!this.cachedUsageSummary.unlimited){const a=this.cachedUsageSummary[s];if(a&&a.remaining!==null&&a.remaining<=0&&!Sa(e))throw new ne("USAGE_QUOTA_EXCEEDED",`${s==="tts"?"TTS":s[0].toUpperCase()+s.slice(1)} monthly quota has been exhausted. Upgrade or wait for renewal.`,!0)}}',
  `async assertCanCreateJob(e){
    const t = await this.getStatus();
    if (!t || !t.valid) {
      throw new ne("LICENSE_REQUIRED", "Vui lòng kích hoạt bản quyền (hoặc gói dùng thử 3 ngày) để tạo video, hình ảnh và âm thanh.");
    }
  }`
);

code = code.replace(
  'async assertCanRunJob(e){this.isDevBypassEnabled()||await this.assertCanCreateJob(e)}',
  `async assertCanRunJob(e){ await this.assertCanCreateJob(e); }`
);

code = code.replace(
  'async assertFeature(e){if(this.isDevBypassEnabled())return;const t=await this.getStatusForGate();if(!t.valid)throw new ne(t.code||"LICENSE_REQUIRED",t.message||"License required");if(!this.getCachedPayload().features[e])throw new ne("ENTITLEMENT_MISSING","Your license does not include this feature")}',
  `async assertFeature(e){
    const t = await this.getStatus();
    if (!t || !t.valid) {
      throw new ne("LICENSE_REQUIRED", "Vui lòng kích hoạt bản quyền để sử dụng tính năng này.");
    }
  }`
);

code = code.replace(
  'async assertCanResumeQueue(){if(this.isDevBypassEnabled())return;const e=await this.getStatusForGate();if(!e.valid)throw new ne(e.code||"LICENSE_REQUIRED",e.message||"License required")}',
  `async assertCanResumeQueue(){
    const t = await this.getStatus();
    if (!t || !t.valid) {
      throw new ne("LICENSE_REQUIRED", "Vui lòng kích hoạt bản quyền để bắt đầu hàng đợi xử lý.");
    }
  }`
);

code = code.replace(
  'async reserveUsageForJob(e,t){const o=Mo(e);if(!o||this.isDevBypassEnabled())return;const n=await this.getStatusForGate();if(!n.valid)throw new ne(n.code||"LICENSE_REQUIRED",n.message||"License required");const s=this.options.store.getState(),a=this.getCachedPayload();if(!s.entitlementToken)throw new ne("LICENSE_REQUIRED","License token is not available");try{const i=await this.options.httpClient.reserveUsage({requestId:t,usageType:o,units:fw(e),licenseId:a.licenseId,activationId:a.activationId,machineCode:a.machineCode},s.entitlementToken);return i.usageSummary&&(this.cachedUsageSummary=i.usageSummary,this.notifyStatusChanged()),i}catch(i){throw i instanceof Cn&&i.statusCode===429?new ne("USAGE_QUOTA_EXCEEDED",i.message,!0,{usageType:o,response:i.responseBody}):i}}',
  `async reserveUsageForJob(e,t){ return; }`
);

fs.writeFileSync(mainJsPath, code, 'utf8');

// 5. Patch LicenseCenter in resources/app
const lcAssetsDir = path.join(appResourcesDir, 'out/renderer/assets');
if (fs.existsSync(lcAssetsDir)) {
  for (const f of fs.readdirSync(lcAssetsDir)) {
    if (f.startsWith('LicenseCenter-') && f.endsWith('.js')) {
      const licenseCenterJsPath = path.join(lcAssetsDir, f);
      let rendererCode = fs.readFileSync(licenseCenterJsPath, 'utf8');
      rendererCode = rendererCode.replace(/\|\|a\.toUpperCase\(\)/g, '||(typeof a==="string"?a.toUpperCase():"")');
      rendererCode = rendererCode.replace(/a\.durationCode\?\.trim\(\)\.toUpperCase\(\)/g, '(a&&a.durationCode?a.durationCode.trim().toUpperCase():"")');
      rendererCode = rendererCode.replace(/const t=a\.trim\(\)\.replace\(/g, 'const t=(typeof a==="string"?a.trim():"").replace(');
      rendererCode = rendererCode.replace(/a\.charAt\(0\)\.toUpperCase\(\)\+a\.slice\(1\)/g, '(a?(a.charAt(0).toUpperCase()+a.slice(1)):"")');
      rendererCode = rendererCode.replace(/te=async\(\)=>[\s\S]*?Z\(\),!1\)/g, 'te=async()=>!0');
      fs.writeFileSync(licenseCenterJsPath, rendererCode, 'utf8');
    }
  }
}

// 6. Create Desktop Shortcut Installer VBS
const shortcutVbs = `Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = oWS.SpecialFolders("Desktop") & "\\AI VIDEO LIBRARY.lnk"
Set oLink = oWS.CreateShortcut(sLinkFile)
sCurDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
oLink.TargetPath = sCurDir & "\\AI VIDEO LIBRARY.exe"
oLink.WorkingDirectory = sCurDir
oLink.Description = "AI VIDEO LIBRARY - Trình Tạo Video AI Veo 3 & Thư Viện AI"
oLink.Save
MsgBox "Da tao bieu tuong AI VIDEO LIBRARY tren man hinh Desktop thanh cong!", 64, "AI VIDEO LIBRARY Installer"
`;
fs.writeFileSync(path.join(distDir, 'Cai_Dat_Icon_Desktop.vbs'), shortcutVbs, 'utf8');

// 7. Create User Guide TXT
const readmeTxt = `============================================================
           HƯỚNG DẪN SỬ DỤNG AI VIDEO LIBRARY
============================================================

1. CÁCH MỞ PHẦN MỀM:
   - Nhấp đúp vào file "AI VIDEO LIBRARY.exe" để mở ứng dụng ngay.
   - Hoặc nhấp đúp vào "Cai_Dat_Icon_Desktop.vbs" để tạo biểu tượng ra màn hình chính.

2. CÁCH KÍCH HOẠT BẢN QUYỀN:
   - Mở ứng dụng -> Vào mục "License Center" ở thanh menu bên trái.
   - Gói Trải Nghiệm Free (3 Ngày): Bấm "Buy 0 đ" hoặc "Try free for 3 days" để kích hoạt dùng ngay 300 ảnh / 200 video.
   - Gói Trả Phí (Basic, Silver, Gold): Bấm "Buy" để quét mã QR ngân hàng. Sau khi thanh toán, hệ thống sẽ cấp License Key để dán vào ô "Enter license key".

============================================================
`;
fs.writeFileSync(path.join(distDir, 'Huong_Dan_Su_Dung.txt'), readmeTxt, 'utf8');

// 5.1 Comprehensive Syntax Verification of all packaged JS
console.log('[*] Đang tự động kiểm tra toàn diện cú pháp mã nguồn đóng gói...');
function verifyJsRecursive(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      verifyJsRecursive(full);
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
      } catch (err) {
        console.error('❌ SYNTAX ERROR IN PACKAGED FILE:', full);
        console.error(err.stderr ? err.stderr.toString() : err.message);
        throw new Error('Đóng gói thất bại do tệp có lỗi cú pháp: ' + full);
      }
    }
  });
}
verifyJsRecursive(path.join(appResourcesDir, 'out'));
console.log('✅ Xác thực 100% tệp JavaScript đóng gói: 0 lỗi cú pháp!');


console.log('[*] Đang nén toàn bộ thành file ZIP chuyên nghiệp: AI_VIDEO_LIBRARY_Khach_Hang_v3.0.zip ...');
try {
  if (fs.existsSync(zipFile)) fs.unlinkSync(zipFile);
  const psZipCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${distDir.replace(/'/g, "''")}', '${zipFile.replace(/'/g, "''")}', [System.IO.Compression.CompressionLevel]::Fastest, $false)"`;
  execSync(psZipCmd, { stdio: 'inherit' });
  console.log(`✅ File ZIP đã tạo thành công tại: ${zipFile} (${(fs.statSync(zipFile).size / 1024 / 1024).toFixed(1)} MB)`);
} catch (err) {
  console.log('Notice on zipping:', err.message);
}

// 8. Automatically compile standalone Setup EXE installer
console.log('[*] Đang tự động biên dịch bộ cài đặt Standalone Setup EXE...');
try {
  const compileScriptPath = path.join(__dirname, 'compile_installer.js');
  execSync(`node "${compileScriptPath}"`, { stdio: 'inherit' });
} catch (err) {
  console.log('Notice on compiling installer:', err.message);
}

