// scripts/test_trial_strict_protection.js
const BASE_URL = 'https://vercelserver-eight.vercel.app';

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM TRA BẢO VỆ KEY TRIAL 1 NGÀY VÀ CHỐNG KÍCH HOẠT LẠI ===');
  const testRunId = Date.now().toString().slice(-6);
  const testMachine1 = `HWID-PROTECT-TEST-A-${testRunId}`;
  const testMachine2 = `HWID-PROTECT-TEST-B-${testRunId}`;

  // 1. Tạo 1 key Trial 1 ngày từ Admin API
  console.log('\n[TEST 1] Admin tạo key Trial 1 Ngày...');
  const genRes = await fetch(`${BASE_URL}/api/admin/keys/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin' },
    body: JSON.stringify({
      planCode: 'trial',
      durationDays: 1,
      customerEmail: `tester_${testRunId}@gmail.com`,
      notes: `Test protection run ${testRunId}`
    })
  });
  const genData = await genRes.json();
  if (!genData.ok || !genData.keys || !genData.keys[0]) {
    throw new Error('Không thể tạo key trial: ' + JSON.stringify(genData));
  }
  const trialKey1 = genData.keys[0].key;
  console.log('✅ Đã tạo thành công Trial Key 1:', trialKey1, `(Hạn: ${genData.keys[0].durationDays} ngày)`);

  // 2. Kích hoạt Trial Key 1 trên Máy 1 lần đầu tiên -> Phải THÀNH CÔNG
  console.log(`\n[TEST 2] Kích hoạt Trial Key 1 trên Máy 1 (${testMachine1})...`);
  const actRes1 = await fetch(`${BASE_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: trialKey1,
      machineCode: testMachine1,
      customerIdentifier: 'Tris Test User'
    })
  });
  const actData1 = await actRes1.json();
  if (actRes1.status !== 200 || (!actData1.valid && !actData1.status?.valid)) {
    throw new Error(`Kích hoạt lần đầu thất bại (HTTP ${actRes1.status}): ` + JSON.stringify(actData1));
  }
  console.log('✅ Kích hoạt lần đầu THÀNH CÔNG!');
  console.log('   Plan:', actData1.status?.planName, '| Hết hạn:', actData1.status?.expiresAt);

  // 3. Thử nhập lại chính Trial Key 1 trên Máy 1 -> BẮT BUỘC BỊ TỪ CHỐI
  console.log(`\n[TEST 3] Thử NHẬP LẠI chính Trial Key 1 trên cùng Máy 1 (${testMachine1})...`);
  const reActRes1 = await fetch(`${BASE_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: trialKey1,
      machineCode: testMachine1,
      customerIdentifier: 'Tris Test User'
    })
  });
  const reActData1 = await reActRes1.json();
  console.log('   HTTP Status:', reActRes1.status);
  console.log('   Response Error:', reActData1.error);
  if (reActRes1.status !== 403) {
    throw new Error(`NGUY HIỂM: Key vẫn kích hoạt lại được! HTTP ${reActRes1.status}`);
  }
  console.log('✅ CHẶN THÀNH CÔNG! Key không thể nhập lại trên máy cũ.');

  // 4. Thử nhập Trial Key 1 trên Máy 2 (khác) -> BẮT BUỘC BỊ TỪ CHỐI
  console.log(`\n[TEST 4] Thử đem Trial Key 1 sang Máy 2 (${testMachine2}) kích hoạt...`);
  const reActRes2 = await fetch(`${BASE_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: trialKey1,
      machineCode: testMachine2,
      customerIdentifier: 'Tris Hacker'
    })
  });
  const reActData2 = await reActRes2.json();
  console.log('   HTTP Status:', reActRes2.status);
  console.log('   Response Error:', reActData2.error);
  if (reActRes2.status !== 403) {
    throw new Error(`NGUY HIỂM: Key kích hoạt được trên máy khác! HTTP ${reActRes2.status}`);
  }
  console.log('✅ CHẶN THÀNH CÔNG! Key không thể kích hoạt trên bất kỳ máy nào khác.');

  // 5. Tạo một Trial Key 2 MỚI TINH, nhưng cố kích hoạt trên Máy 1 (Máy 1 đã từng dùng Trial 1)
  console.log('\n[TEST 5] Tạo Trial Key 2 mới tinh và thử kích hoạt trên Máy 1 (chống lạm dụng trial)...');
  const genRes2 = await fetch(`${BASE_URL}/api/admin/keys/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin' },
    body: JSON.stringify({ planCode: 'trial', durationDays: 1, notes: 'Trial key 2' })
  });
  const genData2 = await genRes2.json();
  const trialKey2 = genData2.keys[0].key;
  console.log('   Trial Key 2 mới:', trialKey2);

  const actTrial2Res = await fetch(`${BASE_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: trialKey2,
      machineCode: testMachine1,
      customerIdentifier: 'Tris Test User'
    })
  });
  const actTrial2Data = await actTrial2Res.json();
  console.log('   HTTP Status:', actTrial2Res.status);
  console.log('   Response Error:', actTrial2Data.error);
  if (actTrial2Res.status !== 403 || (actTrial2Data.error?.code !== 'TRIAL_ALREADY_USED' && !actTrial2Data.error?.message?.includes('Trial'))) {
    throw new Error(`NGUY HIỂM: Máy 1 vẫn dùng được thêm trial key thứ 2! HTTP ${actTrial2Res.status}`);
  }
  console.log('✅ CHẶN THÀNH CÔNG! Máy 1 đã dùng trial thì KHÔNG THỂ dùng thêm trial key nào nữa.');

  // 6. Bấm "HỦY KÍCH HOẠT" (Deactivate) trên Máy 1
  console.log(`\n[TEST 6] Khách hàng bấm "HỦY KÍCH HOẠT" trên Máy 1 (${testMachine1})...`);
  const deactRes = await fetch(`${BASE_URL}/v1/licenses/deactivate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machineCode: testMachine1 })
  });
  const deactData = await deactRes.json();
  console.log('   Deactivate Response:', deactData);
  if (!deactData.ok || deactData.licenseStatus?.valid !== false) {
    throw new Error('Hủy kích hoạt không đúng chuẩn unlicensed!');
  }
  console.log('✅ HỦY KÍCH HOẠT THÀNH CÔNG! Trạng thái chuyển về unlicensed.');

  // 7. Sau khi hủy kích hoạt, thử nhập lại Trial Key 1 -> BẮT BUỘC BỊ TỪ CHỐI
  console.log(`\n[TEST 7] Sau khi đã hủy, thử nhập lại Trial Key 1...`);
  const reActAfterDeactRes = await fetch(`${BASE_URL}/v1/licenses/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      licenseKey: trialKey1,
      machineCode: testMachine1,
      customerIdentifier: 'Tris Test User'
    })
  });
  const reActAfterDeactData = await reActAfterDeactRes.json();
  console.log('   HTTP Status:', reActAfterDeactRes.status);
  console.log('   Response Error:', reActAfterDeactData.error);
  if (reActAfterDeactRes.status !== 403) {
    throw new Error(`NGUY HIỂM: Key sau khi hủy vẫn kích hoạt lại được! HTTP ${reActAfterDeactRes.status}`);
  }
  console.log('✅ CHẶN THÀNH CÔNG! Key sau khi hủy kích hoạt đã bị vô hiệu hóa vĩnh viễn, không thể nhập lại!');

  console.log('\n=============================================================');
  console.log('🎉 TẤT CẢ 7 TEST CASE ĐỀU HOÀN TOÀN CHÍNH XÁC VÀ TUYỆT ĐỐI AN TOÀN!');
  console.log('=============================================================');
}

runTest().catch(err => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
