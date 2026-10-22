const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_FILE = path.join(__dirname, 'data', 'keys.json');

// Base64URL helpers
function base64url(buf) {
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlJson(obj) {
  return base64url(Buffer.from(JSON.stringify(obj), 'utf8'));
}

// 1. Initialize or load Ed25519 Keypair
function getOrCreateKeyPair() {
  if (fs.existsSync(KEYS_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
      if (saved.publicKey && saved.privateKey && saved.keyId) {
        return saved;
      }
    } catch (e) {
      console.error('Error loading existing keys, regenerating...', e);
    }
  }

  const keyId = '2026-q3';
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const keyData = {
    keyId,
    publicKey,
    privateKey,
    createdAt: new Date().toISOString()
  };

  fs.mkdirSync(path.dirname(KEYS_FILE), { recursive: true });
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keyData, null, 2), 'utf8');
  console.log('[*] Generated new Ed25519 License Signing Keypair (Key ID: ' + keyId + ')');
  return keyData;
}

// 2. Sign compact JWS Entitlement Token
function signEntitlementToken(payload, privateKeyPem, keyId = '2026-q3') {
  const now = Math.floor(Date.now() / 1e3);
  
  // JWS Header
  const header = {
    alg: 'EdDSA',
    kid: keyId
  };

  // Ensure mandatory JWT claims
  const fullPayload = {
    iss: 'aiforge-license-server',
    aud: payload.aud || 'aiforge-studio',
    iat: now,
    nbf: now - 30, // 30s buffer for clock differences
    status: 'active',
    ...payload
  };

  const headerB64 = base64urlJson(header);
  const payloadB64 = base64urlJson(fullPayload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Sign with Ed25519 private key
  const signature = crypto.sign(null, Buffer.from(signingInput, 'utf8'), privateKeyPem);
  const signatureB64 = base64url(signature);

  return `${signingInput}.${signatureB64}`;
}

// 3. Generate License Key String
function generateLicenseKey(planCode = 'PRO', durationDays = 30) {
  const randomChars = () => crypto.randomBytes(4).toString('hex').toUpperCase();
  const prefix = `AIFORGE-${planCode.toUpperCase()}`;
  return `${prefix}-${durationDays}D-${randomChars()}-${randomChars()}`;
}

module.exports = {
  getOrCreateKeyPair,
  signEntitlementToken,
  generateLicenseKey,
  base64url
};
