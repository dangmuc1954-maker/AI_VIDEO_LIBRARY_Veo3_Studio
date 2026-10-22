const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.resolve(__dirname, '../app/out/main/index.js'),
  path.resolve(process.env.LOCALAPPDATA, 'Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js')
];

for (const file of targetFiles) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Add 15-second heartbeat in constructor
  const oldConstructor = 'class hw{constructor(e){this.options=e}cachedPayload=null;';
  const newConstructor = 'class hw{constructor(e){this.options=e;setInterval(()=>{try{const st=this.options.store.getState();if(st.entitlementToken||st.licenseId)this.checkIn().catch(()=>{});}catch(err){}},15000);}cachedPayload=null;';
  if (code.includes(oldConstructor)) {
    code = code.replace(oldConstructor, newConstructor);
    console.log('[1] Added 15s check-in heartbeat to constructor in:', file);
  }

  // 2. Enhance gw(r) to recognize MACHINE_BANNED and MACHINE_UNLINKED
  const oldGw = 'function gw(r){return r.message.toLowerCase().includes("machine")?"MACHINE_MISMATCH":"LICENSE_REQUIRED"}';
  const newGw = 'function gw(r){const m=String(r?.message||"").toLowerCase();const c=String(r?.code||"");if(c==="MACHINE_BANNED"||m.includes("bị khóa")||m.includes("banned"))return"MACHINE_BANNED";if(c==="MACHINE_UNLINKED"||m.includes("chuyển đổi")||m.includes("đổi sang")||m.includes("unlinked"))return"MACHINE_UNLINKED";return m.includes("machine")?"MACHINE_MISMATCH":"LICENSE_REQUIRED"}';
  if (code.includes(oldGw)) {
    code = code.replace(oldGw, newGw);
    console.log('[2] Enhanced gw(r) error mapper in:', file);
  }

  // 3. Update invalidateStoredEntitlement to persist machineBanned if banned
  const oldInvalidate = 'const o={...t?this.toStatusSnapshot(t,!1):{state:"blocked",valid:!1},machineCode:t?.machineCode||await this.options.machineIdentity.getMachineCode(),code:gw(e),message:e.message||"License is not active"};return this.notifyStatusChanged(),o';
  const newInvalidate = 'const code=gw(e);if(code==="MACHINE_BANNED"){try{await this.options.store.update({machineBanned:true});}catch(e){}}const o={...t?this.toStatusSnapshot(t,!1):{state:"blocked",valid:!1},machineCode:t?.machineCode||await this.options.machineIdentity.getMachineCode(),code:code,message:e.message||"License is not active"};return this.notifyStatusChanged(),o';
  if (code.includes(oldInvalidate)) {
    code = code.replace(oldInvalidate, newInvalidate);
    console.log('[3] Enhanced invalidateStoredEntitlement in:', file);
  }

  // 4. Update getStatusSync and getStatus for machineBanned
  const oldGetStatusSync = 'getStatusSync(){return this.evaluateCurrentTokenSync()}';
  const newGetStatusSync = 'getStatusSync(){if(this.options.store.getState().machineBanned)return{state:"blocked",valid:!1,code:"MACHINE_BANNED",message:"Thiết bị của bạn đã bị KHÓA VĨNH VIỄN bởi Quản trị viên."};return this.evaluateCurrentTokenSync()}';
  if (code.includes(oldGetStatusSync)) {
    code = code.replace(oldGetStatusSync, newGetStatusSync);
    console.log('[4] Added machineBanned check in getStatusSync in:', file);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log('✅ Successfully patched client license manager in:', file);
}
