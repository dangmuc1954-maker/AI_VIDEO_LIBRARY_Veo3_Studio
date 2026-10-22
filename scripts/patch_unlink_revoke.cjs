const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Hy and zy
const target1 = 'function Hy(r){return r instanceof Wr?["ACTIVATION_NOT_FOUND","ACTIVATION_INACTIVE","MACHINE_MISMATCH","LICENSE_REVOKED"].includes(r.errorCode||""):!1}function zy(r){return r.errorCode==="MACHINE_MISMATCH"?"MACHINE_MISMATCH":r.errorCode==="LICENSE_REVOKED"?"REVOKED":"LICENSE_REQUIRED"}';
const repl1 = 'function Hy(r){if(!r)return!1;const e=r.errorCode||r.responseBody?.error?.code||r.responseBody?.code||"";if(["ACTIVATION_NOT_FOUND","ACTIVATION_INACTIVE","MACHINE_MISMATCH","LICENSE_REVOKED","MACHINE_UNLINKED","MACHINE_BANNED","KEY_REVOKED","LICENSE_REQUIRED","LICENSE_EXPIRED"].includes(e))return!0;if(r instanceof Wr&&(r.statusCode===401||r.statusCode===403||r.statusCode===404||r.statusCode===409))return!0;return!1}function zy(r){const e=r.errorCode||r.responseBody?.error?.code||"";return e==="MACHINE_MISMATCH"||e==="MACHINE_UNLINKED"?"MACHINE_MISMATCH":e==="LICENSE_REVOKED"||e==="MACHINE_BANNED"||e==="KEY_REVOKED"?"REVOKED":e==="LICENSE_EXPIRED"?"LICENSE_EXPIRED":"LICENSE_REQUIRED"}';

if (!content.includes(target1)) {
  console.error('Target 1 not found in ' + targetFile);
  process.exit(1);
}
content = content.replace(target1, repl1);

// 2. getStatusForGate and applyEntitlementResponse
const target2 = 'async getStatusForGate(){const e=await this.getStatus();if(e.valid||e.code!=="OFFLINE_EXPIRED"&&e.code!=="TOKEN_INVALID")return e;try{return await this.checkIn()}catch(t){return B("license","on-demand check-in failed before license gate",{backendUrl:this.options.httpClient.getBaseUrl(),error:v(t)}),e}}async applyEntitlementResponse(e,t){const A=this.options.verifier.verifyEntitlement(e.entitlementToken);';
const repl2 = 'async getStatusForGate(){try{if(Date.now()-(this.lastGateCheckInTime||0)>10*1e3){this.lastGateCheckInTime=Date.now();const t=await this.checkIn();if(!t.valid)return t}}catch(t){if(Hy(t))return await this.invalidateStoredEntitlement(t)}const e=await this.getStatus();if(e.valid||e.code!=="OFFLINE_EXPIRED"&&e.code!=="TOKEN_INVALID")return e;try{return await this.checkIn()}catch(t){return B("license","on-demand check-in failed before license gate",{backendUrl:this.options.httpClient.getBaseUrl(),error:v(t)}),e}}async applyEntitlementResponse(e,t){if(!e||!e.entitlementToken)return this.invalidateStoredEntitlement(new Wr(e?.message||"Thiết bị chưa được kích hoạt bản quyền",403,e,"ACTIVATION_NOT_FOUND"));const A=this.options.verifier.verifyEntitlement(e.entitlementToken);';

if (!content.includes(target2)) {
  console.error('Target 2 not found in ' + targetFile);
  process.exit(1);
}
content = content.replace(target2, repl2);

// 3. wB and PB
const target3 = 'const wB=300*1e3,PB=60*1e3';
const repl3 = 'const wB=30*1e3,PB=3*1e3';

if (!content.includes(target3)) {
  console.error('Target 3 not found in ' + targetFile);
  process.exit(1);
}
content = content.replace(target3, repl3);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully patched app/out/main/index.js!');
