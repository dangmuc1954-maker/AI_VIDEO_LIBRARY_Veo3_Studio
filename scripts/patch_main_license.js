const fs = require('fs');
const path = require('path');

const mainJsPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(mainJsPath, 'utf8');

// 1. Fix getStatus(): Only call checkIn() if store already has entitlementToken or licenseId
const oldGetStatus = 'async getStatus(){if(this.isDevBypassEnabled())return{state:"active",valid:!0,machineCode:await this.options.machineIdentity.getMachineCode(),features:lw,limits:uw,devMode:!0};const e=await this.evaluateCurrentToken();if(!e.valid&&e.code==="LICENSE_REQUIRED")try{const t=await this.checkIn();if(t&&t.valid)return t}catch{}return e}';

const newGetStatus = 'async getStatus(){if(this.isDevBypassEnabled())return{state:"active",valid:!0,machineCode:await this.options.machineIdentity.getMachineCode(),features:lw,limits:uw,devMode:!0};const e=await this.evaluateCurrentToken();const st=this.options.store.getState();if(!e.valid&&e.code==="LICENSE_REQUIRED"&&(st.entitlementToken||st.licenseId))try{const t=await this.checkIn();if(t&&t.valid)return t}catch{}return e}';

if (!code.includes(oldGetStatus)) {
  console.error('❌ Could not find oldGetStatus in main/index.js');
  process.exit(1);
}
code = code.replace(oldGetStatus, newGetStatus);
console.log('✓ Replaced getStatus()');

// 2. Fix performCheckIn(): Do not check-in if there is no token or key
const oldPerformCheckIn = 'async performCheckIn(){const e=this.options.store.getState(),t=await this.options.machineIdentity.getMachineCode();try{const o=await this.options.httpClient.checkIn({licenseId:e.licenseId,licenseKey:e.licenseId,activationId:e.activationId,machineCode:t,installId:await this.ensureInstallId(),appVersion:this.options.appVersion,customerIdentifier:e.customerIdentifier,currentTokenJti:this.cachedPayload?.jti,riskFlags:e.riskFlags});return this.applyEntitlementResponse(o)}catch(o){if(!mw(o))throw o;return this.invalidateStoredEntitlement(o)}}';

const newPerformCheckIn = 'async performCheckIn(){const e=this.options.store.getState(),t=await this.options.machineIdentity.getMachineCode();if(!e.entitlementToken&&!e.licenseId)return{state:"unlicensed",valid:!1,code:"LICENSE_REQUIRED",message:"Vui lòng kích hoạt bản quyền AI VIDEO LIBRARY để sử dụng",machineCode:t};try{const o=await this.options.httpClient.checkIn({licenseId:e.licenseId,licenseKey:e.licenseId,activationId:e.activationId,machineCode:t,installId:await this.ensureInstallId(),appVersion:this.options.appVersion,customerIdentifier:e.customerIdentifier,currentTokenJti:this.cachedPayload?.jti,riskFlags:e.riskFlags});if(!o||!o.valid||!o.entitlementToken)return{state:"unlicensed",valid:!1,code:"LICENSE_REQUIRED",message:"Vui lòng kích hoạt bản quyền AI VIDEO LIBRARY để sử dụng",machineCode:t};return this.applyEntitlementResponse(o)}catch(o){if(!mw(o))throw o;return this.invalidateStoredEntitlement(o)}}';

if (!code.includes(oldPerformCheckIn)) {
  console.error('❌ Could not find oldPerformCheckIn in main/index.js');
  process.exit(1);
}
code = code.replace(oldPerformCheckIn, newPerformCheckIn);
console.log('✓ Replaced performCheckIn()');

// 3. Fix deactivate(): Clear any heartbeat timer instead of restarting it
const oldHeartbeat = '; if (!this.__heartbeatTimer) { this.__heartbeatTimer = setInterval(() => { try { this.checkIn(); } catch(e){} }, 30000); };';
const newHeartbeat = '; if (this.__heartbeatTimer) { clearInterval(this.__heartbeatTimer); this.__heartbeatTimer = null; };';

if (code.includes(oldHeartbeat)) {
  code = code.replace(oldHeartbeat, newHeartbeat);
  console.log('✓ Fixed deactivate() heartbeat');
}

fs.writeFileSync(mainJsPath, code, 'utf8');
console.log('✅ Updated app/out/main/index.js successfully!');
