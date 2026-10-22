const fs = require('fs');
const path = require('path');
const { getOrCreateKeyPair, signEntitlementToken } = require('../license_server/cryptoUtils');
const db = require('../license_server/db');

const installedAppDir = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app';
const mainJsPath = path.join(installedAppDir, 'out/main/index.js');
const rendererJsPath = path.join(installedAppDir, 'out/renderer/assets/LicenseCenter-D-RJQ6lX.js');

console.log('--- PATCHING INSTALLED APP AT:', installedAppDir);

if (fs.existsSync(mainJsPath)) {
  let code = fs.readFileSync(mainJsPath, 'utf8');

  // 1. Point xw() to http://127.0.0.1:8787
  code = code.replace(
    /function\s+xw\(\)\{[^}]*\}/g,
    'function xw(){return (process.env.AFS_BACKEND_URL || "http://127.0.0.1:8787").replace(/\\/+$/, "");}'
  );

  // 2. Fix generateAutonomousToken plan names in installed app
  code = code.replace(/planName\s*=\s*'Basic\s*\(1\s*Tháng\)'/g, "planName = 'Basic'");
  code = code.replace(/planName\s*=\s*'Silver\s*\(3\s*Tháng\)'/g, "planName = 'Silver'");
  code = code.replace(/planName\s*=\s*'Gold\s*VIP\s*\(1\s*Năm\)'/g, "planName = 'Gold VIP'");
  code = code.replace(/planName\s*=\s*'Trải\s*Nghiệm\s*Free\s*\(3\s*Ngày\)'/g, "planName = 'Trải Nghiệm Free'");

  fs.writeFileSync(mainJsPath, code, 'utf8');
  console.log('✅ Updated installed app main/index.js successfully!');
} else {
  console.log('Installed mainJsPath not found:', mainJsPath);
}

// 3. Update active license.dat in AppData/Roaming to match Tris's machine
const appDataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY');
const licenseDatPath = path.join(appDataDir, 'license.dat');
const keyData = getOrCreateKeyPair();

// Tris's machine HWID
const hwid = 'd71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145';
const now = new Date();
const expDate = new Date(now.getTime() + 365 * 86400000).toISOString();
const expTimestamp = Math.floor(new Date(expDate).getTime() / 1e3);

const goldKey = 'AIFORGE-GOLD-365D-B3BBFA28-64DB60AF';

const payload = {
  iss: 'aiforge-license-server',
  aud: 'aiforge-studio',
  iat: Math.floor(Date.now() / 1e3),
  nbf: Math.floor(Date.now() / 1e3) - 30,
  status: 'active',
  exp: expTimestamp,
  plan: 'gold',
  planName: 'Gold VIP',
  planTier: 'ultra',
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
  limits: {
    unlimited: true,
    maxConcurrency: 50
  },
  licenseId: goldKey,
  activationId: `ACT-${Date.now()}`,
  machineCode: hwid,
  tokenExpiresAt: expDate,
  licenseExpiresAt: expDate,
  offlineUntil: expDate,
  requiresUpdate: false
};

const tokenStr = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);

if (!fs.existsSync(appDataDir)) fs.mkdirSync(appDataDir, { recursive: true });
fs.writeFileSync(licenseDatPath, JSON.stringify({
  entitlementToken: tokenStr,
  licenseKey: goldKey,
  machineCode: hwid,
  savedAt: new Date().toISOString()
}, null, 2), 'utf8');

console.log('✅ Updated AppData/Roaming/AI_VIDEO_LIBRARY/license.dat to Gold VIP (365 days)!');

// Also save key and machine to license_server database.json
db.addKey({
  id: 'LIC-' + Date.now(),
  key: goldKey,
  planCode: 'gold',
  planName: 'Gold VIP',
  planTier: 'ultra',
  durationDays: 365,
  maxDevices: 1,
  features: payload.features,
  limits: payload.limits,
  status: 'active',
  createdAt: now.toISOString(),
  activatedAt: now.toISOString(),
  expiresAt: expDate,
  customerEmail: 'phan.hongha@example.com',
  machineCodes: [hwid],
  notes: 'Kích hoạt Gold VIP cho máy quản trị'
});

db.upsertMachine({
  machineCode: hwid,
  customerIdentifier: 'phan.hongha@example.com',
  licenseKey: goldKey,
  activeKeys: [goldKey],
  planCode: 'gold',
  planName: 'Gold VIP',
  planTier: 'ultra',
  highestPlanCode: 'gold',
  highestPlanName: 'Gold VIP',
  highestPlanTier: 'ultra',
  status: 'active',
  expiresAt: expDate,
  ip: '127.0.0.1',
  appVersion: '1.0.0',
  notes: 'Đang hoạt động trên máy chính'
});

console.log('✅ Updated license_server database.json with Gold VIP machine and key!');
