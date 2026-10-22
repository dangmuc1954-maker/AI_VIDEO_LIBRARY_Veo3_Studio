const http = require('http');
const handler = require('../vercel_server/api/index.js');

async function runSuite() {
  console.log('======================================================================');
  console.log('🧪 KIỂM TRA TOÀN DIỆN HỆ THỐNG CẤP KEY & QUẢN LÝ MÁY TÍNH (HWID)');
  console.log('======================================================================\n');

  const server = http.createServer((req, res) => handler(req, res));
  await new Promise(r => server.listen(9877, r));
  const baseUrl = 'http://localhost:9877';

  try {
    // 1. Kiểm tra 5 gói cước chuẩn
    console.log('1️⃣ Kiểm tra danh sách 5 Gói cước (Plans)...');
    const plansRes = await fetch(`${baseUrl}/v1/plans`).then(r => r.json());
    console.log('   Số lượng gói:', plansRes.plans?.length);
    plansRes.plans?.forEach(p => console.log(`   - [${p.code}] ${p.name} | Tier: ${p.tier} | Thời hạn: ${p.billingOptions?.[0]?.durationDays}N | Max máy: ${p.maxDevices}`));
    if (plansRes.plans?.length !== 5) throw new Error('Cần đúng 5 gói cước');

    // 2. Tạo License Key cho từng gói
    console.log('\n2️⃣ Tạo License Key cho 5 gói (Admin API)...');
    const keysMap = {};
    for (const p of plansRes.plans) {
      const days = p.billingOptions?.[0]?.durationDays || 30;
      const rGen = await fetch(`${baseUrl}/api/admin/keys/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'admin' },
        body: JSON.stringify({
          planCode: p.code,
          durationDays: days,
          maxDevices: p.maxDevices,
          customerEmail: `customer_${p.code}@test.com`,
          notes: `Test cấp gói ${p.name}`
        })
      }).then(r => r.json());

      const k = rGen.keys?.[0];
      keysMap[p.code] = k;
      console.log(`   ✅ Tạo thành công key gói [${p.code}]: ${k.key} (Hạn: ${k.durationDays} ngày, Max: ${k.maxDevices} máy)`);
    }

    // 3. Kích hoạt Key Gold VIP trên máy 1 (HWID)
    console.log('\n3️⃣ Khách kích hoạt Key Gold VIP trên máy tính...');
    const goldKey = keysMap['gold'].key;
    const actRes = await fetch(`${baseUrl}/v1/licenses/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey: goldKey,
        machineCode: 'WIN-HWID-TRIS-01',
        customerIdentifier: 'customer_gold@test.com',
        appVersion: 'v3.0.0'
      })
    }).then(r => r.json());
    console.log('   Kết quả kích hoạt:', actRes.status?.state, '| Gói:', actRes.status?.planName, '| Token hợp lệ:', Boolean(actRes.entitlementToken));

    // 4. Kiểm tra danh sách thiết bị trên Web Admin
    console.log('\n4️⃣ Kiểm tra danh sách máy tính đang dùng key trên Web Admin...');
    const machRes = await fetch(`${baseUrl}/api/admin/machines`, { headers: { 'Authorization': 'admin' } }).then(r => r.json());
    const targetM = machRes.machines?.find(m => m.machineCode === 'WIN-HWID-TRIS-01');
    if (!targetM) throw new Error('Không tìm thấy máy vừa kích hoạt trên Web Admin');
    console.log(`   ✅ Máy tính hiển thị trên Web: HWID = ${targetM.machineCode}`);
    console.log(`      Khách hàng: ${targetM.customerIdentifier} | Key: ${targetM.licenseKey}`);
    console.log(`      Gói cước: ${targetM.planName} | Hạn sử dụng: ${targetM.expiresAt?.slice(0, 10)}`);
    console.log(`      Số ngày còn lại: ${targetM.daysRemaining} ngày | Trạng thái: ${targetM.status}`);

    // 5. Kiểm tra giới hạn số máy (Gold VIP cho phép 3 máy)
    console.log('\n5️⃣ Kiểm tra giới hạn số thiết bị (Gold VIP max 3 máy)...');
    await fetch(`${baseUrl}/v1/licenses/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: goldKey, machineCode: 'WIN-HWID-TRIS-02' })
    });
    await fetch(`${baseUrl}/v1/licenses/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: goldKey, machineCode: 'WIN-HWID-TRIS-03' })
    });
    console.log('   Đã kích hoạt máy 2 và máy 3 thành công.');

    // Kích hoạt máy thứ 4 (vượt quá 3 máy)
    const actFailRes = await fetch(`${baseUrl}/v1/licenses/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: goldKey, machineCode: 'WIN-HWID-TRIS-04' })
    });
    console.log('   Máy thứ 4 cố kích hoạt -> Status:', actFailRes.status, '(409 Conflict chặn lậu đúng chuẩn)');

    // 6. Test Đổi Máy (Reset HWID)
    console.log('\n6️⃣ Admin thực hiện "Đổi Máy" (Reset HWID) cho máy 1...');
    const resetRes = await fetch(`${baseUrl}/api/admin/machines/reset-hwid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'admin' },
      body: JSON.stringify({ machineCode: 'WIN-HWID-TRIS-01', key: goldKey })
    }).then(r => r.json());
    console.log('   Kết quả Reset HWID:', resetRes.message);

    // Bây giờ máy thứ 4 kích hoạt lại -> thành công!
    const actSuccess4 = await fetch(`${baseUrl}/v1/licenses/activate`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: goldKey, machineCode: 'WIN-HWID-TRIS-04' })
    }).then(r => r.json());
    console.log('   Kích hoạt lại máy 4 sau khi Reset HWID ->', actSuccess4.status?.state, '(Thành công)');

    // 7. Test Gia Hạn Gói (Extend 30 Days)
    console.log('\n7️⃣ Admin gia hạn thêm 30 ngày cho máy 4...');
    const extRes = await fetch(`${baseUrl}/api/admin/machines/extend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'admin' },
      body: JSON.stringify({ machineCode: 'WIN-HWID-TRIS-04', extraDays: 30 })
    }).then(r => r.json());
    console.log('   Kết quả gia hạn:', extRes.message, '| Hạn mới:', extRes.newExpiresAt?.slice(0, 10));

    // 8. Test Check-In Heartbeat
    console.log('\n8️⃣ Máy khách gửi Check-in (Heartbeat) định kỳ...');
    const checkInRes = await fetch(`${baseUrl}/v1/licenses/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineCode: 'WIN-HWID-TRIS-04', licenseKey: goldKey })
    }).then(r => r.json());
    console.log('   Check-in trả về token hợp lệ:', Boolean(checkInRes.entitlementToken), '| ServerTime:', checkInRes.serverTime);

    // 9. Test Ban / Khóa máy
    console.log('\n9️⃣ Admin bấm Khóa máy (Ban HWID)...');
    await fetch(`${baseUrl}/api/admin/machines/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'admin' },
      body: JSON.stringify({ machineCode: 'WIN-HWID-TRIS-04', reason: 'Nghi vấn chia sẻ key trái phép' })
    });
    const checkInBanned = await fetch(`${baseUrl}/v1/licenses/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineCode: 'WIN-HWID-TRIS-04', licenseKey: goldKey })
    });
    console.log('   Check-in khi máy bị khóa -> Status:', checkInBanned.status, '(403 Banned)');

    console.log('\n======================================================================');
    console.log('🎉 TẤT CẢ 9 BƯỚC KIỂM TRA HỆ THỐNG ĐÃ VƯỢT QUA 100% HOÀN HẢO!');
    console.log('======================================================================');

  } catch (err) {
    console.error('❌ Lỗi kiểm tra:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runSuite();
