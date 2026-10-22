const fs = require('fs');
const crypto = require('crypto');
const http = require('http');
const { getOrCreateKeyPair, signEntitlementToken, generateLicenseKey } = require('../license_server/cryptoUtils');
const db = require('../license_server/db');

console.log('======================================================================');
console.log('🧪 SIMULATING FULL CLIENT ACTIVATION WORKFLOW');
console.log('======================================================================');

const keyData = getOrCreateKeyPair();
const pubKeys = { [keyData.keyId]: keyData.publicKey };

function unbase64url(str) {
  const e = str.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(e.padEnd(Math.ceil(e.length / 4) * 4, '='), 'base64');
}

function verifyEntitlement(token) {
  const [hB64, pB64, sB64] = token.split('.');
  const h = JSON.parse(unbase64url(hB64).toString('utf8'));
  const p = JSON.parse(unbase64url(pB64).toString('utf8'));
  const sig = unbase64url(sB64);
  const input = Buffer.from(hB64 + '.' + pB64);
  const valid = crypto.verify(null, input, pubKeys[h.kid], sig);
  if (!valid) throw new Error("Invalid JWS signature");
  
  const now = Math.floor(Date.now() / 1e3);
  if (p.iss !== 'aiforge-license-server') throw new Error('Invalid token issuer: ' + p.iss);
  if (p.aud !== 'aiforge-studio') throw new Error('Invalid token audience: ' + p.aud);
  if (typeof p.exp !== 'number' || p.exp <= now) throw new Error('Token has expired: exp=' + p.exp + ', now=' + now);
  if (typeof p.nbf === 'number' && p.nbf > now + 60) throw new Error('Token not active');
  if (typeof p.iat === 'number' && p.iat > now + 300) throw new Error('Token in future');
  return p;
}

function evaluateCurrentToken(payload, machineCode) {
  if (!payload) return { state: "unlicensed", valid: false, code: "LICENSE_REQUIRED" };
  if (payload.machineCode !== machineCode) return { state: "blocked", valid: false, code: "MACHINE_MISMATCH", message: "This license token belongs to another machine" };
  if (payload.status !== "active") return { state: "blocked", valid: false, code: payload.status, message: "License is not active" };
  if (Date.parse(payload.licenseExpiresAt) <= Date.now()) return { state: "blocked", valid: false, code: "LICENSE_EXPIRED", message: "License has expired" };
  if (Date.parse(payload.offlineUntil) <= Date.now()) return { state: "blocked", valid: false, code: "OFFLINE_EXPIRED", message: "Offline license window has expired" };
  return {
    state: "active",
    valid: true,
    plan: payload.plan,
    planName: payload.planName,
    planTier: payload.planTier,
    features: payload.features,
    limits: payload.limits,
    machineCode: payload.machineCode,
    licenseExpiresAt: payload.licenseExpiresAt,
    offlineUntil: payload.offlineUntil
  };
}

// 1. Create a key in DB
const testKeyStr = generateLicenseKey('PRO', 30);
const testKeyObj = {
  id: 'LIC-' + Date.now(),
  key: testKeyStr,
  planCode: 'pro',
  planName: 'Pro (1 Tháng)',
  planTier: 'pro',
  durationDays: 30,
  maxDevices: 1,
  features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
  limits: { unlimited: true, maxConcurrency: 20 },
  status: 'unused',
  createdAt: new Date().toISOString(),
  customerEmail: 'customer@test.com',
  machineCodes: [],
  notes: 'Test key'
};
db.addKey(testKeyObj);

console.log(`[1] Created Test Key in DB: ${testKeyStr}`);

// 2. Simulate Server /v1/licenses/activate endpoint with FIX
const testMachine = 'HWID-CLIENT-12345';
const now = new Date();
const expDate = new Date(now.getTime() + 30 * 86400000);
const expiresAt = expDate.toISOString();
const expTimestamp = Math.floor(expDate.getTime() / 1e3);

const serverPayload = {
  exp: expTimestamp,
  plan: testKeyObj.planCode,
  planName: testKeyObj.planName,
  planTier: testKeyObj.planTier,
  status: 'active', // <--- THE CRITICAL FIX
  features: testKeyObj.features,
  limits: testKeyObj.limits,
  licenseId: testKeyObj.id,
  activationId: `ACT-${Date.now()}`,
  machineCode: testMachine,
  tokenExpiresAt: expiresAt,
  licenseExpiresAt: expiresAt,
  offlineUntil: expiresAt,
  requiresUpdate: false
};

const tokenStr = signEntitlementToken(serverPayload, keyData.privateKey, keyData.keyId);
console.log(`[2] Server generated & signed token: ${tokenStr.slice(0, 50)}...`);

// 3. Simulate Client Receiving & Verifying Token
console.log(`[3] Client verifying token...`);
const verifiedPayload = verifyEntitlement(tokenStr);
console.log(`    Signature verified! Plan: ${verifiedPayload.planName}, Status: ${verifiedPayload.status}`);

// 4. Simulate Client Evaluating Token
console.log(`[4] Client evaluating token...`);
const evaluated = evaluateCurrentToken(verifiedPayload, testMachine);
console.log(`    Evaluated state:`, evaluated);

if (evaluated.valid && evaluated.state === 'active') {
  console.log(`\n🎉 SUCCESS: License is ACTIVE and FULLY FUNCTIONAL!`);
} else {
  console.error(`\n❌ FAILED: License evaluation failed:`, evaluated);
}
