const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getOrCreateKeyPair } = require('../license_server/cryptoUtils');

const keyData = getOrCreateKeyPair();
const pDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY');
const pFile = path.join(pDir, 'license.dat');

const now = Math.floor(Date.now() / 1000);
const exp = now + 365 * 86400;
const expIso = new Date(exp * 1000).toISOString();
const mCode = 'd71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145';
const goldKeyStr = 'AIFORGE-GOLD-365D-617BD6DB-ABC8BF07';

const payload = {
  iss: 'aiforge-license-server',
  aud: 'aiforge-studio',
  iat: now,
  nbf: now - 30,
  exp: exp,
  jti: 'lic-' + Date.now(),
  sub: 'phan.hongha',
  plan: 'gold',
  planName: 'Gold VIP (1 Năm)',
  planTier: 'ultra',
  status: 'active',
  features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
  limits: { unlimited: true, maxConcurrency: 50, imageConcurrency: 50, videoConcurrency: 30, ttsConcurrency: 50 },
  machineCode: mCode,
  licenseId: goldKeyStr,
  activationId: 'ACT-' + Date.now(),
  isTrial: false,
  tokenExpiresAt: expIso,
  licenseExpiresAt: expIso,
  offlineUntil: expIso,
  requiresUpdate: false
};

const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const headerB64 = b64({ alg: 'EdDSA', kid: keyData.keyId });
const payloadB64 = b64(payload);
const signInput = headerB64 + '.' + payloadB64;
const sig = crypto.sign(null, Buffer.from(signInput), keyData.privateKey);
const sigB64 = sig.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const tokenStr = signInput + '.' + sigB64;

fs.writeFileSync(pFile, JSON.stringify({
  entitlementToken: tokenStr,
  licenseKey: goldKeyStr,
  machineCode: mCode,
  savedAt: new Date().toISOString()
}, null, 2), 'utf8');

console.log('Successfully written Gold VIP license to', pFile);
console.log('Plan:', payload.plan);
console.log('Plan Name:', payload.planName);
console.log('Expires At:', expIso);
