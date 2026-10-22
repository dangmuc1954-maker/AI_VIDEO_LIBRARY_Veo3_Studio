const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const DEFAULT_PLANS = [
  {
    code: 'basic',
    name: 'Basic',
    tier: 'pro',
    badge: 'Gói Basic (1 Tháng)',
    accentColor: '#6366f1',
    recommended: false,
    trialEnabled: false,
    trialDays: 0,
    trialOncePerMachine: false,
    allowPromotion: true,
    features: [
      'Tạo Video Veo 3 & Grok không giới hạn',
      'Tạo ảnh Google Flow Nano & ChatGPT',
      'Giọng đọc AI ElevenLabs TTS chất lượng cao',
      'Không giới hạn số lượt render trong 30 ngày (1 Tháng)'
    ],
    billingOptions: [
      { durationCode: '1M', durationDays: 30, priceVnd: 120000, originalPriceVnd: 180000, sortOrder: 1 }
    ],
    imageConcurrency: 20,
    videoConcurrency: 10,
    ttsConcurrency: 20,
    unlimited: true
  },
  {
    code: 'silver',
    name: 'Silver',
    tier: 'pro',
    badge: 'Gói Silver (3 Tháng)',
    accentColor: '#a855f7',
    recommended: true,
    trialEnabled: false,
    trialDays: 0,
    trialOncePerMachine: false,
    allowPromotion: true,
    features: [
      'Tạo Video Veo 3 & Grok không giới hạn',
      'Tạo ảnh Google Flow Nano & ChatGPT',
      'Giọng đọc AI ElevenLabs TTS chất lượng cao',
      'Không giới hạn số lượt render trong 90 ngày (3 Tháng)',
      'Tiết kiệm 20% so với gia hạn từng tháng'
    ],
    billingOptions: [
      { durationCode: '3M', durationDays: 90, priceVnd: 300000, originalPriceVnd: 450000, sortOrder: 1 }
    ],
    imageConcurrency: 30,
    videoConcurrency: 15,
    ttsConcurrency: 30,
    unlimited: true
  },
  {
    code: 'gold',
    name: 'Gold VIP',
    tier: 'ultra',
    badge: 'Gói Gold VIP (1 Năm)',
    accentColor: '#eab308',
    recommended: false,
    trialEnabled: false,
    trialDays: 0,
    trialOncePerMachine: false,
    allowPromotion: true,
    features: [
      'Tạo Video Veo 3 & Grok không giới hạn',
      'Tạo ảnh Google Flow Nano & ChatGPT',
      'Giọng đọc AI ElevenLabs TTS chất lượng cao',
      'Full Workflow Canvas tự động hóa nâng cao',
      'Không giới hạn số lượt render trong 365 ngày (1 Năm)',
      'Hỗ trợ ưu tiên và cập nhật mẫu Prompt VIP'
    ],
    billingOptions: [
      { durationCode: '1Y', durationDays: 365, priceVnd: 800000, originalPriceVnd: 1440000, sortOrder: 1 }
    ],
    imageConcurrency: 50,
    videoConcurrency: 30,
    ttsConcurrency: 50,
    unlimited: true
  }
];

class Database {
  constructor() {
    this.data = {
      keys: [],
      machines: [],
      bannedMachines: [],
      bannedIps: [],
      customers: [],
      orders: [],
      plans: DEFAULT_PLANS,
      settings: {
        adminPassword: 'admin',
        paymentReceiver: 'PHAN DANG HONG HA',
        bankAccount: '96247HP2004',
        bankName: 'BIDV',
        sepayApiKey: ''
      }
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          ...this.data,
          ...parsed,
          keys: Array.isArray(parsed.keys) ? parsed.keys : [],
          machines: Array.isArray(parsed.machines) ? parsed.machines : [],
          bannedMachines: Array.isArray(parsed.bannedMachines) ? parsed.bannedMachines : [],
          bannedIps: Array.isArray(parsed.bannedIps) ? parsed.bannedIps : [],
          orders: Array.isArray(parsed.orders) ? parsed.orders : [],
          plans: DEFAULT_PLANS,
          settings: { ...this.data.settings, ...(parsed.settings || {}) }
        };
      } catch (e) {
        console.error('Error reading database.json, using defaults:', e);
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing database.json:', e);
    }
  }

  // --- KEY MANAGEMENT ---
  findKey(keyStr) {
    this.load();
    if (!keyStr) return null;
    const cleanKey = String(keyStr).trim().toUpperCase();
    return this.data.keys.find(k => k.key.trim().toUpperCase() === cleanKey) || null;
  }

  addKey(keyRecord) {
    this.load();
    this.data.keys.unshift(keyRecord);
    this.save();
    return keyRecord;
  }

  updateKey(keyStr, updates) {
    this.load();
    const cleanKey = String(keyStr).trim().toUpperCase();
    const idx = this.data.keys.findIndex(k => k.key.trim().toUpperCase() === cleanKey);
    if (idx !== -1) {
      this.data.keys[idx] = { ...this.data.keys[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.keys[idx];
    }
    return null;
  }

  deleteKey(keyStr) {
    this.load();
    const cleanKey = String(keyStr).trim().toUpperCase();
    this.data.keys = this.data.keys.filter(k => k.key.trim().toUpperCase() !== cleanKey);
    this.save();
    return true;
  }

  listKeys(filter = {}) {
    this.load();
    let result = [...this.data.keys];
    if (filter.status) result = result.filter(k => k.status === filter.status);
    if (filter.planCode) result = result.filter(k => k.planCode === filter.planCode);
    return result;
  }

  // --- MACHINE / DEVICE MANAGEMENT ---
  upsertMachine(record) {
    this.load();
    const mCode = String(record.machineCode || '').trim();
    if (!mCode) return null;
    const idx = this.data.machines.findIndex(m => m.machineCode === mCode);
    const now = new Date().toISOString();
    if (idx !== -1) {
      this.data.machines[idx] = {
        ...this.data.machines[idx],
        ...record,
        lastSeenAt: now,
        updatedAt: now
      };
    } else {
      this.data.machines.unshift({
        id: 'MACH-' + Date.now(),
        machineCode: mCode,
        customerIdentifier: record.customerIdentifier || 'Khách hàng',
        planCode: record.planCode || 'trial',
        planName: record.planName || 'Trải Nghiệm',
        planTier: record.planTier || 'starter',
        highestPlanCode: record.highestPlanCode || record.planCode || 'trial',
        highestPlanName: record.highestPlanName || record.planName || 'Trải Nghiệm',
        highestPlanTier: record.highestPlanTier || record.planTier || 'starter',
        activeKeys: record.activeKeys || (record.licenseKey ? [record.licenseKey] : []),
        licenseKey: record.licenseKey || '',
        status: record.status || 'active',
        ip: record.ip || '',
        appVersion: record.appVersion || '1.0.0',
        firstSeenAt: now,
        lastSeenAt: now,
        expiresAt: record.expiresAt || null,
        notes: record.notes || ''
      });
    }
    this.save();
    return this.findMachine(mCode);
  }

  findMachine(machineCode) {
    this.load();
    if (!machineCode) return null;
    return this.data.machines.find(m => m.machineCode === String(machineCode).trim()) || null;
  }

  updateMachine(machineCode, updates) {
    this.load();
    const mCode = String(machineCode || '').trim();
    const idx = this.data.machines.findIndex(m => m.machineCode === mCode);
    if (idx !== -1) {
      this.data.machines[idx] = { ...this.data.machines[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.machines[idx];
    }
    return null;
  }

  listMachines() {
    this.load();
    return [...this.data.machines];
  }

  deleteMachine(machineCode) {
    this.load();
    this.data.machines = this.data.machines.filter(m => m.machineCode !== machineCode);
    this.save();
    return true;
  }

  resetMachine(machineCode) {
    this.load();
    const mCode = String(machineCode || '').trim();
    if (!mCode) return false;
    const now = new Date().toISOString();
    const idx = this.data.machines.findIndex(m => m.machineCode === mCode);
    if (idx !== -1) {
      this.data.machines[idx] = {
        ...this.data.machines[idx],
        status: 'unlinked',
        licenseKey: '',
        activeKeys: [],
        notes: `Đã reset máy bởi Quản trị viên lúc ${now}`,
        updatedAt: now
      };
    }
    this.data.keys.forEach(k => {
      if (Array.isArray(k.machineCodes) && k.machineCodes.includes(mCode)) {
        k.machineCodes = k.machineCodes.filter(m => m !== mCode);
      }
    });
    this.save();
    return true;
  }

  // --- BAN & SUSPEND CONTROLS ---
  banMachine(machineCode, reason = 'Vi phạm chính sách / Khóa máy') {
    this.load();
    const mCode = String(machineCode).trim();
    if (!mCode) return false;
    if (!this.data.bannedMachines.some(b => b.machineCode === mCode)) {
      this.data.bannedMachines.unshift({
        machineCode: mCode,
        reason,
        bannedAt: new Date().toISOString()
      });
    }
    // Update machine status
    const m = this.data.machines.find(x => x.machineCode === mCode);
    if (m) m.status = 'banned';
    this.save();
    return true;
  }

  unbanMachine(machineCode) {
    this.load();
    const mCode = String(machineCode).trim();
    this.data.bannedMachines = this.data.bannedMachines.filter(b => b.machineCode !== mCode);
    const m = this.data.machines.find(x => x.machineCode === mCode);
    if (m && m.status === 'banned') m.status = 'active';
    this.save();
    return true;
  }

  isMachineBanned(machineCode) {
    this.load();
    const mCode = String(machineCode || '').trim();
    return this.data.bannedMachines.some(b => b.machineCode === mCode);
  }

  banIp(ip, reason = 'Khóa IP') {
    this.load();
    const cleanIp = String(ip || '').trim();
    if (!cleanIp) return false;
    if (!this.data.bannedIps.some(b => b.ip === cleanIp)) {
      this.data.bannedIps.unshift({
        ip: cleanIp,
        reason,
        bannedAt: new Date().toISOString()
      });
    }
    this.save();
    return true;
  }

  unbanIp(ip) {
    this.load();
    const cleanIp = String(ip || '').trim();
    this.data.bannedIps = this.data.bannedIps.filter(b => b.ip !== cleanIp);
    this.save();
    return true;
  }

  isIpBanned(ip) {
    this.load();
    const cleanIp = String(ip || '').trim();
    if (!cleanIp) return false;
    return this.data.bannedIps.some(b => b.ip === cleanIp);
  }

  suspendKey(keyStr) {
    return this.updateKey(keyStr, { status: 'suspended' });
  }

  resumeKey(keyStr) {
    return this.updateKey(keyStr, { status: 'active' });
  }

  // --- ORDER MANAGEMENT ---
  findOrder(orderCode) {
    this.load();
    if (!orderCode) return null;
    const cleanCode = String(orderCode).trim().toUpperCase();
    return this.data.orders.find(o => o.orderCode.trim().toUpperCase() === cleanCode) || null;
  }

  addOrder(orderRecord) {
    this.load();
    this.data.orders.unshift(orderRecord);
    this.save();
    return orderRecord;
  }

  updateOrder(orderCode, updates) {
    this.load();
    const cleanCode = String(orderCode).trim().toUpperCase();
    const idx = this.data.orders.findIndex(o => o.orderCode.trim().toUpperCase() === cleanCode);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  deleteOrder(orderCode) {
    this.load();
    const cleanCode = String(orderCode).trim().toUpperCase();
    this.data.orders = this.data.orders.filter(o => o.orderCode.trim().toUpperCase() !== cleanCode);
    this.save();
    return true;
  }

  listOrders() {
    this.load();
    return [...this.data.orders];
  }

  // --- SETTINGS ---
  getSettings() {
    this.load();
    return { ...this.data.settings };
  }

  updateSettings(updates) {
    this.load();
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();
    return this.getSettings();
  }
}

const db = new Database();
module.exports = db;
