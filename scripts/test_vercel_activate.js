const path = require('path');
const vercelHandler = require(path.join(__dirname, '../vercel_server/api/index.js'));
const { EventEmitter } = require('events');

async function testVercelActivate(key) {
  return new Promise((resolve) => {
    const req = new EventEmitter();
    req.method = 'POST';
    req.url = '/v1/licenses/activate';
    req.headers = { 'content-type': 'application/json' };

    let resBody = '';
    const res = {
      writeHead: (status, headers) => {},
      end: (data) => {
        resBody = data;
        resolve(JSON.parse(resBody));
      }
    };

    vercelHandler(req, res);
    req.emit('data', JSON.stringify({
      licenseKey: key,
      machineCode: 'd71f65c8a997d12f06fdf8b36543e54a8bfec6c29fe906662ac81cb85dfc4145',
      customerIdentifier: 'test@gmail.com'
    }));
    req.emit('end');
  });
}

async function run() {
  console.log('--- TEST 1: Activating Gold Key on Vercel API ---');
  const resGold = await testVercelActivate('AIFORGE-GOLD-365D-617BD6DB-ABC8BF07');
  console.log('Result Plan:', resGold.licenseStatus.plan);
  console.log('Result Plan Name:', resGold.licenseStatus.planName);
  console.log('Result Plan Tier:', resGold.licenseStatus.planTier);
  console.log('Result Max Concurrency:', resGold.licenseStatus.limits.maxConcurrency);
  console.log('Result Expires At:', resGold.licenseStatus.licenseExpiresAt);

  console.log('\n--- TEST 2: Activating Basic Key on top of Gold on Vercel API ---');
  const resBasic = await testVercelActivate('AIFORGE-BASIC-30D-TESTKEY-1234');
  console.log('Result Plan (Should retain gold):', resBasic.licenseStatus.plan);
  console.log('Result Plan Name (Should retain Gold VIP):', resBasic.licenseStatus.planName);
  console.log('Result Plan Tier (Should retain ultra):', resBasic.licenseStatus.planTier);
  console.log('Result Expires At (Should stack +30 days):', resBasic.licenseStatus.licenseExpiresAt);
}

run();
