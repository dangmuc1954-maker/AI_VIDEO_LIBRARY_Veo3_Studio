const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../license_server/data/database.json');
if (fs.existsSync(dbPath)) {
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  // 1. Filter plans
  if (Array.isArray(db.plans)) {
    db.plans = db.plans.filter(p => p.code !== 'lifetime' && p.code !== 'lifetime-vip');
  }

  // 2. Filter / update keys
  if (Array.isArray(db.keys)) {
    // Remove unused lifetime keys
    db.keys = db.keys.filter(k => !(k.planCode === 'lifetime-vip' || k.planCode === 'lifetime'));
    
    // Ensure all keys have maxDevices = 1 and at most 1 machine in machineCodes
    for (const k of db.keys) {
      k.maxDevices = 1;
      if (Array.isArray(k.machineCodes) && k.machineCodes.length > 1) {
        k.machineCodes = k.machineCodes.slice(0, 1);
      }
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('✅ Sanitized database.json successfully!');
}
