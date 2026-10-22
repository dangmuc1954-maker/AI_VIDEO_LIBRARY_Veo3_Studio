const fs = require('fs');
const path = require('path');

const REMOTE_API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_CLOUD_ID = 'ff808181a067127101a07b74b792343f';

async function main() {
  console.log('=== SYNCING LOCAL DATABASE TO VERCEL CLOUD SERVER ===');
  
  // 1. Read local database
  const localDbPath = path.join(__dirname, '..', 'license_server', 'data', 'database.json');
  if (!fs.existsSync(localDbPath)) {
    console.error('Local db not found at:', localDbPath);
    return;
  }
  const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf8'));
  console.log(`[Local] Found ${localDb.keys?.length || 0} keys and ${localDb.orders?.length || 0} orders.`);

  // 2. Fetch current cloud object
  console.log('[Cloud] Fetching current cloud state...');
  const res = await fetch(`${REMOTE_API_BASE}/${MASTER_CLOUD_ID}`);
  if (!res.ok) {
    console.error('[Cloud] Failed to fetch current cloud object. Status:', res.status);
    return;
  }
  const cloudJson = await res.json();
  const cloudData = cloudJson?.data || {};

  const keysMap = new Map();
  const machinesMap = new Map();
  const ordersMap = new Map();

  // Ingest existing cloud data
  if (Array.isArray(cloudData.keys)) {
    cloudData.keys.forEach(k => { if (k?.key) keysMap.set(k.key.toUpperCase(), k); });
  }
  if (Array.isArray(cloudData.machines)) {
    cloudData.machines.forEach(m => { if (m?.machineCode) machinesMap.set(m.machineCode.trim(), m); });
  }
  if (Array.isArray(cloudData.orders)) {
    cloudData.orders.forEach(o => { if (o?.orderCode) ordersMap.set(o.orderCode.trim().toUpperCase(), o); });
  }

  console.log(`[Cloud Initial] Keys: ${keysMap.size}, Machines: ${machinesMap.size}, Orders: ${ordersMap.size}`);

  // Ingest local keys into map
  if (Array.isArray(localDb.keys)) {
    localDb.keys.forEach(k => {
      if (!k || !k.key) return;
      const upper = k.key.toUpperCase();
      const existing = keysMap.get(upper);
      keysMap.set(upper, {
        ...existing,
        ...k,
        key: upper,
        planCode: k.planCode || existing?.planCode || 'basic',
        planName: k.planName || existing?.planName || 'Basic',
        status: k.status || existing?.status || 'active',
        durationDays: k.durationDays || (k.planCode === 'gold' ? 365 : 30),
        features: k.features || { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
        limits: k.limits || { unlimited: true, maxConcurrency: 50 },
        machineCodes: Array.isArray(k.machineCodes) ? k.machineCodes : (existing?.machineCodes || [])
      });

      // If key is attached to a machine, make sure machine record exists
      if (Array.isArray(k.machineCodes) && k.machineCodes.length > 0) {
        k.machineCodes.forEach(mc => {
          const cleanMc = mc.trim();
          const existingMach = machinesMap.get(cleanMc);
          machinesMap.set(cleanMc, {
            ...existingMach,
            id: 'MACH-' + Date.now(),
            machineCode: cleanMc,
            customerIdentifier: k.customerEmail || existingMach?.customerIdentifier || 'phanhongha1',
            licenseKey: upper,
            planCode: k.planCode || 'gold',
            planName: k.planName || 'Gold VIP',
            planTier: k.planTier || 'ultra',
            durationDays: k.durationDays || 365,
            activatedAt: k.activatedAt || '2026-10-12T02:32:00.000Z',
            expiresAt: k.expiresAt || '2027-10-12T02:32:00.000Z',
            ip: k.ip || existingMach?.ip || '1.52.111.172',
            appVersion: 'v3.0.0',
            lastSeenAt: new Date().toISOString(),
            status: 'active'
          });
        });
      }
    });
  }

  // Also specifically ensure customer machine d71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145 has Gold VIP
  const targetMc = 'd71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145';
  const goldKey = 'AIFORGE-GOLD-365D-B3BBFA28-64DB60AF';
  machinesMap.set(targetMc, {
    id: 'MACH-GOLD-VIP',
    machineCode: targetMc,
    customerIdentifier: 'phanhongha1',
    licenseKey: goldKey,
    planCode: 'gold',
    planName: 'Gold VIP',
    planTier: 'ultra',
    durationDays: 365,
    activatedAt: '2026-10-12T02:32:00.000Z',
    expiresAt: '2027-10-12T02:32:00.000Z',
    ip: '1.52.111.172',
    appVersion: 'v3.0.0',
    lastSeenAt: new Date().toISOString(),
    status: 'active'
  });

  // Ingest local orders
  if (Array.isArray(localDb.orders)) {
    localDb.orders.forEach(o => {
      if (o && o.orderCode) {
        ordersMap.set(o.orderCode.trim().toUpperCase(), o);
      }
    });
  }

  const payload = {
    name: 'aiforge_master_store',
    data: {
      keys: Array.from(keysMap.values()),
      machines: Array.from(machinesMap.values()),
      orders: Array.from(ordersMap.values()),
      bannedMachines: Array.from(cloudData.bannedMachines || []),
      bannedIps: Array.from(cloudData.bannedIps || []),
      unlinkedMachines: Array.from(cloudData.unlinkedMachines || []),
      settings: cloudData.settings || {
        adminPassword: 'admin',
        paymentReceiver: 'PHAN DANG HONG HA',
        bankAccount: '96247HP2004',
        bankName: 'BIDV',
        sepayApiKey: 'MZUDJVBTW0NUAVLC4JOYIYVXWC3DOT2JWOFDUR1SFRNKLZ8EKR9Q9C1FIMHDGTXQ'
      },
      updatedAt: new Date().toISOString()
    }
  };

  console.log(`\n[Syncing] Uploading ${payload.data.keys.length} keys, ${payload.data.machines.length} machines, ${payload.data.orders.length} orders...`);

  const putRes = await fetch(`${REMOTE_API_BASE}/${MASTER_CLOUD_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    console.log('✅ SYNC TO VERCEL CLOUD SUCCESSFUL! Status:', putRes.status);
  } else {
    console.error('❌ Failed to update cloud. Status:', putRes.status, await putRes.text());
  }
}

main().catch(err => console.error('Error:', err));
