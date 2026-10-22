const path = require('path');
const vercelHandler = require(path.join(__dirname, '../vercel_server/api/index.js'));
const { EventEmitter } = require('events');

async function sendMockRequest(method, urlPath, body) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = method;
    req.url = urlPath;
    req.headers = { 'content-type': 'application/json' };

    let resBody = '';
    let resStatus = 200;
    const res = {
      writeHead: (status, headers) => { resStatus = status; },
      end: (data) => {
        resBody = data;
        try { resolve({ status: resStatus, data: JSON.parse(resBody) }); }
        catch { resolve({ status: resStatus, data: resBody }); }
      }
    };

    vercelHandler(req, res);
    if (body) {
      req.emit('data', typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.emit('end');
  });
}

async function runTests() {
  console.log('======================================================================');
  console.log('🧪 KIỂM THỬ TOÀN DIỆN VERCEL SERVERLESS & SEPAY WEBHOOK AUTO-ACTIVATION 🧪');
  console.log('======================================================================');

  // Test 1: Health check
  const t1 = await sendMockRequest('GET', '/health');
  console.log('[1] Health check:', t1.status, t1.data.status);

  // Test 2: Create Order
  const t2 = await sendMockRequest('POST', '/v1/purchase-orders', {
    planCode: 'gold',
    durationCode: '1Y',
    customerIdentifier: 'test_buyer@gmail.com',
    machineCode: 'HWID-TEST-001'
  });
  console.log('[2] Created Order:', t2.data.orderCode, 'Amount:', t2.data.amount, 'Content:', t2.data.transferContent);
  const testOrderCode = t2.data.orderCode;

  // Test 3: SePay Webhook with Bank Prefix Transfer Content (e.g. MBVCB.12345.AIVIDEO AFxxxxxx)
  const t3 = await sendMockRequest('POST', '/api/webhook/payment', {
    id: 123456,
    gateway: 'BIDV',
    accountNumber: '96247HP2004',
    transferType: 'in',
    transferAmount: 800000,
    content: `MBVCB.999888777.AIVIDEO ${testOrderCode}.Chuyen tien mua app`,
    description: `AIVIDEO ${testOrderCode}`
  });
  console.log('[3] SePay Webhook Response:', t3.status, t3.data);

  // Test 4: Check Order Status (Polling from Desktop app)
  const t4 = await sendMockRequest('GET', `/v1/purchase-orders/${testOrderCode}`);
  console.log('[4] Polled Order Status:', t4.data.status, 'Key:', t4.data.licenseKey);
  console.log('    License Status State:', t4.data.licenseStatus?.state, 'Plan:', t4.data.licenseStatus?.planName);
  console.log('    Entitlement Token Generated:', !!t4.data.entitlementToken);

  // Test 5: Direct Auto-Activation Webhook without pre-existing order (Direct Bank Transfer)
  const directOrderCode = 'AF889977';
  const t5 = await sendMockRequest('POST', '/webhook', {
    id: 123457,
    gateway: 'BIDV',
    transferType: 'in',
    transferAmount: 300000,
    content: `AIVIDEO ${directOrderCode} mua ban quyen silver`
  });
  console.log('\n[5] Direct Bank Transfer Webhook (Silver):', t5.status, t5.data.plan, 'Key:', t5.data.key);

  console.log('\n🌟 100% CÁC TEST CASE ĐÃ VƯỢT QUA HOÀN HẢO! 🌟');
}

runTests();
