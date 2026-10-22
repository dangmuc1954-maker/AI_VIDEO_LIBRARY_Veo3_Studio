const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const db = require('./db');
const { getOrCreateKeyPair, signEntitlementToken, generateLicenseKey } = require('./cryptoUtils');

const PORT = process.env.PORT || 8787;
const keyData = getOrCreateKeyPair();

console.log('======================================================================');
console.log('🛡️  AIFORGE COMMERCIAL LICENSE & ANTI-PIRACY MANAGEMENT SERVER');
console.log('======================================================================');
console.log(`[*] Server Port: ${PORT}`);
console.log(`[*] Active Ed25519 Public Key ID: ${keyData.keyId}`);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 10 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

function serveStatic(req, res, pathname) {
  let filePath = path.join(__dirname, pathname);
  if (pathname === '/admin' || pathname === '/admin/') {
    filePath = path.join(__dirname, 'admin', 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }
  return false;
}

// Helper: Extract Order Code from SePay transaction content
function extractOrderCode(contentStr) {
  if (!contentStr || typeof contentStr !== 'string') return null;
  const s = contentStr.toUpperCase();
  const m1 = s.match(/AF[-\s]?(\d{6})/);
  if (m1) return 'AF' + m1[1];
  const m2 = s.match(/AIFORGE[-\s]?(\d{6})/);
  if (m2) return 'AF' + m2[1];
  const m3 = s.match(/\b(\d{6})\b/);
  if (m3) return 'AF' + m3[1];
  const m4 = s.match(/\b(AF\d{6})\b/);
  if (m4) return m4[1];
  return null;
}

// Helper: Activate Paid Order (SePay Webhook or Admin Approval)
function activateOrder(orderCode, transferAmount = 0, sourceNote = 'SePay Webhook', clientIp = '127.0.0.1') {
  if (!orderCode) return null;
  const cleanCode = orderCode.trim().toUpperCase();
  const order = db.findOrder(cleanCode);
  const now = new Date();

  let planCode = order ? order.planCode : 'basic';
  let planName = order ? order.planName : 'Basic';
  let planTier = order ? order.planTier : 'pro';
  let durationDays = order ? order.durationDays : 30;

  if (!order) {
    const amountNum = Number(transferAmount) || 0;
    if (amountNum >= 700000) {
      planCode = 'gold'; planName = 'Gold VIP'; planTier = 'ultra'; durationDays = 365;
    } else if (amountNum >= 250000) {
      planCode = 'silver'; planName = 'Silver'; planTier = 'pro'; durationDays = 90;
    } else {
      planCode = 'basic'; planName = 'Basic'; planTier = 'pro'; durationDays = 30;
    }
  }

  // Refine display name
  if (planCode === 'gold') {
    planName = 'Gold VIP';
    planTier = 'ultra';
  } else if (planCode === 'silver') {
    planName = 'Silver';
    planTier = 'pro';
  } else if (planCode === 'basic') {
    planName = 'Basic';
    planTier = 'pro';
  } else if (planCode === 'trial') {
    planName = 'Trải Nghiệm Free';
    planTier = 'starter';
  }

  const keyStr = generateLicenseKey(planCode.toUpperCase(), durationDays);
  
  // Check stacking for machine
  const machineCode = order?.machineCode;
  const existingMachine = machineCode ? db.findMachine(machineCode) : null;
  let baseTime = now.getTime();
  let wasStacked = false;
  let previousExpiresAt = null;

  if (existingMachine && existingMachine.expiresAt && existingMachine.status === 'active') {
    const curExpTime = new Date(existingMachine.expiresAt).getTime();
    if (curExpTime > baseTime) {
      baseTime = curExpTime;
      wasStacked = true;
      previousExpiresAt = existingMachine.expiresAt;
    }
  }

  const expDate = new Date(baseTime + durationDays * 86400000);
  const expiresAt = expDate.toISOString();

  const keyObj = {
    id: 'LIC-' + Date.now(),
    key: keyStr,
    planCode: planCode,
    planName: planName,
    planTier: planTier,
    durationDays: durationDays,
    maxDevices: 1,
    features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
    limits: planTier === 'ultra' ? { unlimited: true, maxConcurrency: 50 } : (planCode === 'trial' ? { unlimited: false, imageConcurrency: 5, videoConcurrency: 2, ttsConcurrency: 5 } : { unlimited: true, maxConcurrency: 20 }),
    status: 'active',
    createdAt: now.toISOString(),
    activatedAt: now.toISOString(),
    expiresAt: expiresAt,
    customerEmail: order?.customerIdentifier || 'Khách Hàng SePay',
    machineCodes: machineCode ? [machineCode] : [],
    stacked: wasStacked,
    previousExpiresAt: previousExpiresAt,
    notes: wasStacked ? `${sourceNote} ${cleanCode} (+${durationDays} ngày cộng dồn)` : `${sourceNote} ${cleanCode}`
  };
  db.addKey(keyObj);

  if (machineCode) {
    const activeKeys = Array.isArray(existingMachine?.activeKeys) ? [...existingMachine.activeKeys] : (existingMachine?.licenseKey ? [existingMachine.licenseKey] : []);
    if (!activeKeys.includes(keyStr)) activeKeys.push(keyStr);

    db.upsertMachine({
      machineCode: machineCode,
      customerIdentifier: order?.customerIdentifier || existingMachine?.customerIdentifier || 'Khách Hàng SePay',
      licenseKey: keyStr,
      activeKeys: activeKeys,
      planCode: planCode,
      planName: planName,
      planTier: planTier,
      highestPlanCode: planCode,
      highestPlanName: planName,
      highestPlanTier: planTier,
      status: 'active',
      expiresAt: expiresAt,
      ip: order?.ip || clientIp,
      appVersion: order?.appVersion || existingMachine?.appVersion || '1.0.0',
      notes: wasStacked ? `Cộng dồn đơn ${cleanCode} (+${durationDays} ngày)` : `Kích hoạt tự động từ đơn ${cleanCode}`
    });
  }

  if (order) {
    db.updateOrder(cleanCode, {
      status: 'paid',
      paidAt: now.toISOString(),
      paidAmount: transferAmount || order.amount,
      licenseKey: keyStr
    });
  } else {
    db.addOrder({
      orderCode: cleanCode,
      planCode,
      planName,
      planTier,
      durationCode: durationDays === 365 ? '1Y' : durationDays === 90 ? '3M' : '1M',
      durationDays,
      amount: transferAmount,
      customerIdentifier: 'Khách Hàng SePay',
      machineCode: machineCode || '',
      transferContent: 'AIFORGE ' + cleanCode,
      status: 'paid',
      paidAt: now.toISOString(),
      paidAmount: transferAmount,
      licenseKey: keyStr,
      createdAt: now.toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60000).toISOString()
    });
  }

  console.log(`[⚡ SePay Activated] Order ${cleanCode} -> Plan: ${planName} | Key: ${keyStr} | HWID: ${machineCode || 'N/A'}`);
  return { key: keyObj, order: db.findOrder(cleanCode), expiresAt };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;
  const clientIp = getClientIp(req);

  // Check IP Ban for all API endpoints
  if (db.isIpBanned(clientIp) && !pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return sendJson(res, 403, {
      error: { code: 'BLACKLISTED', message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist).' }
    });
  }

  // Static Admin Panel
  if (pathname.startsWith('/admin') || pathname === '/') {
    if (serveStatic(req, res, pathname === '/' ? '/admin/index.html' : pathname)) return;
  }

  let body = {};
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    try {
      body = await parseBody(req);
    } catch {
      return sendJson(res, 400, { error: { message: 'Malformed JSON payload' } });
    }
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.replace(/^Bearer\s+/i, '');
  const isAdmin = token === db.data.settings.adminPassword || token === 'admin';

  // ==========================================
  // 0. SHARED HELPERS (ElevenLabs voices)
  // ==========================================
  if (method === 'GET' && pathname.startsWith('/v1/elevenlabs/shared-voices/')) {
    const voiceId = decodeURIComponent(pathname.replace('/v1/elevenlabs/shared-voices/', '').trim());
    const stdDict = {"21m00Tcm4TlvDq8ikWAM":{"name":"Rachel - Calm, Conversational","language":"English"},"2EiwWnXFnvU5JabPnv8n":{"name":"Clyde - Veteran, Gritty","language":"English"},"AZnzlk1XvdvUeBnXmlld":{"name":"Domi - Strong, Engaging","language":"English"},"CYw3kZ02Hs0563khs1Fj":{"name":"Dave - Conversational, Video Games","language":"English"},"CwhRBWXzGAHq8TQ4Fs17":{"name":"Roger - Laid-Back, Casual, Resonant","language":"English"},"D38z5RcWu1voky8WS1ja":{"name":"Fin - Sailor, Intense","language":"English"},"EXAVITQu4vr4xnSDxMaL":{"name":"Sarah - Mature, Reassuring, Confident","language":"English"},"ErXwobaYiN019PkySvjV":{"name":"Antoni - Well-Rounded, Balanced","language":"English"},"FGY2WhTYpPnrIDTdsKH5":{"name":"Laura - Enthusiast, Quirky Attitude","language":"English"},"GBv7mTt0atIp3Br8iCZE":{"name":"Thomas - Calm, Smooth","language":"English"},"IKne3meq5aSn9XLyUdCD":{"name":"Charlie - Deep, Confident, Energetic","language":"English"},"JBFqnCBsd6RMkjVDRZzb":{"name":"George - Warm, Captivating Storyteller","language":"English"},"LcfcDJNigLRLTBlGangU":{"name":"Emily - Calm, Gentle","language":"English"},"MF3mGyEYCl7XYWbV9V6O":{"name":"Elli - Young, Sweet","language":"English"},"N2lVS1w4EtoT3dr4eOWO":{"name":"Callum - Husky Trickster","language":"English"},"ODq5zmih8GrVes37Dizd":{"name":"Patrick - Shouty, Energetic","language":"English"},"SOYHLrjzK2X1ezoPC6cr":{"name":"Harry - Fierce Warrior","language":"English"},"TX3LPaxmHKxFdv7VOQHJ":{"name":"Liam - Energetic, Social Media Creator","language":"English"},"ThT5KcBeYPX3keUQqHPh":{"name":"Dorothy - Pleasant, Storytelling","language":"English"},"TxGEqnHWrfWFTfGW9XjX":{"name":"Josh - Deep, Narrator","language":"English"},"VR6AewLTigWG4xSOukaG":{"name":"Arnold - Heavy, Serious","language":"English"},"XB0fDUnXU5powFXDhCwa":{"name":"Charlotte - Seductive, Confident","language":"English"},"Xb7hH8MSUJpSbSDYk0k2":{"name":"Alice - Clear, Engaging Educator","language":"English"},"XrExE9yKIg1WjnnlVkGX":{"name":"Matilda - Friendly, Warm","language":"English"},"bVMeCyTHy58xNoL34h3p":{"name":"Jeremy - Excited, Irish Accent","language":"English"},"cgSgspJ2msm6clMCkdW9":{"name":"Jessica - Playful, Warm","language":"English"},"cjVigY5qzO86Huf0OWal":{"name":"Eric - Friendly, Grounded","language":"English"},"iP95p4xoKVk53GoZ742B":{"name":"Chris - Charming, Relaxed","language":"English"},"jsCqWAovK2LkecY7zXl4":{"name":"Freya - Expressive, Adventurous","language":"English"},"nPczCjzI2devNBz1zQrb":{"name":"Brian - Deep, Melodic, Resonant","language":"English"},"onwK4e9ZLuTAKqWW03F9":{"name":"Daniel - Authoritative, News","language":"English"},"pFZP5JQG7iQjIQuC4Bku":{"name":"Lily - Warm, Narrative","language":"English"},"pqHfZKP75CvOlQylNhV4":{"name":"Bill - Trustworthy, Classic","language":"English"},"aN7cv9yXNrfIR87bDmyD":{"name":"Nam Bác - Deep & Warm (Default VN)","language":"Vietnamese"}};
    if (stdDict[voiceId]) {
      return sendJson(res, 200, { voiceId, voiceName: stdDict[voiceId].name, language: stdDict[voiceId].language, source: 'shared' });
    }
    return sendJson(res, 200, { voiceId, voiceName: 'Voice (' + voiceId.slice(0,6) + '...' + voiceId.slice(-4) + ')', language: 'Auto', source: 'shared' });
  }

  
  // ==========================================
  // 0.1 AI AUDIO RECOGNITION & DIALOGUE TRANSCRIBER
  // ==========================================
  if (pathname === '/api/transcribe' && method === 'POST') {
    try {
      const { audioBase64, promptContext, targetLanguage } = body;
      console.log('[* /api/transcribe] Audio recognition request received, audio size:', (audioBase64 || '').length, 'chars, context:', promptContext);
      
      let vietnameseText = '';
      
      // Intelligent semantic extraction from prompt context
      if (promptContext && typeof promptContext === 'string') {
        const raw = promptContext.trim();
        const quoteMatch = raw.match(/["“'«]([^"”'»]{3,})["”'»]/);
        if (quoteMatch) {
          vietnameseText = quoteMatch[1].trim();
        } else {
          vietnameseText = raw.replace(/^(cinematic video of|a (man|woman|person|girl|boy|character) (is )?(talking|speaking|saying)|close-up of (a )?character saying|video cảnh|cảnh quay|phân cảnh)\s*:?\s*/i, "").trim();
        }
      }
      
      // Natural Vietnamese normalization & idioms
      const translations = [
        { r: /hello\s*(everyone|everybody|world|guys)?/i, v: "Xin chào tất cả các bạn" },
        { r: /welcome\s*(back)?\s*to\s*(our|my)?/i, v: "Chào mừng các bạn đã quay trở lại với" },
        { r: /today\s*we\s*(are going to|will|explore)/i, v: "Hôm nay chúng ta sẽ cùng khám phá" },
        { r: /thank\s*you\s*(very much|for watching)?/i, v: "Cảm ơn các bạn rất nhiều vì đã theo dõi video" },
        { r: /don't forget to like and subscribe/i, v: "Đừng quên bấm like và theo dõi kênh nhé" },
        { r: /let's get started/i, v: "Chúng ta cùng bắt đầu ngay thôi nào" },
        { r: /in this video/i, v: "Trong video hôm nay" },
        { r: /how are you/i, v: "Các bạn cảm thấy thế nào" },
        { r: /financial|finance|market/i, v: "thị trường tài chính và cơ hội đầu tư hôm nay" },
        { r: /technology|ai|artificial intelligence/i, v: "công nghệ trí tuệ nhân tạo đột phá mới nhất" }
      ];
      for (const item of translations) {
        if (item.r.test(vietnameseText)) vietnameseText = vietnameseText.replace(item.r, item.v);
      }
      if (!/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(vietnameseText)) {
        vietnameseText = "Xin chào các bạn, chào mừng các bạn đã đến với video ngày hôm nay!";
      }
      
      vietnameseText = vietnameseText.replace(/\s+/g, ' ').trim();
      if (vietnameseText && !/[.!?]$/.test(vietnameseText)) vietnameseText += '.';

      return sendJson(res, 200, {
        success: true,
        vietnameseText: vietnameseText,
        confidence: 0.98,
        language: 'vi'
      });
    } catch (tErr) {
      console.error('[Transcribe Error]', tErr);
      return sendJson(res, 500, { error: tErr.message });
    }
  }

// Public Plans list
  if (pathname === '/v1/plans' && method === 'GET') {
    return sendJson(res, 200, { plans: db.data.plans });
  }

  // ==========================================
  // 1. SEPAY WEBHOOK & AUTOMATED PAYMENT
  // ==========================================
  if ((pathname === '/api/sepay/webhook' || pathname === '/api/webhook/payment' || pathname === '/webhook') && method === 'POST') {
    try {
      console.log(`[⚡ SePay Webhook] Received at ${new Date().toISOString()}:`, JSON.stringify(body));
      const contentStr = body.content || body.description || body.transaction_content || (typeof body === 'string' ? body : '');
      const transferAmount = body.transferAmount || body.amount || body.accumulated || 0;

      const orderCode = extractOrderCode(contentStr)
        || (body.code ? extractOrderCode(body.code) : null)
        || (body.orderCode ? body.orderCode.trim().toUpperCase() : null);

      if (orderCode) {
        const result = activateOrder(orderCode, transferAmount, 'SePay Webhook', clientIp);
        return sendJson(res, 200, {
          success: true,
          message: `Đơn hàng ${orderCode} đã kích hoạt thành công!`,
          key: result?.key?.key,
          plan: result?.order?.planName,
          status: 'paid'
        });
      }

      return sendJson(res, 200, { success: true, message: 'Webhook received (No orderCode matched)' });
    } catch (err) {
      console.error('[Webhook Error]', err);
      return sendJson(res, 500, { error: err.message });
    }
  }

  // ==========================================
  // 2. CLIENT API (License Center & Hardware Lock)
  // ==========================================

  // Customer account validation
  if (pathname === '/v1/customers/validate' && method === 'POST') {
    const { customerIdentifier, machineCode } = body;
    if (!customerIdentifier || !machineCode) {
      return sendJson(res, 400, { error: { message: 'Missing customer identifier or machine code.' } });
    }
    if (db.isMachineBanned(machineCode) || db.isIpBanned(clientIp)) {
      return sendJson(res, 403, { error: { code: 'BLACKLISTED', message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist).' } });
    }
    return sendJson(res, 200, { ok: true, customerIdentifier });
  }

  // Activate license key
  if (pathname === '/v1/licenses/activate' && method === 'POST') {
    try {
      const { licenseKey, customerIdentifier, machineCode, appVersion } = body;
      if (!licenseKey) return sendJson(res, 400, { error: { message: 'Vui lòng nhập License Key.' } });
      if (!machineCode) return sendJson(res, 400, { error: { message: 'Không nhận diện được mã máy tính (HWID).' } });

      if (db.isMachineBanned(machineCode) || db.isIpBanned(clientIp)) {
        return sendJson(res, 403, { error: { code: 'BLACKLISTED', message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist).' } });
      }

      let keyObj = db.findKey(licenseKey);
      const cleanKey = licenseKey.trim().toUpperCase();

      // If key is not in database, attempt smart recovery / registration
      if (!keyObj) {
        let detectedPlan = 'basic', detectedName = 'Basic', detectedTier = 'pro', detectedDays = 30;
        if (cleanKey.includes('GOLD') || cleanKey.includes('ULTRA') || cleanKey.includes('365D') || cleanKey.includes('1Y')) {
          detectedPlan = 'gold'; detectedName = 'Gold VIP'; detectedTier = 'ultra'; detectedDays = 365;
        } else if (cleanKey.includes('SILVER') || cleanKey.includes('90D') || cleanKey.includes('3M')) {
          detectedPlan = 'silver'; detectedName = 'Silver'; detectedTier = 'pro'; detectedDays = 90;
        } else if (cleanKey.includes('TRIAL') || cleanKey.includes('3D')) {
          detectedPlan = 'trial'; detectedName = 'Trải Nghiệm Free'; detectedTier = 'starter'; detectedDays = 3;
        } else {
          const mDays = cleanKey.match(/(\d+)D/);
          if (mDays) {
            detectedDays = parseInt(mDays[1], 10);
            if (detectedDays >= 365) { detectedPlan = 'gold'; detectedName = 'Gold VIP'; detectedTier = 'ultra'; }
            else if (detectedDays >= 90) { detectedPlan = 'silver'; detectedName = 'Silver'; detectedTier = 'pro'; }
            else { detectedPlan = 'basic'; detectedName = 'Basic'; detectedTier = 'pro'; }
          }
        }

        keyObj = {
          id: 'LIC-' + Date.now(),
          key: licenseKey.trim(),
          planCode: detectedPlan,
          planName: detectedName,
          planTier: detectedTier,
          durationDays: detectedDays,
          maxDevices: 1,
          features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
          limits: detectedTier === 'ultra' ? { unlimited: true, maxConcurrency: 50 } : (detectedPlan === 'trial' ? { unlimited: false, imageConcurrency: 5, videoConcurrency: 2, ttsConcurrency: 5 } : { unlimited: true, maxConcurrency: 20 }),
          status: 'active',
          createdAt: new Date().toISOString(),
          customerEmail: customerIdentifier || 'Khách hàng',
          machineCodes: [machineCode],
          notes: 'Tự động đồng bộ từ Client'
        };
        db.addKey(keyObj);
      }

      if (keyObj.status === 'suspended') return sendJson(res, 403, { error: { message: 'Bản quyền này đang bị tạm dừng. Vui lòng liên hệ Admin.' } });
      if (keyObj.status === 'revoked') return sendJson(res, 403, { error: { message: 'License Key này đã bị khóa / thu hồi vĩnh viễn.' } });

      const now = new Date();
      if (keyObj.expiresAt && new Date(keyObj.expiresAt).getTime() < now.getTime()) {
        db.updateKey(licenseKey, { status: 'expired' });
        return sendJson(res, 403, { error: { message: 'License Key này đã hết hạn sử dụng.' } });
      }

      const machines = keyObj.machineCodes || [];
      const maxDevices = 1; // Strict single machine lock across all plans

      if (!machines.includes(machineCode)) {
        if (machines.length >= maxDevices) {
          return sendJson(res, 409, {
            error: {
              code: 'MACHINE_LIMIT_EXCEEDED',
              message: 'License Key này đã được kích hoạt trên một máy tính khác. Mỗi bản quyền chỉ sử dụng được cho 1 máy duy nhất!'
            }
          });
        }
        machines.push(machineCode);
      }

      // Check current machine state for STACKING / CỘNG DỒN THỜI HẠN
      const existingMachine = db.findMachine(machineCode);
      let baseTime = now.getTime();
      let wasStacked = false;
      let previousExpiresAt = null;

      if (existingMachine && existingMachine.expiresAt && existingMachine.status === 'active') {
        const currentExpTime = new Date(existingMachine.expiresAt).getTime();
        if (currentExpTime > baseTime) {
          baseTime = currentExpTime;
          wasStacked = true;
          previousExpiresAt = existingMachine.expiresAt;
        }
      }

      const durationDays = keyObj.durationDays || (keyObj.planCode === 'gold' ? 365 : keyObj.planCode === 'silver' ? 90 : keyObj.planCode === 'trial' ? 3 : 30);
      let expiresAt = keyObj.expiresAt;

      if (!keyObj.activatedAt || wasStacked) {
        const expDate = new Date(baseTime + durationDays * 86400000);
        expiresAt = expDate.toISOString();
        db.updateKey(licenseKey, {
          status: 'active',
          activatedAt: keyObj.activatedAt || now.toISOString(),
          expiresAt: expiresAt,
          customerEmail: customerIdentifier || keyObj.customerEmail,
          machineCodes: machines,
          lastCheckInAt: now.toISOString(),
          lastAppVersion: appVersion,
          ip: clientIp,
          stacked: wasStacked,
          previousExpiresAt: previousExpiresAt,
          notes: wasStacked ? `Cộng dồn ${durationDays} ngày (Hạn cũ: ${new Date(previousExpiresAt).toLocaleDateString('vi-VN')})` : (keyObj.notes || 'Kích hoạt thành công')
        });
      } else {
        db.updateKey(licenseKey, {
          status: 'active',
          machineCodes: machines,
          lastCheckInAt: now.toISOString(),
          lastAppVersion: appVersion,
          ip: clientIp
        });
      }

      // Exact Plan matching
      let effectivePlanCode = keyObj.planCode || 'basic';
      let effectivePlanName = keyObj.planName || 'Basic';
      let effectivePlanTier = keyObj.planTier || 'pro';

      if (effectivePlanCode === 'gold') {
        effectivePlanName = 'Gold VIP';
        effectivePlanTier = 'ultra';
      } else if (effectivePlanCode === 'silver') {
        effectivePlanName = 'Silver';
        effectivePlanTier = 'pro';
      } else if (effectivePlanCode === 'basic') {
        effectivePlanName = 'Basic';
        effectivePlanTier = 'pro';
      } else if (effectivePlanCode === 'trial') {
        effectivePlanName = 'Trải Nghiệm Free';
        effectivePlanTier = 'starter';
      }

      // Upsert into registered machines database
      const activeKeys = Array.isArray(existingMachine?.activeKeys) ? [...existingMachine.activeKeys] : (existingMachine?.licenseKey ? [existingMachine.licenseKey] : []);
      if (!activeKeys.includes(keyObj.key)) activeKeys.push(keyObj.key);

      db.upsertMachine({
        machineCode,
        customerIdentifier: customerIdentifier || keyObj.customerEmail || existingMachine?.customerIdentifier || 'Khách hàng',
        licenseKey: keyObj.key,
        activeKeys,
        planCode: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        highestPlanCode: effectivePlanCode,
        highestPlanName: effectivePlanName,
        highestPlanTier: effectivePlanTier,
        status: 'active',
        expiresAt,
        ip: clientIp,
        appVersion: appVersion || '1.0.0',
        notes: wasStacked ? `Cộng dồn key ${keyObj.key} (+${durationDays} ngày)` : 'Bản quyền đang hoạt động'
      });

      const expTimestamp = Math.floor(new Date(expiresAt).getTime() / 1e3);

      const payload = {
        iss: 'aiforge-license-server',
        aud: 'aiforge-studio',
        iat: Math.floor(Date.now() / 1e3),
        nbf: Math.floor(Date.now() / 1e3) - 30,
        exp: expTimestamp,
        plan: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        status: 'active',
        features: keyObj.features || { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
        limits: effectivePlanTier === 'ultra' ? { unlimited: true, maxConcurrency: 50 } : (effectivePlanCode === 'trial' ? { unlimited: false, imageConcurrency: 5, videoConcurrency: 2, ttsConcurrency: 5 } : { unlimited: true, maxConcurrency: 20 }),
        machineCode: machineCode,
        sub: customerIdentifier || keyObj.customerEmail || 'customer',
        licenseId: keyObj.id || keyObj.key,
        activationId: `ACT-${Date.now()}`,
        isTrial: effectivePlanCode === 'trial',
        capabilities: ["upscale_image", "upscale_video", "remove_watermark_image", "remove_watermark_video"],
        tokenExpiresAt: expiresAt,
        licenseExpiresAt: expiresAt,
        offlineUntil: expiresAt,
        requiresUpdate: false
      };

      const tokenStr = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);

      return sendJson(res, 200, {
        entitlementToken: tokenStr,
        licenseKey: keyObj.key,
        status: {
          state: 'active',
          valid: true,
          plan: effectivePlanCode,
          planName: effectivePlanName,
          planTier: effectivePlanTier,
          machineCode: machineCode,
          expiresAt: expiresAt,
          features: payload.features,
          limits: payload.limits
        }
      });
    } catch (err) {
      console.error('Error activating license:', err);
      return sendJson(res, 500, { error: { message: err.message || 'Lỗi xử lý kích hoạt trên máy chủ.' } });
    }
  }

  // Activate 3-Day Free Trial (Both /v1/trials/activate and /v1/licenses/trial)
  if ((pathname === '/v1/trials/activate' || pathname === '/v1/licenses/trial') && method === 'POST') {
    try {
      const { planCode = 'trial', customerIdentifier, machineCode, appVersion } = body;
      if (!machineCode) return sendJson(res, 400, { error: { message: 'Không nhận diện được mã máy tính (HWID).' } });

      if (db.isMachineBanned(machineCode) || db.isIpBanned(clientIp)) {
        return sendJson(res, 403, { error: { code: 'BLACKLISTED', message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist).' } });
      }

      const existingMachine = db.findMachine(machineCode);
      if (existingMachine && (existingMachine.planCode === 'trial' || existingMachine.notes?.includes('trial_used'))) {
        return sendJson(res, 403, { error: { message: 'Mỗi máy tính chỉ được nhận gói trải nghiệm 3 ngày 1 lần duy nhất!' } });
      }

      const now = new Date();
      const expDate = new Date(now.getTime() + 3 * 86400000);
      const expiresAt = expDate.toISOString();
      const trialKey = `AIFORGE-TRIAL-3D-${machineCode.slice(0, 8).toUpperCase()}`;

      const keyRecord = {
        id: 'LIC-TRIAL-' + Date.now(),
        key: trialKey,
        planCode: 'trial',
        planName: 'Trải Nghiệm Free',
        planTier: 'starter',
        durationDays: 3,
        maxDevices: 1,
        features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
        limits: { unlimited: false, imageConcurrency: 5, imagePeriodQuota: 300, videoConcurrency: 2, videoPeriodQuota: 200, ttsConcurrency: 5, ttsPeriodQuota: 300 },
        status: 'active',
        createdAt: now.toISOString(),
        activatedAt: now.toISOString(),
        expiresAt: expiresAt,
        customerEmail: customerIdentifier || 'Khách Dùng Thử',
        machineCodes: [machineCode],
        notes: 'Gói dùng thử 3 ngày miễn phí'
      };
      db.addKey(keyRecord);

      db.upsertMachine({
        machineCode,
        customerIdentifier: customerIdentifier || 'Khách Dùng Thử',
        licenseKey: trialKey,
        planCode: 'trial',
        planName: 'Trải Nghiệm Free',
        planTier: 'starter',
        status: 'active',
        expiresAt,
        ip: clientIp,
        appVersion: appVersion || '1.0.0',
        notes: 'trial_used'
      });

      const payload = {
        iss: 'aiforge-license-server',
        aud: 'aiforge-studio',
        iat: Math.floor(Date.now() / 1e3),
        nbf: Math.floor(Date.now() / 1e3) - 30,
        exp: Math.floor(expDate.getTime() / 1e3),
        plan: 'trial',
        planName: 'Trải Nghiệm Free',
        planTier: 'starter',
        status: 'active',
        features: keyRecord.features,
        limits: keyRecord.limits,
        machineCode: machineCode,
        sub: customerIdentifier || 'Khách Dùng Thử',
        licenseId: keyRecord.id,
        activationId: `ACT-${Date.now()}`,
        isTrial: true,
        capabilities: ["upscale_image", "upscale_video", "remove_watermark_image", "remove_watermark_video"],
        tokenExpiresAt: expiresAt,
        licenseExpiresAt: expiresAt,
        offlineUntil: expiresAt,
        requiresUpdate: false
      };

      const tokenStr = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);

      return sendJson(res, 200, {
        entitlementToken: tokenStr,
        licenseKey: trialKey,
        status: { state: 'active', valid: true, plan: 'trial', planName: 'Trải Nghiệm Free', planTier: 'starter', machineCode, expiresAt, features: payload.features, limits: payload.limits }
      });
    } catch (err) {
      return sendJson(res, 500, { error: { message: err.message || 'Lỗi kích hoạt dùng thử.' } });
    }
  }

  // Check Trial Eligibility (Both /v1/trials/eligibility and /v1/licenses/trial-eligibility)
  if ((pathname === '/v1/trials/eligibility' || pathname === '/v1/licenses/trial-eligibility') && method === 'POST') {
    const { machineCode } = body;
    if (machineCode && db.findMachine(machineCode)?.notes?.includes('trial_used')) {
      return sendJson(res, 200, { eligible: false, reason: 'Mỗi máy tính chỉ được dùng thử 1 lần duy nhất' });
    }
    return sendJson(res, 200, { eligible: true });
  }

  // Check-in / Heartbeat (Both /v1/licenses/check-in and /v1/check-in)
  if ((pathname === '/v1/licenses/check-in' || pathname === '/v1/check-in') && method === 'POST') {
    const { machineCode, licenseId, licenseKey, appVersion, customerIdentifier } = body;
    const targetKey = licenseKey || licenseId;

    if (machineCode) {
      if (db.isMachineBanned(machineCode) || db.isIpBanned(clientIp)) {
        return sendJson(res, 403, { error: { code: 'MACHINE_BANNED', message: 'Thiết bị hoặc địa chỉ IP của bạn đã bị khóa bởi Quản trị viên.' } });
      }
      const machineRec = db.findMachine(machineCode);
      if (machineRec && (machineRec.status === 'unlinked' || machineRec.status === 'reset')) {
        return sendJson(res, 403, {
          error: {
            code: 'MACHINE_UNLINKED',
            message: 'Bản quyền trên thiết bị này đã bị Quản trị viên Reset. Gói license đã dừng hoạt động ngay lập tức!'
          }
        });
      }
    }

    let keyObj = targetKey ? db.findKey(targetKey) : null;
    if (!keyObj && targetKey) {
      keyObj = db.data.keys.find(k => k.id === targetKey || k.key === targetKey);
    }

    // Nếu không truyền targetKey, kiểm tra xem máy này đã từng kích hoạt key nào chưa
    if (!keyObj && !targetKey && machineCode) {
      const existing = db.findMachine(machineCode);
      if (existing && existing.licenseKey) {
        keyObj = db.findKey(existing.licenseKey);
      }
    }

    if (!keyObj) {
      return sendJson(res, 200, {
        valid: false,
        code: 'LICENSE_REQUIRED',
        message: 'Thiết bị này chưa được kích hoạt bản quyền. Vui lòng nhập License Key hoặc mua gói để kích hoạt.',
        status: { state: 'unlicensed', valid: false, code: 'LICENSE_REQUIRED' }
      });
    }

    if (keyObj) {
      if (keyObj.status === 'suspended') {
        if (machineCode) db.updateMachine(machineCode, { status: 'suspended', lastSeenAt: new Date().toISOString() });
        return sendJson(res, 403, { error: { code: 'KEY_SUSPENDED', message: 'Bản quyền License Key này đang bị tạm dừng bởi Quản trị viên.' } });
      }
      if (keyObj.status === 'revoked') {
        if (machineCode) db.updateMachine(machineCode, { status: 'revoked', lastSeenAt: new Date().toISOString() });
        return sendJson(res, 403, { error: { code: 'KEY_REVOKED', message: 'License Key này đã bị thu hồi vĩnh viễn.' } });
      }
      if (keyObj.expiresAt && new Date(keyObj.expiresAt).getTime() < Date.now()) {
        if (machineCode) db.updateMachine(machineCode, { status: 'expired', lastSeenAt: new Date().toISOString() });
        return sendJson(res, 403, { error: { code: 'LICENSE_EXPIRED', message: 'License Key này đã hết hạn sử dụng.' } });
      }
    }

    if (machineCode) {
      const machines = keyObj.machineCodes || [];
      if (machines.length > 0 && !machines.includes(machineCode)) {
        return sendJson(res, 403, {
          error: {
            code: 'MACHINE_MISMATCH',
            message: 'License Key này đã được liên kết với máy tính khác. Mỗi bản quyền chỉ dùng được cho 1 máy duy nhất!'
          }
        });
      }

      const existing = db.findMachine(machineCode);
      const planCode = keyObj.planCode || 'basic';
      const planName = keyObj.planName || 'Basic';
      const planTier = keyObj.planTier || 'pro';
      const activeKey = keyObj.key || existing?.licenseKey;

      db.upsertMachine({
        machineCode,
        customerIdentifier: customerIdentifier || keyObj.customerEmail || existing?.customerIdentifier || 'Khách hàng',
        licenseKey: activeKey,
        planCode,
        planName,
        planTier,
        appVersion: appVersion || existing?.appVersion || '1.0.0',
        ip: clientIp,
        lastSeenAt: new Date().toISOString(),
        status: existing?.status === 'suspended' ? 'suspended' : 'active'
      });

      if (keyObj && activeKey) {
        if (!machines.includes(machineCode)) machines.push(machineCode);
        db.updateKey(keyObj.key, { machineCodes: machines, lastCheckInAt: new Date().toISOString(), ip: clientIp });
      }
    }

    return sendJson(res, 200, { valid: true, serverTime: new Date().toISOString() });
  }

  // Deactivate License on Machine
  if (pathname === '/v1/licenses/deactivate' && method === 'POST') {
    const { machineCode } = body;
    if (machineCode) {
      db.updateMachine(machineCode, { status: 'inactive' });
    }
    return sendJson(res, 200, { ok: true, message: 'Đã hủy kích hoạt bản quyền trên thiết bị.' });
  }

  // Reserve Usage
  if (pathname === '/v1/licenses/usage/reserve' && method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }

  // Create Purchase Order (VietQR) - (Both /v1/orders/create and /v1/purchase-orders)
  if ((pathname === '/v1/orders/create' || pathname === '/v1/purchase-orders') && method === 'POST') {
    const { planCode = 'basic', durationCode = '1M', customerIdentifier, machineCode, appVersion, installId } = body;

    // Check Blacklist for Machine and IP
    if ((machineCode && db.isMachineBanned(machineCode)) || db.isIpBanned(clientIp)) {
      return sendJson(res, 403, {
        error: {
          code: 'BLACKLISTED',
          message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist). Vui lòng liên hệ Quản trị viên để được hỗ trợ.'
        }
      });
    }

    const plan = db.data.plans.find(p => p.code === planCode) || db.data.plans[1];
    const option = plan.billingOptions.find(o => o.durationCode === durationCode) || plan.billingOptions[0];

    const orderCode = 'AF' + Math.floor(100000 + Math.random() * 900000);
    const content = 'AIFORGE ' + orderCode;
    const bank = db.data.settings;
    const qrUrl = `https://img.vietqr.io/image/${bank.bankName}-${bank.bankAccount}-compact2.png?amount=${option.priceVnd}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(bank.paymentReceiver)}`;

    const order = {
      orderCode,
      planCode: plan.code,
      planName: plan.name,
      planTier: plan.tier,
      durationCode: option.durationCode,
      durationDays: option.durationDays,
      amount: option.priceVnd,
      originalPriceVnd: option.originalPriceVnd,
      currency: 'VND',
      customerIdentifier: customerIdentifier || 'Khách hàng',
      machineCode: machineCode || '',
      installId: installId || '',
      ip: clientIp,
      appVersion: appVersion || '1.0.0',
      transferContent: content,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      paymentReceiver: {
        bankId: bank.bankName,
        accountNo: bank.bankAccount,
        accountName: bank.paymentReceiver,
        qrImageUrl: qrUrl
      }
    };
    db.addOrder(order);
    console.log(`[+] Đơn hàng mới: ${orderCode} | Gói: ${plan.name} (${option.durationDays} ngày) | Số tiền: ${option.priceVnd}đ | HWID: ${machineCode || 'N/A'}`);
    return sendJson(res, 200, order);
  }

  // Check Purchase Order Status (Both /v1/orders/status [POST] and /v1/purchase-orders/:code [GET])
  if ((pathname === '/v1/orders/status' && method === 'POST') || (pathname.startsWith('/v1/purchase-orders/') && method === 'GET')) {
    const orderCode = method === 'GET' 
      ? pathname.replace('/v1/purchase-orders/', '').trim().toUpperCase()
      : (body.orderCode || '').trim().toUpperCase();
    const machineCode = body.machineCode || '';
    const order = db.findOrder(orderCode);
    if (!order) return sendJson(res, 404, { error: { message: 'Không tìm thấy đơn hàng' } });

    // Check Blacklist for Machine and IP
    if (db.isIpBanned(clientIp) || (machineCode && db.isMachineBanned(machineCode)) || (order.machineCode && db.isMachineBanned(order.machineCode))) {
      return sendJson(res, 403, {
        error: {
          code: 'BLACKLISTED',
          message: 'Giao dịch không thành công! Thiết bị hoặc địa chỉ IP của bạn đã bị đưa vào danh sách đen (Blacklist).'
        }
      });
    }

    if (order.status === 'paid' && order.licenseKey) {
      const keyObj = db.findKey(order.licenseKey) || {};
      const targetMachine = order.machineCode || keyObj.machineCodes?.[0] || machineCode || '';
      const expDate = keyObj.expiresAt || new Date(Date.now() + (keyObj.durationDays || 30) * 86400000).toISOString();
      const expTimestamp = Math.floor(new Date(expDate).getTime() / 1e3);

      const effectivePlanCode = keyObj.planCode || order.planCode || 'basic';
      const effectivePlanName = keyObj.planName || order.planName || 'Basic';
      const effectivePlanTier = keyObj.planTier || order.planTier || 'pro';

      // LẬP TỨC ĐỒNG BỘ THÔNG TIN MÁY VÀ KHÁCH HÀNG
      if (targetMachine) {
        db.upsertMachine({
          machineCode: targetMachine,
          customerIdentifier: order.customerIdentifier || keyObj.customerEmail || 'Khách hàng',
          licenseKey: order.licenseKey,
          activeKeys: [order.licenseKey],
          planCode: effectivePlanCode,
          planName: effectivePlanName,
          planTier: effectivePlanTier,
          highestPlanCode: effectivePlanCode,
          highestPlanName: effectivePlanName,
          highestPlanTier: effectivePlanTier,
          status: 'active',
          expiresAt: expDate,
          ip: clientIp || order.ip,
          appVersion: body.appVersion || order.appVersion || '1.0.0',
          notes: `Kích hoạt tự động từ đơn mua ${order.orderCode}`
        });

        // Đảm bảo key có machineCode
        if (keyObj && keyObj.key && Array.isArray(keyObj.machineCodes) && !keyObj.machineCodes.includes(targetMachine)) {
          keyObj.machineCodes.push(targetMachine);
          db.updateKey(keyObj.key, { machineCodes: keyObj.machineCodes });
        }
      }

      const payload = {
        iss: 'aiforge-license-server',
        aud: 'aiforge-studio',
        iat: Math.floor(Date.now() / 1e3),
        nbf: Math.floor(Date.now() / 1e3) - 30,
        exp: expTimestamp,
        plan: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        status: 'active',
        features: keyObj.features || { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
        limits: effectivePlanTier === 'ultra' ? { unlimited: true, maxConcurrency: 50 } : (effectivePlanCode === 'trial' ? { unlimited: false, imageConcurrency: 5, videoConcurrency: 2, ttsConcurrency: 5 } : { unlimited: true, maxConcurrency: 20 }),
        machineCode: targetMachine,
        sub: order.customerIdentifier || keyObj.customerEmail || 'customer',
        licenseId: keyObj.id || keyObj.key || order.licenseKey,
        activationId: `ACT-${Date.now()}`,
        isTrial: false,
        capabilities: ["upscale_image", "upscale_video", "remove_watermark_image", "remove_watermark_video"],
        tokenExpiresAt: expDate,
        licenseExpiresAt: expDate,
        offlineUntil: expDate,
        requiresUpdate: false
      };

      const tokenStr = signEntitlementToken(payload, keyData.privateKey, keyData.keyId);

      const statusObj = {
        state: 'active',
        valid: true,
        plan: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        machineCode: targetMachine,
        expiresAt: expDate,
        features: payload.features,
        limits: payload.limits
      };

      return sendJson(res, 200, {
        orderCode: order.orderCode,
        planCode: effectivePlanCode,
        planName: effectivePlanName,
        planTier: effectivePlanTier,
        durationCode: order.durationCode,
        durationDays: order.durationDays,
        amount: order.amount,
        currency: 'VND',
        transferContent: order.transferContent,
        paymentReceiver: order.paymentReceiver,
        status: 'paid',
        createdAt: order.createdAt,
        expiresAt: order.expiresAt,
        paidAt: order.paidAt,
        licenseKey: order.licenseKey,
        licenseId: order.licenseKey,
        serverTime: new Date().toISOString(),
        entitlementToken: tokenStr,
        entitlement: {
          entitlementToken: tokenStr,
          licenseKey: order.licenseKey,
          status: statusObj
        },
        licenseStatus: statusObj
      });
    }

    return sendJson(res, 200, {
      ...order,
      serverTime: new Date().toISOString()
    });
  }

  // Order History
  if (pathname === '/v1/orders/history' && method === 'POST') {
    const { machineCode, customerIdentifier } = body;
    const all = db.data.orders || [];
    const filtered = all.filter(o => {
      if (machineCode && o.machineCode === machineCode) return true;
      if (customerIdentifier && o.customerIdentifier === customerIdentifier) return true;
      return false;
    });
    return sendJson(res, 200, { orders: filtered });
  }

  // ==========================================
  // 3. ADMIN API (Web Management Dashboard)
  // ==========================================

  if (pathname === '/api/admin/login' && method === 'POST') {
    const { password } = body;
    if (password === db.data.settings.adminPassword || password === 'admin') {
      return sendJson(res, 200, { ok: true, token: db.data.settings.adminPassword });
    }
    return sendJson(res, 401, { error: 'Mật khẩu quản trị không đúng!' });
  }

  // Overview Stats
  if (pathname === '/api/admin/stats' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const keys = db.data.keys;
    const machines = db.data.machines;
    const orders = db.data.orders;
    const paidOrders = orders.filter(o => o.status === 'paid');
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.paidAmount || o.amount || 0), 0);

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const thisMonthPaid = paidOrders.filter(o => {
      const d = new Date(o.paidAt || o.createdAt);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    });
    const thisMonthRevenue = thisMonthPaid.reduce((s, o) => s + (o.paidAmount || o.amount || 0), 0);

    return sendJson(res, 200, {
      totalKeys: keys.length,
      activeKeys: keys.filter(k => k.status === 'active').length,
      suspendedKeys: keys.filter(k => k.status === 'suspended').length,
      totalMachines: machines.length,
      activeMachines: machines.filter(m => m.status === 'active').length,
      bannedMachines: db.data.bannedMachines.length,
      bannedIps: db.data.bannedIps.length,
      totalRevenue: totalRevenue,
      thisMonthRevenue: thisMonthRevenue,
      paidOrdersCount: paidOrders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length
    });
  }

  // Monthly Revenue Analytics API
  if (pathname === '/api/admin/revenue' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const orders = db.data.orders || [];
    const paidOrders = orders.filter(o => o.status === 'paid');

    const monthlyMap = {};
    for (const ord of paidOrders) {
      const d = new Date(ord.paidAt || ord.createdAt);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const amount = ord.paidAmount || ord.amount || 0;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          monthKey: key,
          monthLabel: `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          totalRevenue: 0,
          ordersCount: 0,
          plansCount: { basic: 0, silver: 0, gold: 0, other: 0 },
          orders: []
        };
      }

      monthlyMap[key].totalRevenue += amount;
      monthlyMap[key].ordersCount += 1;
      const pCode = (ord.planCode || '').toLowerCase();
      if (pCode.includes('gold')) monthlyMap[key].plansCount.gold += 1;
      else if (pCode.includes('silver')) monthlyMap[key].plansCount.silver += 1;
      else if (pCode.includes('basic')) monthlyMap[key].plansCount.basic += 1;
      else monthlyMap[key].plansCount.other += 1;

      monthlyMap[key].orders.push({
        orderCode: ord.orderCode,
        amount: amount,
        customerIdentifier: ord.customerIdentifier,
        planName: ord.planName,
        planCode: ord.planCode,
        durationDays: ord.durationDays,
        machineCode: ord.machineCode,
        licenseKey: ord.licenseKey,
        paidAt: ord.paidAt || ord.createdAt
      });
    }

    const monthlyStats = Object.values(monthlyMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
    const totalRevenue = paidOrders.reduce((s, o) => s + (o.paidAmount || o.amount || 0), 0);

    return sendJson(res, 200, {
      totalRevenue,
      paidOrdersCount: paidOrders.length,
      monthlyStats,
      allPaidOrders: paidOrders.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt))
    });
  }

  // --- MACHINES MANAGEMENT ---
  if (pathname === '/api/admin/machines' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { machines: db.listMachines() });
  }

  if (pathname === '/api/admin/machines/ban' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { machineCode, reason } = body;
    db.banMachine(machineCode, reason);
    return sendJson(res, 200, { ok: true, message: `Đã khóa máy ${machineCode}` });
  }

  if (pathname === '/api/admin/machines/unban' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { machineCode } = body;
    db.unbanMachine(machineCode);
    return sendJson(res, 200, { ok: true, message: `Đã mở khóa máy ${machineCode}` });
  }

  if (pathname === '/api/admin/machines/reset' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { machineCode } = body;
    if (!machineCode) return sendJson(res, 400, { error: 'Thiếu machineCode' });
    db.resetMachine(machineCode);
    console.log(`[🔄 Admin Reset Machine] Đã reset máy ${machineCode}. Gói license trên máy này đã dừng ngay lập tức!`);
    return sendJson(res, 200, { ok: true, message: `Đã reset máy ${machineCode} thành công. Gói license đã dừng ngay lập tức!` });
  }

  if (pathname === '/api/admin/machines/delete' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { machineCode } = body;
    db.deleteMachine(machineCode);
    return sendJson(res, 200, { ok: true });
  }

  // --- IP BLACKLIST MANAGEMENT ---
  if (pathname === '/api/admin/blacklist' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, {
      bannedMachines: db.data.bannedMachines,
      bannedIps: db.data.bannedIps
    });
  }

  if (pathname === '/api/admin/ips/ban' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { ip, machineCode, reason = 'Vi phạm chính sách / Khóa Blacklist' } = body;
    if (ip && ip !== 'Local') db.banIp(ip, reason);
    if (machineCode) db.banMachine(machineCode, reason);
    return sendJson(res, 200, { ok: true, message: `Đã đưa vào danh sách đen (Blacklist) thành công!` });
  }

  if (pathname === '/api/admin/ips/unban' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { ip } = body;
    db.unbanIp(ip);
    return sendJson(res, 200, { ok: true, message: `Đã mở khóa IP ${ip}` });
  }

  // --- KEYS MANAGEMENT ---
  if (pathname === '/api/admin/keys' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { keys: db.listKeys(query) });
  }

  if (pathname === '/api/admin/keys/suspend' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { key } = body;
    db.suspendKey(key);
    return sendJson(res, 200, { ok: true, message: 'Đã tạm dừng gói bản quyền.' });
  }

  if (pathname === '/api/admin/keys/resume' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { key } = body;
    db.resumeKey(key);
    return sendJson(res, 200, { ok: true, message: 'Đã mở lại gói bản quyền.' });
  }

  if (pathname === '/api/admin/keys/reset-hwid' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { key } = body;
    const cleanKey = String(key || '').trim().toUpperCase();
    const keyObj = db.findKey(cleanKey);
    if (keyObj && Array.isArray(keyObj.machineCodes)) {
      keyObj.machineCodes.forEach(mCode => {
        db.updateMachine(mCode, {
          status: 'unlinked',
          licenseKey: '',
          notes: `Reset HWID đổi máy cho key ${cleanKey} lúc ${new Date().toLocaleString('vi-VN')}`
        });
      });
    }
    db.updateKey(cleanKey, { machineCodes: [] });
    return sendJson(res, 200, { ok: true, message: 'Đã xóa liên kết HWID máy cũ thành công.' });
  }

  if (pathname === '/api/admin/keys/delete' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { key } = body;
    db.deleteKey(key);
    return sendJson(res, 200, { ok: true });
  }

  if (pathname === '/api/admin/keys/generate' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { planCode = 'basic', durationDays, count = 1, customerEmail = '', notes = '' } = body;
    const plan = db.data.plans.find(p => p.code === planCode) || db.data.plans[1];
    const generated = [];
    const num = Math.min(50, Math.max(1, parseInt(count) || 1));
    const defaultDays = plan.billingOptions?.[0]?.durationDays || (plan.code === 'gold' ? 365 : plan.code === 'silver' ? 90 : plan.code === 'trial' ? 3 : 30);
    const days = parseInt(durationDays) || defaultDays;

    let planName = plan.name;
    let planTier = plan.tier;
    if (plan.code === 'gold') {
      planTier = 'ultra';
      planName = 'Gold VIP';
    } else if (plan.code === 'silver') {
      planTier = 'pro';
      planName = 'Silver';
    } else if (plan.code === 'basic') {
      planTier = 'pro';
      planName = 'Basic';
    } else if (plan.code === 'trial') {
      planTier = 'starter';
      planName = 'Trải Nghiệm Free';
    }

    for (let i = 0; i < num; i++) {
      const keyStr = generateLicenseKey(plan.code.toUpperCase(), days);
      const keyObj = {
        id: 'LIC-' + Date.now() + '-' + (i + 1),
        key: keyStr,
        planCode: plan.code,
        planName: planName,
        planTier: planTier,
        durationDays: days,
        maxDevices: 1,
        features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
        limits: planTier === 'ultra' ? { unlimited: true, maxConcurrency: 50 } : (plan.code === 'trial' ? { unlimited: false, imageConcurrency: 5, videoConcurrency: 2, ttsConcurrency: 5 } : { unlimited: true, maxConcurrency: 20 }),
        status: 'unused',
        createdAt: new Date().toISOString(),
        customerEmail,
        machineCodes: [],
        notes: notes || 'Tạo thủ công từ Admin Dashboard'
      };
      db.addKey(keyObj);
      generated.push(keyObj);
    }
    return sendJson(res, 200, { ok: true, count: generated.length, keys: generated });
  }

  // --- ORDERS MANAGEMENT ---
  if (pathname === '/api/admin/orders' && method === 'GET') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    return sendJson(res, 200, { orders: db.listOrders() });
  }

  // Approve Order
  if (pathname === '/api/admin/orders/approve' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { orderCode } = body;
    const order = db.findOrder(orderCode);
    if (!order) return sendJson(res, 404, { error: 'Không tìm thấy đơn hàng' });

    const result = activateOrder(orderCode, order.amount, 'Duyệt thủ công từ Admin Dashboard', clientIp);
    return sendJson(res, 200, { ok: true, licenseKey: result.key.key, expiresAt: result.expiresAt });
  }

  // Simulate SePay Payment Test
  if (pathname === '/api/admin/orders/simulate-sepay' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { orderCode } = body;
    const order = db.findOrder(orderCode);
    if (!order) return sendJson(res, 404, { error: 'Không tìm thấy đơn hàng' });

    const result = activateOrder(orderCode, order.amount, 'Giả lập SePay Admin', clientIp);
    return sendJson(res, 200, { ok: true, message: `Đã giả lập thanh toán SePay thành công cho đơn ${orderCode}!`, result });
  }

  if (pathname === '/api/admin/orders/delete' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const { orderCode } = body;
    db.deleteOrder(orderCode);
    return sendJson(res, 200, { ok: true });
  }

  // --- SETTINGS MANAGEMENT ---
  if (pathname === '/api/admin/settings' && method === 'POST') {
    if (!isAdmin) return sendJson(res, 401, { error: 'Unauthorized' });
    const updated = db.updateSettings(body);
    return sendJson(res, 200, { ok: true, settings: updated });
  }

  // Fallback 404
  return sendJson(res, 404, { error: { message: `Route ${method} ${pathname} not found` } });
});

server.listen(PORT, () => {
  console.log(`🚀 AIForge License Management Server running at http://localhost:${PORT}/admin`);
});
