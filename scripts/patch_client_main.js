const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '../app/out/main/index.js'),
  path.join(__dirname, '../extracted_original/out/main/index.js'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js')
];

// Helper: update main/index.js
targetFiles.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  let code = fs.readFileSync(fp, 'utf8');

  // 1. Smart Stacking in generateAutonomousToken:
  // If machine already has active expiration, add new duration onto the remaining expiration
  code = code.replace(
    /const now = Math\.floor\(Date\.now\(\) \/ 1e3\);[\s\S]*?let days = 30;/,
    `const now = Math.floor(Date.now() / 1e3);
  let baseSeconds = now;
  if (currentExpiresIso) {
    const curExp = Math.floor(new Date(currentExpiresIso).getTime() / 1e3);
    if (curExp > now) {
      baseSeconds = curExp;
    }
  }
  let days = 30;`
  );

  // 2. Add periodic heartbeat check-in interval to CommercialLicenseManager
  if (!code.includes('__heartbeatTimer')) {
    code = code.replace(
      'this.cachedUsageSummary=void 0',
      'this.cachedUsageSummary=void 0; if (!this.__heartbeatTimer) { this.__heartbeatTimer = setInterval(() => { try { this.checkIn(); } catch(e){} }, 30000); }'
    );
  }

  // 3. Ensure checkIn sends licenseId and licenseKey cleanly
  code = code.replace(
    'licenseId:e.licenseId,activationId:e.activationId,machineCode:t,installId:await this.ensureInstallId()',
    'licenseId:e.licenseId,licenseKey:e.licenseId,activationId:e.activationId,machineCode:t,installId:await this.ensureInstallId()'
  );

  fs.writeFileSync(fp, code, 'utf8');
  console.log('✅ Patched main/index.js for:', fp);
});
