const https = require('https');
const db = require('../license_server/db');

console.log('=== 1. RECENT ORDERS IN DATABASE ===');
db.data.orders.slice(0, 5).forEach(o => {
  console.log('Order:', o.orderCode, '| Amount:', o.amount, '| Status:', o.status, '| Content:', o.transferContent, '| Key:', o.licenseKey || 'none');
});

console.log('\n=== 2. LIVE TRANSACTIONS ON SEPAY ===');
const apiKey = db.data.settings.sepayApiKey;
const options = {
  hostname: 'my.sepay.vn',
  path: '/userapi/transactions/list?limit=10',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + apiKey,
    'Content-Type': 'application/json'
  },
  timeout: 10000
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const txs = json.transactions || (Array.isArray(json.data) ? json.data : []);
      console.log('Transactions from SePay count:', txs.length);
      txs.forEach((t, i) => {
        const amount = t.amount_in || t.transferAmount || t.amount;
        const content = t.transaction_content || t.content || t.description;
        const date = t.transaction_date || t.transactionDate;
        console.log(`[${i+1}] Amount: ${amount} | Content: "${content}" | Date: ${date}`);
      });
    } catch (e) {
      console.log('Error parsing response:', data);
    }
  });
});

req.on('error', (err) => console.error('API Error:', err.message));
req.end();
