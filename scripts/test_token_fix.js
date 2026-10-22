const fs = require('fs');
const crypto = require('crypto');
const { getOrCreateKeyPair, signEntitlementToken } = require('../license_server/cryptoUtils');

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
  console.log('Signature valid:', valid);
  
  const now = Math.floor(Date.now() / 1e3);
  if (p.iss !== 'aiforge-license-server') throw new Error('Invalid token issuer: ' + p.iss);
  if (p.aud !== 'aiforge-studio') throw new Error('Invalid token audience: ' + p.aud);
  if (typeof p.exp !== 'number' || p.exp <= now) throw new Error('Token has expired: exp=' + p.exp + ', now=' + now);
  if (typeof p.nbf === 'number' && p.nbf > now + 60) throw new Error('Token not active');
  if (typeof p.iat === 'number' && p.iat > now + 300) throw new Error('Token in future');
  return p;
}

// 1. Test server.js token without status
const now = new Date();
const expiresAt = new Date(now.getTime() + 30 * 86400000).toISOString();
const expTimestamp = Math.floor(new Date(expiresAt).getTime() / 1e3);

const serverPayloadWithoutStatus = {
  exp: expTimestamp,
  plan: 'pro',
  planName: 'Pro',
  planTier: 'pro',
  features: { imageGeneration: true },
  limits: { unlimited: true },
  licenseId: 'LIC-123',
  activationId: 'ACT-123',
  machineCode: 'HWID-TEST',
  tokenExpiresAt: expiresAt,
  licenseExpiresAt: expiresAt,
  offlineUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
  requiresUpdate: false
};

const token1 = signEntitlementToken(serverPayloadWithoutStatus, keyData.privateKey, keyData.keyId);
console.log('\n--- 1. TESTING CURRENT SERVER TOKEN ---');
try {
  const p = verifyEntitlement(token1);
  console.log('Decoded payload:', p);
  console.log('p.status is:', p.status);
  if (p.status !== 'active') {
    console.log('❌ CRITICAL BUG CONFIRMED: p.status is undefined, so evaluateCurrentToken() will BLOCK this license as invalid/blocked!');
  }
} catch (e) {
  console.error('Error:', e.message);
}

// 2. Test server.js token WITH status: 'active'
const serverPayloadWithStatus = {
  ...serverPayloadWithoutStatus,
  status: 'active'
};
const token2 = signEntitlementToken(serverPayloadWithStatus, keyData.privateKey, keyData.keyId);
console.log('\n--- 2. TESTING FIXED SERVER TOKEN ---');
try {
  const p = verifyEntitlement(token2);
  console.log('p.status is:', p.status);
  if (p.status === 'active') {
    console.log('✅ FIXED: License will be accepted as active by evaluateCurrentToken()!');
  }
} catch (e) {
  console.error('Error:', e.message);
}
