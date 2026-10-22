const fs = require('fs');
const path = require('path');

const serverFile = path.resolve(__dirname, '../vercel_server/api/index.js');
let code = fs.readFileSync(serverFile, 'utf8');

const targetOld = `    if (foundKey) {
      const unlinkedMachines = [...(foundKey.machineCodes || [])];
      foundKey.machineCodes = [];
      // Unlink in machines map
      for (const mCode of unlinkedMachines) {
        const m = inMemoryStore.machines.get(mCode);
        if (m && m.licenseKey?.toUpperCase() === foundKey.key?.toUpperCase()) {
          m.licenseKey = '';
          m.notes = 'Đã reset HWID / Gỡ khỏi máy';
        }
      }
      triggerSaveToCloud();
      return sendJson(res, 200, { ok: true, message: \`Đã Reset HWID thành công cho key \${foundKey.key}. Khách có thể kích hoạt trên máy mới!\` });
    }

    // Check if target is machine
    const foundMachine = inMemoryStore.machines.get(cleanTarget);
    if (foundMachine) {
      const activeKey = foundMachine.licenseKey;
      if (activeKey) {
        const keyObj = inMemoryStore.keys.get(activeKey.toUpperCase());
        if (keyObj && Array.isArray(keyObj.machineCodes)) {
          keyObj.machineCodes = keyObj.machineCodes.filter(c => c !== cleanTarget);
        }
      }
      foundMachine.licenseKey = '';
      foundMachine.notes = 'Đã Reset HWID thiết bị';
      triggerSaveToCloud();
      return sendJson(res, 200, { ok: true, message: \`Đã gỡ liên kết máy \${cleanTarget} khỏi bản quyền!\` });
    }`;

const targetNew = `    if (foundKey) {
      const unlinkedMachines = [...(foundKey.machineCodes || [])];
      foundKey.machineCodes = [];
      // Unlink in machines map and record in unlinkedMachines set
      for (const mCode of unlinkedMachines) {
        inMemoryStore.unlinkedMachines.add(mCode);
        const m = inMemoryStore.machines.get(mCode);
        if (m) {
          m.licenseKey = '';
          m.status = 'unlinked';
          m.unlinkedAt = new Date().toISOString();
          m.notes = 'Đã đổi máy (Reset HWID) - Đã dừng gói và xóa key';
        }
      }
      triggerSaveToCloud();
      return sendJson(res, 200, { ok: true, message: \`Đã đổi máy thành công cho key \${foundKey.key}! Gói cước trên các máy cũ (\${unlinkedMachines.join(', ') || '0 máy'}) đã bị dừng ngay lập tức và key đã được giải phóng để kích hoạt trên máy mới.\` });
    }

    // Check if target is machine
    const foundMachine = inMemoryStore.machines.get(cleanTarget);
    if (foundMachine) {
      inMemoryStore.unlinkedMachines.add(cleanTarget);
      const activeKey = foundMachine.licenseKey;
      if (activeKey) {
        const keyObj = inMemoryStore.keys.get(activeKey.toUpperCase());
        if (keyObj && Array.isArray(keyObj.machineCodes)) {
          keyObj.machineCodes = keyObj.machineCodes.filter(c => c !== cleanTarget);
        }
      }
      foundMachine.licenseKey = '';
      foundMachine.status = 'unlinked';
      foundMachine.unlinkedAt = new Date().toISOString();
      foundMachine.notes = 'Đã đổi máy - Đã dừng gói và xóa key';
      triggerSaveToCloud();
      return sendJson(res, 200, { ok: true, message: \`Đã đổi máy thành công! Đã ngắt gói và xóa key ngay lập tức trên máy HWID: \${cleanTarget}. Key \${activeKey || ''} đã sẵn sàng kích hoạt trên máy mới!\` });
    }`;

if (code.includes(targetOld)) {
  code = code.replace(targetOld, targetNew);
  fs.writeFileSync(serverFile, code, 'utf8');
  console.log('✅ Successfully patched reset-hwid logic!');
} else {
  console.error('❌ Could not find targetOld in vercel_server/api/index.js');
  process.exit(1);
}
