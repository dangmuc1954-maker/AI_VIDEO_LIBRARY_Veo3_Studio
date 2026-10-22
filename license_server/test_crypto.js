const { getOrCreateKeyPair, signEntitlementToken, generateLicenseKey } = require('./cryptoUtils');
const crypto = require('crypto');

console.log('--- TESTING ED25519 TOKEN GENERATION & VERIFICATION ---');

const keys = getOrCreateKeyPair();
console.log('Public Key:\n', keys.publicKey);

const samplePayload = {
  exp: Math.floor(Date.now() / 1e3) + 30 * 86400, // 30 days
  plan: 'pro-monthly',
  planName: 'AIForge Studio Pro 30 Days',
  planTier: 'pro',
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
    maxConcurrency: 20
  },
  licenseId: 'LIC-' + Date.now(),
  activationId: 'ACT-' + Date.now(),
  machineCode: 'TEST-MACHINE-HWID-12345',
  tokenExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  licenseExpiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  offlineUntil: new Date(Date.now() + 7 * 86400000).toISOString(),
  requiresUpdate: false
};

const token = signEntitlementToken(samplePayload, keys.privateKey, keys.keyId);
console.log('\nSigned JWS Compact Token:\n', token);

// Verify with native crypto Ed25519
const [headerB64, payloadB64, sigB64] = token.split('.');
const signingInput = `${headerB64}.${payloadB64}`;
const sigBuf = Buffer.from(sigB64.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((sigB64.length + 3) % 4), 'base64');
const isValid = crypto.verify(null, Buffer.from(signingInput, 'utf8'), keys.publicKey, sigBuf);

console.log('\nToken Verification Result:', isValid ? 'SUCCESS [VALID SIGNATURE]' : 'FAILED [INVALID SIGNATURE]');

const sampleKey = generateLicenseKey('ENTERPRISE', 90);
console.log('Sample Generated License Key:', sampleKey);
