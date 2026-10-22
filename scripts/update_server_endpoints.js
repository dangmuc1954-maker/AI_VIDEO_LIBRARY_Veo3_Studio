const fs = require('fs');
const path = require('path');

const serverFile = path.resolve(__dirname, '../vercel_server/api/index.js');
let code = fs.readFileSync(serverFile, 'utf8');

// --- 1. UPDATE BAN ENDPOINT ---
const oldBanTarget = `  // A3. Ban Machine (HWID)
  if (pathname === '/api/admin/machines/ban' && method === 'POST') {
    const { machineCode, reason } = body;
    if (!machineCode) return sendJson(res, 400, { error: 'machineCode is required' });
    inMemoryStore.bannedMachines.add(machineCode.trim());
    const m = inMemoryStore.machines.get(machineCode.trim());
    if (m) {
      m.status = 'banned';
      m.banReason = reason || 'Khóa bởi Quản trị viên';
    }
    triggerSaveToCloud();
    return sendJson(res, 200, { ok: true, message: \`Đã khóa thiết bị \${machineCode}\` });
  }`;

const newBan = `  // A3. Ban Machine (HWID)
  if (pathname === '/api/admin/machines/ban' && method === 'POST') {
    const { machineCode, reason } = body;
    if (!machineCode) return sendJson(res, 400, { error: 'machineCode is required' });
    const cleanMachine = String(machineCode).trim();
    inMemoryStore.bannedMachines.add(cleanMachine);
    inMemoryStore.unlinkedMachines.add(cleanMachine);

    // Unlink from any active keys
    for (const [k, v] of inMemoryStore.keys.entries()) {
      if (v && Array.isArray(v.machineCodes) && v.machineCodes.includes(cleanMachine)) {
        v.machineCodes = v.machineCodes.filter(c => c !== cleanMachine);
      }
    }

    const m = inMemoryStore.machines.get(cleanMachine);
    if (m) {
      m.status = 'banned';
      m.licenseKey = '';
      m.banReason = reason || 'Khóa vĩnh viễn bởi Quản trị viên';
      m.bannedAt = new Date().toISOString();
    } else {
      inMemoryStore.machines.set(cleanMachine, {
        id: 'MACH-' + Date.now(),
        machineCode: cleanMachine,
        status: 'banned',
        licenseKey: '',
        banReason: reason || 'Khóa vĩnh viễn bởi Quản trị viên',
        bannedAt: new Date().toISOString()
      });
    }

    triggerSaveToCloud();
    return sendJson(res, 200, { ok: true, message: \`Đã khóa vĩnh viễn thiết bị \${cleanMachine}! Thiết bị này không thể sử dụng ứng dụng nữa.\` });
  }`;

if (code.includes(oldBanTarget)) {
  code = code.replace(oldBanTarget, newBan);
  console.log('[1] Updated Ban endpoint');
} else {
  console.log('[1] Notice: oldBanTarget not matched exactly, checking alternate...');
}

// --- 2. UPDATE UNBAN ENDPOINT ---
const oldUnbanTarget = `  // A4. Unban Machine (HWID)
  if (pathname === '/api/admin/machines/unban' && method === 'POST') {
    const { machineCode } = body;
    if (!machineCode) return sendJson(res, 400, { error: 'machineCode is required' });
    inMemoryStore.bannedMachines.delete(machineCode.trim());
    const m = inMemoryStore.machines.get(machineCode.trim());
    if (m) {
      m.status = 'active';
      delete m.banReason;
    }
    triggerSaveToCloud();
    return sendJson(res, 200, { ok: true, message: \`Đã mở khóa thiết bị \${machineCode}\` });
  }`;

const newUnban = `  // A4. Unban Machine (HWID)
  if (pathname === '/api/admin/machines/unban' && method === 'POST') {
    const { machineCode } = body;
    if (!machineCode) return sendJson(res, 400, { error: 'machineCode is required' });
    const cleanMachine = String(machineCode).trim();
    inMemoryStore.bannedMachines.delete(cleanMachine);
    inMemoryStore.unlinkedMachines.delete(cleanMachine);

    const m = inMemoryStore.machines.get(cleanMachine);
    if (m) {
      m.status = 'active';
      delete m.banReason;
      delete m.bannedAt;
    }
    triggerSaveToCloud();
    return sendJson(res, 200, { ok: true, message: \`Đã mở khóa thiết bị \${cleanMachine} thành công!\` });
  }`;

if (code.includes(oldUnbanTarget)) {
  code = code.replace(oldUnbanTarget, newUnban);
  console.log('[2] Updated Unban endpoint');
}

// --- 3. UPDATE RESET HWID (ĐỔI MÁY) ENDPOINT ---
const resetIdx = code.indexOf('// A5. Reset HWID for Machine or Key');
const resetEndIdx = code.indexOf('// A6. Extend Machine License Duration', resetIdx);

if (resetIdx !== -1 && resetEndIdx !== -1) {
  const newResetHwid = `// A5. Reset HWID for Machine or Key (Đổi máy: ngắt gói tức thì trên máy cũ & giải phóng key)
  if ((pathname.includes('/api/admin/machines/reset-hwid') || pathname.includes('/api/admin/keys/reset-hwid') || pathname.endsWith('/reset-hwid')) && method === 'POST') {
    const target = body.key || body.machineCode || decodeURIComponent(pathname.split('/').slice(-2)[0] || '');
    const cleanTarget = String(target || '').trim();

    // Check if target is a Key
    let foundKey = inMemoryStore.keys.get(cleanTarget.toUpperCase());
    if (!foundKey) {
      for (const [k, v] of inMemoryStore.keys.entries()) {
        if (k.toUpperCase() === cleanTarget.toUpperCase() || v.key?.toUpperCase() === cleanTarget.toUpperCase() || v.id === cleanTarget) {
          foundKey = v; break;
        }
      }
    }

    if (foundKey) {
      const unlinkedMachines = Array.isArray(foundKey.machineCodes) ? [...foundKey.machineCodes] : [];
      foundKey.machineCodes = [];

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
      return sendJson(res, 200, {
        ok: true,
        message: \`Đã đổi máy thành công cho key \${foundKey.key}! Gói cước trên các máy cũ (\${unlinkedMachines.join(', ') || '0 máy'}) đã bị ngắt ngay lập tức và key đã được giải phóng để kích hoạt trên máy mới.\`
      });
    }

    // Check if target is a MachineCode (HWID)
    const m = inMemoryStore.machines.get(cleanTarget);
    if (m) {
      inMemoryStore.unlinkedMachines.add(cleanTarget);
      const oldKey = m.licenseKey;
      m.licenseKey = '';
      m.status = 'unlinked';
      m.unlinkedAt = new Date().toISOString();
      m.notes = 'Đã đổi máy - Đã dừng gói và xóa key khỏi máy này';

      if (oldKey) {
        const k = inMemoryStore.keys.get(oldKey.toUpperCase());
        if (k && Array.isArray(k.machineCodes)) {
          k.machineCodes = k.machineCodes.filter(c => c !== cleanTarget);
        }
      }
      triggerSaveToCloud();
      return sendJson(res, 200, {
        ok: true,
        message: \`Đã đổi máy thành công! Đã ngắt gói và xóa key ngay lập tức trên máy HWID: \${cleanTarget}. Key \${oldKey || ''} đã sẵn sàng kích hoạt trên máy mới!\`
      });
    }

    // If cleanTarget not in machines map, add directly to unlinkedMachines
    if (cleanTarget) {
      inMemoryStore.unlinkedMachines.add(cleanTarget);
      triggerSaveToCloud();
      return sendJson(res, 200, { ok: true, message: \`Đã ghi nhận dừng gói trên máy \${cleanTarget}!\` });
    }

    return sendJson(res, 400, { error: 'Không tìm thấy key hoặc mã máy cần reset' });
  }

  `;

  code = code.substring(0, resetIdx) + newResetHwid + code.substring(resetEndIdx);
  console.log('[3] Updated Reset HWID (Đổi máy) endpoint');
}

// --- 4. UPDATE CHECK-IN ENDPOINT ---
const checkInIdx = code.indexOf('// B8. Check-In / Heartbeat');
const checkInEndIdx = code.indexOf('// B9. Deactivate License', checkInIdx);

if (checkInIdx !== -1 && checkInEndIdx !== -1) {
  const newCheckIn = `// B8. Check-In / Heartbeat (App client ping periodically)
  if ((pathname.includes('/check-in') || pathname.endsWith('/check-in')) && method === 'POST') {
    const { machineCode, licenseKey, licenseId, appVersion, customerIdentifier } = body;
    const cleanMachine = String(machineCode || '').trim();
    const targetKey = String(licenseKey || licenseId || '').trim().toUpperCase();

    // 1. Check BAN: Banned machine is blocked 100% from using the app!
    if (cleanMachine && inMemoryStore.bannedMachines.has(cleanMachine)) {
      return sendJson(res, 403, {
        error: {
          code: 'MACHINE_BANNED',
          message: 'Thiết bị của bạn đã bị KHÓA VĨNH VIỄN bởi Quản trị viên do vi phạm chính sách. Không thể tiếp tục sử dụng ứng dụng trên máy này.'
        }
      });
    }

    // 2. Check UNLINKED (Đổi máy): If admin clicked "Đổi Máy", stop immediately!
    if (cleanMachine && inMemoryStore.unlinkedMachines.has(cleanMachine)) {
      return sendJson(res, 409, {
        error: {
          code: 'MACHINE_UNLINKED',
          message: 'Bản quyền này đã được Quản trị viên chuyển đổi sang thiết bị khác. Gói cước trên máy này đã dừng ngay lập tức và key đã bị xóa.'
        }
      });
    }

    let keyObj = targetKey ? inMemoryStore.keys.get(targetKey) : null;
    if (!keyObj && targetKey) {
      for (const [k, v] of inMemoryStore.keys.entries()) {
        if (k.toUpperCase() === targetKey || v.id === targetKey) { keyObj = v; break; }
      }
    }

    // 3. If keyObj exists, verify machine is currently authorized for this key
    if (keyObj) {
      if (keyObj.status === 'revoked') {
        return sendJson(res, 403, { error: { code: 'KEY_REVOKED', message: 'License Key này đã bị thu hồi bởi Quản trị viên.' } });
      }
      if (keyObj.expiresAt && new Date(keyObj.expiresAt).getTime() < Date.now()) {
        keyObj.status = 'expired';
        return sendJson(res, 403, { error: { code: 'LICENSE_EXPIRED', message: 'License Key đã hết hạn sử dụng.' } });
      }

      // If key has machineCodes and this machine was removed -> it was unlinked!
      const currentMachines = Array.isArray(keyObj.machineCodes) ? keyObj.machineCodes : [];
      if (currentMachines.length > 0 && !currentMachines.includes(cleanMachine)) {
        return sendJson(res, 409, {
          error: {
            code: 'MACHINE_UNLINKED',
            message: 'Bản quyền này đã được chuyển sang thiết bị khác. Gói cước trên máy này đã dừng ngay lập tức.'
          }
        });
      }
    }

    // Update machine lastSeenAt
    if (cleanMachine) {
      const existing = inMemoryStore.machines.get(cleanMachine) || {};
      const planCode = keyObj?.planCode || existing.planCode || 'basic';
      const planName = keyObj?.planName || existing.planName || 'Basic';
      const planTier = keyObj?.planTier || existing.planTier || 'pro';
      const expDate = keyObj?.expiresAt || existing.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString();

      inMemoryStore.machines.set(cleanMachine, {
        ...existing,
        machineCode: cleanMachine,
        customerIdentifier: customerIdentifier || keyObj?.customerEmail || existing.customerIdentifier || 'Khách hàng',
        licenseKey: targetKey || existing.licenseKey || '',
        planCode,
        planName,
        planTier,
        expiresAt: expDate,
        ip: clientIp,
        appVersion: appVersion || existing.appVersion || 'v3.0.0',
        lastSeenAt: new Date().toISOString(),
        status: existing.status === 'banned' ? 'banned' : 'active'
      });
      triggerSaveToCloud();
    }

    const effectivePlanCode = keyObj?.planCode || 'basic';
    const effectivePlanName = keyObj?.planName || 'Basic';
    const effectivePlanTier = keyObj?.planTier || 'pro';
    const expDate = keyObj?.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString();
    const expTimestamp = Math.floor(new Date(expDate).getTime() / 1e3);

    const payload = {
      exp: expTimestamp,
      plan: effectivePlanCode,
      planName: effectivePlanName,
      planTier: effectivePlanTier,
      status: 'active',
      features: keyObj?.features || { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
      limits: keyObj?.limits || { unlimited: true, maxConcurrency: 20 },
      licenseId: keyObj?.key || targetKey || 'LIC-ACTIVE',
      activationId: \`ACT-\${Date.now()}\`,
      machineCode: cleanMachine,
      tokenExpiresAt: expDate,
      licenseExpiresAt: expDate,
      offlineUntil: expDate,
      requiresUpdate: false
    };

    const tokenStr = signEntitlementToken(payload);
    return sendJson(res, 200, {
      valid: true,
      serverTime: new Date().toISOString(),
      entitlementToken: tokenStr,
      status: {
        state: 'active',
        valid: true,
        plan: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        machineCode: cleanMachine,
        expiresAt: expDate,
        features: payload.features,
        limits: payload.limits
      },
      licenseStatus: {
        state: 'active',
        valid: true,
        ...payload
      }
    });
  }

  `;

  code = code.substring(0, checkInIdx) + newCheckIn + code.substring(checkInEndIdx);
  console.log('[4] Updated Check-In endpoint');
}

// --- 5. UPDATE ACTIVATE ENDPOINT (Clear unlinked when activating new valid key) ---
const actIdx = code.indexOf('inMemoryStore.machines.set(cleanMachine, {');
if (actIdx !== -1) {
  const insertClearUnlinked = `inMemoryStore.unlinkedMachines.delete(cleanMachine);\n    `;
  if (!code.includes('inMemoryStore.unlinkedMachines.delete(cleanMachine);')) {
    code = code.substring(0, actIdx) + insertClearUnlinked + code.substring(actIdx);
    console.log('[5] Added unlinkedMachines.delete on successful activation');
  }
}

fs.writeFileSync(serverFile, code, 'utf8');
console.log('✅ All server endpoints updated successfully!');
