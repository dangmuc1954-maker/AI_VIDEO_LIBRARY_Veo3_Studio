const fs = require('fs');
const path = require('path');
const { getOrCreateKeyPair, signEntitlementToken } = require('../license_server/cryptoUtils');

const dirs = ['AI_VIDEO_LIBRARY_DATA', 'AI VIDEO LIBRARY', 'ai-video-library', 'aiforge-studio', 'veo3-studio-pro'];

for (const d of dirs) {
  for (const f of ['license-state.production.json', 'license-state.development.json', 'license-state.json']) {
    const p = path.join(process.env.APPDATA, d, f);
    if (fs.existsSync(p)) {
      try {
        const licData = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (licData.entitlementToken) {
          const keyData = getOrCreateKeyPair();
          const tokenParts = licData.entitlementToken.split('.');
          if (tokenParts.length >= 2) {
            const payloadBuf = Buffer.from(tokenParts[1], 'base64');
            const payload = JSON.parse(payloadBuf.toString('utf8'));
            
            payload.capabilities = [
              "upscale_image",
              "upscale_video",
              "remove_watermark_image",
              "remove_watermark_video"
            ];
            payload.plan = "vip";
            payload.planName = "VIP Vĩnh Viễn";
            payload.planTier = "ultra";
            payload.status = "active";
            payload.limits = {
              unlimited: true,
              maxConcurrency: 50
            };

            const newToken = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);
            licData.entitlementToken = newToken;
            fs.writeFileSync(p, JSON.stringify(licData, null, 2), 'utf8');
            console.log(`✅ Upgraded license token with full capabilities in: ${d}/${f}`);
          }
        }
      } catch (e) {
        console.warn(`Could not update ${p}:`, e.message);
      }
    }
  }
}
