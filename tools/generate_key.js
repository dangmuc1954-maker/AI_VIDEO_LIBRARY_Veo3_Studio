const fs = require('fs');
const path = require('path');
const readline = require('readline');
const db = require('../license_server/db');
const { generateLicenseKey } = require('../license_server/cryptoUtils');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question, defaultVal) {
  return new Promise(resolve => {
    rl.question(`${question} [Mặc định: ${defaultVal}]: `, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

async function main() {
  console.log('\n====================================================');
  console.log('   🔑 BỘ TẠO LICENSE KEY ĐỘC LẬP (OFFLINE)');
  console.log('====================================================\n');

  console.log('Chọn gói bản quyền:');
  console.log(' 1. Gói Basic (1 Tháng - 30 Ngày)');
  console.log(' 2. Gói Silver (3 Tháng - 90 Ngày)');
  console.log(' 3. Gói Gold VIP (1 Năm - 365 Ngày)');
  console.log(' 4. Tùy chỉnh ngày...');

  const choice = await ask('\nNhập lựa chọn (1-4)', '1');
  let planCode = 'basic', planName = 'Basic 1 Tháng', planTier = 'pro', days = 30;

  if (choice === '1') {
    planCode = 'basic'; planName = 'Basic 1 Tháng'; planTier = 'pro'; days = 30;
  } else if (choice === '2') {
    planCode = 'silver'; planName = 'Silver 3 Tháng'; planTier = 'pro'; days = 90;
  } else if (choice === '3') {
    planCode = 'gold'; planName = 'Gold VIP 1 Năm'; planTier = 'ultra'; days = 365;
  } else if (choice === '4') {
    const customDays = await ask('Nhập số ngày sử dụng', '30');
    days = parseInt(customDays) || 30;
    planCode = days >= 365 ? 'gold' : days >= 90 ? 'silver' : 'basic';
    planTier = days >= 365 ? 'ultra' : 'pro';
    planName = `${planCode.toUpperCase()} ${days} Ngày`;
  }

  const customer = await ask('Tên hoặc Email khách hàng', 'Khách hàng');
  const count = parseInt(await ask('Số lượng Key cần tạo', '1')) || 1;

  console.log('\n----------------------------------------------------');
  console.log(`[*] Đang tạo ${count} Key cho ${customer} (${planName})...\n`);

  for (let i = 0; i < count; i++) {
    const keyStr = generateLicenseKey(planTier.toUpperCase(), days);
    const keyObj = {
      id: 'LIC-' + Date.now() + '-' + (i + 1),
      key: keyStr,
      planCode,
      planName,
      planTier,
      durationDays: days,
      maxDevices: 1,
      features: { imageGeneration: true, videoGeneration: true, tts: true, chat: true, workflows: true, premiumTemplates: true, providerConfig: true, updates: true },
      limits: { unlimited: true, maxConcurrency: planTier === 'ultra' ? 50 : 20 },
      status: 'unused',
      createdAt: new Date().toISOString(),
      customerEmail: customer,
      machineCodes: [],
      notes: 'Tạo từ công cụ tạo key độc lập'
    };
    db.addKey(keyObj);

    console.log(`  👉 KEY #${i + 1}: \x1b[32m${keyStr}\x1b[0m`);
  }

  console.log('\n====================================================');
  console.log('  ✅ ĐÃ TẠO VÀ LƯU KEY THÀNH CÔNG VÀO HỆ THỐNG!');
  console.log('  👉 Bạn chỉ cần copy mã KEY màu xanh ở trên gửi cho khách.');
  console.log('====================================================\n');
  rl.close();
}

main().catch(console.error);
