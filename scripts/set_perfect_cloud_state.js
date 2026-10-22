const REMOTE_API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_CLOUD_ID = 'ff808181a067127101a07b74b792343f';

async function main() {
  console.log('=== SETTING PERFECT CLOUD ADMIN STATE ===');

  const customerHwid = 'd71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145';
  const customerGoldKey = 'AIFORGE-GOLD-365D-B3BBFA28-64DB60AF';
  const basicKey = 'AIVIDEO-BASIC-30D-2203BC80-15A95F07';
  const trialKey = 'AIVIDEO-TRIAL-1D-8B9548E1-BD928383';

  const keys = [
    {
      key: customerGoldKey,
      planCode: 'gold',
      planName: 'Gold VIP',
      planTier: 'ultra',
      durationDays: 365,
      status: 'active',
      isConsumed: true,
      activatedAt: '2026-10-12T02:32:00.000Z',
      expiresAt: '2027-10-12T02:32:00.000Z',
      machineCodes: [customerHwid],
      customerEmail: 'phan.hongha@example.com',
      notes: 'Gói Gold VIP 1 Năm (Khách mua sáng 12/10/2026)'
    },
    {
      key: basicKey,
      planCode: 'basic',
      planName: 'Basic',
      planTier: 'pro',
      durationDays: 30,
      status: 'active',
      isConsumed: true,
      activatedAt: '2026-10-12T03:16:13.095Z',
      expiresAt: '2026-11-11T03:16:13.095Z',
      machineCodes: ['eabcbaf26f837b00d571ea9929d9ce54872c1fd293816cd666ea86dc60e92f8c'],
      customerEmail: 'phanhongha1',
      notes: 'Gói Basic 30 Ngày'
    },
    {
      key: trialKey,
      planCode: 'trial',
      planName: 'Trial 1 Ngày',
      planTier: 'pro',
      durationDays: 1,
      status: 'unused',
      isConsumed: false,
      activatedAt: null,
      machineCodes: [],
      notes: 'Key trải nghiệm'
    },
    {
      key: 'AIVIDEO-SILVER-90D-88AF3192-3B47CE12',
      planCode: 'silver',
      planName: 'Silver (3 Tháng)',
      planTier: 'pro',
      durationDays: 90,
      status: 'unused',
      isConsumed: false,
      activatedAt: null,
      machineCodes: [],
      notes: 'Key Silver dự phòng'
    },
    {
      key: 'AIVIDEO-GOLD-365D-99EF1258-7A890D11',
      planCode: 'gold',
      planName: 'Gold VIP (1 Năm)',
      planTier: 'ultra',
      durationDays: 365,
      status: 'unused',
      isConsumed: false,
      activatedAt: null,
      machineCodes: [],
      notes: 'Key Gold VIP dự phòng'
    }
  ];

  const machines = [
    {
      machineCode: customerHwid,
      customerIdentifier: 'phan.hongha@example.com',
      licenseKey: customerGoldKey,
      planCode: 'gold',
      planName: 'Gold VIP',
      planTier: 'ultra',
      durationDays: 365,
      activatedAt: '2026-10-12T02:32:00.000Z',
      expiresAt: '2027-10-12T02:32:00.000Z',
      status: 'active',
      ip: '1.52.111.172',
      appVersion: 'v3.0.0',
      lastSeenAt: new Date().toISOString(),
      notes: 'Thiết bị kích hoạt gói Gold VIP 1 Năm'
    },
    {
      machineCode: 'eabcbaf26f837b00d571ea9929d9ce54872c1fd293816cd666ea86dc60e92f8c',
      customerIdentifier: 'phanhongha1',
      licenseKey: basicKey,
      planCode: 'basic',
      planName: 'Basic',
      planTier: 'pro',
      durationDays: 30,
      activatedAt: '2026-10-12T03:16:13.095Z',
      expiresAt: '2026-11-11T03:16:13.095Z',
      status: 'active',
      ip: '1.52.111.172',
      appVersion: 'v3.0.0',
      lastSeenAt: new Date().toISOString(),
      notes: 'Thiết bị kiểm thử nội bộ'
    }
  ];

  const orders = [
    {
      orderCode: 'AF' + Math.floor(100000 + Math.random() * 900000),
      planCode: 'gold',
      planName: 'Gold VIP',
      planTier: 'ultra',
      durationDays: 365,
      amount: 800000,
      currency: 'VND',
      customerIdentifier: 'phan.hongha@example.com',
      machineCode: customerHwid,
      licenseKey: customerGoldKey,
      status: 'paid',
      createdAt: '2026-10-12T02:30:00.000Z',
      paymentMethod: 'VietQR SePay'
    }
  ];

  const payload = {
    name: 'aiforge_master_store',
    data: {
      keys,
      machines,
      orders,
      bannedMachines: [],
      bannedIps: [],
      unlinkedMachines: [], // Đảm bảo rỗng để không bị unlinked
      trialUsedMachines: [],
      consumedKeys: [customerGoldKey, basicKey],
      settings: {
        adminPassword: 'admin',
        paymentReceiver: 'PHAN DANG HONG HA',
        bankAccount: '96247HP2004',
        bankName: 'BIDV',
        sepayApiKey: 'MZUDJVBTW0NUAVLC4JOYIYVXWC3DOT2JWOFDUR1SFRNKLZ8EKR9Q9C1FIMHDGTXQ'
      },
      updatedAt: new Date().toISOString()
    }
  };

  const putRes = await fetch(`${REMOTE_API_BASE}/${MASTER_CLOUD_ID}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (putRes.ok) {
    console.log('✅ Successfully updated Vercel Cloud Store! Status:', putRes.status);
  } else {
    console.error('❌ Failed to update cloud. Status:', putRes.status, await putRes.text());
  }
}

main().catch(console.error);
