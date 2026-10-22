const db = require('./db');

console.log('[*] Migrating registered machines from existing keys & orders...');
const keys = db.data.keys || [];
const orders = db.data.orders || [];

let count = 0;

for (const k of keys) {
  if (k.machineCodes && k.machineCodes.length > 0) {
    for (const mCode of k.machineCodes) {
      db.upsertMachine({
        machineCode: mCode,
        customerIdentifier: k.customerEmail || 'Khách hàng',
        licenseKey: k.key,
        planCode: k.planCode,
        planName: k.planName,
        planTier: k.planTier,
        status: k.status === 'suspended' ? 'suspended' : 'active',
        expiresAt: k.expiresAt,
        ip: 'Local',
        appVersion: '1.0.0',
        notes: k.notes
      });
      count++;
    }
  }
}

for (const o of orders) {
  if (o.machineCode) {
    db.upsertMachine({
      machineCode: o.machineCode,
      customerIdentifier: o.customerIdentifier || 'Khách hàng',
      licenseKey: o.licenseKey || '',
      planCode: o.planCode,
      planName: o.planName,
      planTier: o.planTier,
      status: o.status === 'paid' ? 'active' : 'pending',
      expiresAt: o.expiresAt,
      ip: o.ip || 'Local',
      appVersion: o.appVersion || '1.0.0',
      notes: `Order ${o.orderCode}`
    });
    count++;
  }
}

console.log(`✅ Đã đồng bộ ${count} máy tính vào bảng quản lý Devices & HWID!`);
console.log(`[*] Tổng số máy hiện tại trong Database: ${db.data.machines.length}`);
