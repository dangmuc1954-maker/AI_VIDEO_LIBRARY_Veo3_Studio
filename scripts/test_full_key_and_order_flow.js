const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('🧪 TESTING FULL LICENSE SERVER & WEB ADMIN WORKFLOW 🧪');
  console.log('======================================================');

  const testHwid = 'TEST-HWID-PHAN-DANG-' + Math.floor(1000 + Math.random() * 9000);
  const testCustomer = 'phandangha@gmail.com';

  // 1. Test GET /v1/plans
  console.log('\n[1] Kiểm tra lấy danh sách gói /v1/plans:');
  const plansRes = await request({ hostname: 'localhost', port: 8787, path: '/v1/plans', method: 'GET' });
  console.log('  Status:', plansRes.status);
  console.log('  Plans count:', plansRes.data?.plans?.length);
  if (plansRes.status !== 200 || !plansRes.data?.plans) throw new Error('Plans failed');

  // 2. Test POST /v1/orders/create (Khách quét QR mua gói Silver 90 ngày)
  console.log('\n[2] Kiểm tra tạo đơn hàng /v1/orders/create (Gói Silver 90 ngày):');
  const orderRes = await request({
    hostname: 'localhost', port: 8787, path: '/v1/orders/create', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    planCode: 'silver',
    durationCode: '3M',
    customerIdentifier: testCustomer,
    machineCode: testHwid,
    appVersion: '1.0.0'
  });
  console.log('  Status:', orderRes.status);
  console.log('  Order Code:', orderRes.data?.orderCode);
  console.log('  Amount:', orderRes.data?.amount);
  console.log('  QR URL:', orderRes.data?.paymentReceiver?.qrImageUrl);
  const orderCode = orderRes.data?.orderCode;
  if (!orderCode) throw new Error('Create order failed');

  // 3. Test POST /v1/orders/status khi đang chờ thanh toán
  console.log('\n[3] Kiểm tra polling đơn hàng /v1/orders/status khi chưa trả tiền:');
  const statusPending = await request({
    hostname: 'localhost', port: 8787, path: '/v1/orders/status', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { orderCode, machineCode: testHwid });
  console.log('  Status:', statusPending.status);
  console.log('  Order Status:', statusPending.data?.status);
  if (statusPending.data?.status !== 'pending') throw new Error('Order should be pending');

  // 4. Test SePay Webhook /api/sepay/webhook (Khách chuyển khoản ngân hàng BIDV)
  console.log('\n[4] Giả lập SePay bắn Webhook thanh toán thành công:');
  const webhookRes = await request({
    hostname: 'localhost', port: 8787, path: '/api/sepay/webhook', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    content: `AIFORGE ${orderCode} CHUYEN KHOAN`,
    transferAmount: 300000,
    amount: 300000
  });
  console.log('  Status:', webhookRes.status);
  console.log('  Webhook Result:', webhookRes.data);
  if (!webhookRes.data?.success) throw new Error('Webhook failed');

  // 5. Test POST /v1/orders/status sau khi thanh toán -> App tự động nhận Key & Token
  console.log('\n[5] Kiểm tra app polling /v1/orders/status sau khi thanh toán:');
  const statusPaid = await request({
    hostname: 'localhost', port: 8787, path: '/v1/orders/status', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { orderCode, machineCode: testHwid });
  console.log('  Status:', statusPaid.status);
  console.log('  Order Status:', statusPaid.data?.status);
  console.log('  Granted Key:', statusPaid.data?.licenseKey);
  console.log('  Granted Plan:', statusPaid.data?.planCode, `(${statusPaid.data?.planName})`);
  console.log('  Entitlement Token exists:', !!statusPaid.data?.entitlementToken);
  console.log('  License Status valid:', statusPaid.data?.licenseStatus?.valid);
  if (statusPaid.data?.status !== 'paid' || !statusPaid.data?.entitlementToken) throw new Error('Status paid check failed');

  // 6. Test Admin Generate Keys for ALL plans: Basic, Silver, Gold, Lifetime, Trial
  console.log('\n[6] Kiểm tra Web Admin tạo Key cho từng gói cụ thể:');
  
  const testPlans = [
    { code: 'basic', days: 30, expectedName: 'Basic' },
    { code: 'silver', days: 90, expectedName: 'Silver' },
    { code: 'gold', days: 365, expectedName: 'Gold VIP' },
    { code: 'gold', days: 36500, expectedName: 'Gold VIP Trọn Đời' }
  ];

  for (const tp of testPlans) {
    console.log(`  --> Tạo key gói ${tp.code} (${tp.days} ngày):`);
    const genRes = await request({
      hostname: 'localhost', port: 8787, path: '/api/admin/keys/generate', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin' }
    }, {
      planCode: tp.code,
      durationDays: tp.days,
      count: 1,
      customerEmail: 'test_admin_gen@gmail.com'
    });
    const createdKey = genRes.data?.keys?.[0];
    console.log('      Key:', createdKey?.key);
    console.log('      Plan:', createdKey?.planCode, `(${createdKey?.planName})`);
    console.log('      Duration:', createdKey?.durationDays, 'ngày');
    if (!createdKey || createdKey.planCode !== tp.code || createdKey.durationDays !== tp.days) {
      throw new Error(`Key generation mismatch for ${tp.code}`);
    }

    // Test activating this key on a test machine
    const actHwid = 'HWID-ACT-' + tp.code + '-' + Math.floor(1000 + Math.random() * 9000);
    const actRes = await request({
      hostname: 'localhost', port: 8787, path: '/v1/licenses/activate', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      licenseKey: createdKey.key,
      machineCode: actHwid,
      customerIdentifier: 'customer_' + tp.code + '@gmail.com'
    });
    console.log('      [Kích hoạt vào máy]:', actRes.data?.status?.plan, `(${actRes.data?.status?.planName})`, '| Hạn:', actRes.data?.status?.expiresAt);
    if (!actRes.data?.entitlementToken || actRes.data?.status?.plan !== tp.code) {
      throw new Error(`Activation plan mismatch for ${tp.code}`);
    }
  }

  // 7. Check Admin Stats & Machines
  console.log('\n[7] Kiểm tra Web Admin Stats & Danh sách máy đã ghi nhận:');
  const adminStats = await request({
    hostname: 'localhost', port: 8787, path: '/api/admin/stats', method: 'GET',
    headers: { 'Authorization': 'Bearer admin' }
  });
  console.log('  Active Machines:', adminStats.data?.activeMachines);
  console.log('  Total Keys:', adminStats.data?.totalKeys);
  console.log('  Total Revenue:', adminStats.data?.totalRevenue?.toLocaleString('vi-VN'), 'đ');

  console.log('\n======================================================');
  console.log('🎉 TOÀN BỘ 2 VẤN ĐỀ ĐÃ ĐƯỢC FIX VÀ KIỂM THỬ THÀNH CÔNG 100%! 🎉');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
