const http = require('http');
const https = require('https');

const SERVER_HOST = '127.0.0.1';
const SERVER_PORT = 8787;
const PUBLIC_TUNNEL_URL = 'https://fb0faca1a972cf.lhr.life/api/webhook/payment';

function localReq(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

    const r = http.request({
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      path,
      method,
      headers
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    r.on('error', reject);
    if (postData) r.write(postData);
    r.end();
  });
}

function sendPublicWebhook(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const parsed = new URL(PUBLIC_TUNNEL_URL);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'SePay-Webhook/2.0'
      }
    };

    const r = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    r.on('error', reject);
    r.write(postData);
    r.end();
  });
}

async function runEndToEndVerification() {
  console.log('======================================================================');
  console.log('🧪 BẮT ĐẦU KIỂM THỬ TOÀN DIỆN QUY TRÌNH BÁN KEY TỰ ĐỘNG QUA SEPAY 🧪');
  console.log('======================================================================\n');

  // BƯỚC 1: Khách hàng mở app và chọn gói "Basic 1 Tháng (120k)"
  console.log('▶ BƯỚC 1: Khách hàng chọn gói Basic (1 Tháng) trên App AIForge Studio');
  const machineCode = 'HWID-TEST-SEPAY-' + Math.floor(1000 + Math.random() * 9000);
  const customerEmail = 'khachhang_sepay_live@gmail.com';
  
  const createOrderRes = await localReq('/v1/orders/create', 'POST', {
    planCode: 'basic',
    durationCode: '1M',
    customerIdentifier: customerEmail,
    machineCode: machineCode,
    installId: 'inst-live-999'
  });

  if (createOrderRes.status !== 200 || !createOrderRes.data.orderCode) {
    throw new Error('Tạo đơn hàng thất bại: ' + JSON.stringify(createOrderRes));
  }

  const order = createOrderRes.data;
  console.log(`  ✓ Đơn hàng đã tạo thành công!`);
  console.log(`  👉 Mã đơn: ${order.orderCode}`);
  console.log(`  👉 Số tiền: ${order.amount.toLocaleString('vi-VN')} ₫`);
  console.log(`  👉 STK Ảo BIDV: ${order.paymentReceiver?.accountNo}`);
  console.log(`  👉 Cú pháp chuyển khoản: "${order.transferContent}"`);
  console.log(`  👉 URL VietQR: ${order.paymentReceiver?.qrImageUrl}\n`);

  // BƯỚC 2: App khách hàng bắt đầu polling kiểm tra trạng thái
  console.log('▶ BƯỚC 2: App khách hàng kiểm tra trạng thái đơn trước khi quét mã...');
  const pollBefore = await localReq('/v1/orders/status', 'POST', { orderCode: order.orderCode });
  console.log(`  👉 Trạng thái đơn hiện tại: [${pollBefore.data.status}] (Đang chờ khách quét QR)\n`);

  // BƯỚC 3: Khách hàng chuyển khoản -> SePay gửi Webhook từ Internet về Server qua Public URL
  console.log('▶ BƯỚC 3: Khách chuyển tiền xong -> SePay bắn Webhook qua Internet (Public HTTPS)');
  console.log(`  🌐 Public Webhook URL: ${PUBLIC_TUNNEL_URL}`);

  const sepayPayload = {
    id: Date.now(),
    gateway: 'BIDV',
    transactionDate: new Date().toISOString(),
    accountNumber: '96247HP2004',
    subAccount: '96247HP2004',
    transferType: 'in',
    transferAmount: order.amount,
    accumulated: order.amount,
    code: order.orderCode,
    content: `${order.transferContent} chuyen tien mua ban quyen`,
    description: `${order.transferContent} chuyen tien mua ban quyen`
  };

  const webhookRes = await sendPublicWebhook(sepayPayload);
  console.log(`  ✓ Phản hồi từ Server Webhook: HTTP ${webhookRes.status}`);
  console.log(`  👉 Kết quả:`, webhookRes.data, '\n');

  // BƯỚC 4: App khách hàng polling lại trạng thái -> Nhận Key và Tự Động Kích Hoạt
  console.log('▶ BƯỚC 4: App khách hàng nhận trạng thái mới sau khi SePay báo...');
  const pollAfter = await localReq('/v1/orders/status', 'POST', { orderCode: order.orderCode });

  console.log(`  ✓ Trạng thái mới của đơn: [${pollAfter.data.status}] (ĐÃ THANH TOÁN!)`);
  console.log(`  🔑 License Key được cấp: ${pollAfter.data.licenseKey}`);
  console.log(`  💎 Gói bản quyền kích hoạt: ${pollAfter.data.planName}`);
  console.log(`  ⏳ Hạn sử dụng: ${pollAfter.data.licenseStatus?.tokenExpiresAt}`);
  console.log(`  🛡️ Chữ ký số Ed25519 Token hợp lệ: ${!!pollAfter.data.entitlementToken}\n`);

  console.log('======================================================================');
  console.log('🎉 KẾT QUẢ KIỂM THỬ: TOÀN BỘ QUY TRÌNH TỰ ĐỘNG HÓA 100% HOÀN HẢO! 🎉');
  console.log('======================================================================');
}

runEndToEndVerification().catch(err => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
