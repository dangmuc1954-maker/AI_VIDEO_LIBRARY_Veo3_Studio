const testPayloads = [
  { content: 'AIFORGE AF123456 chuyen tien', transferAmount: 120000 },
  { content: 'AIVIDEO AF654321 ung dung', amount: 800000 },
  { description: 'MBVCB.987654321.AF112233.CT tu 012345', transferAmount: 300000 },
  { content: 'Chuyen khoan AF998877', accumulated: 120000 },
  { content: 'AF554433', transferAmount: '800000' },
  { code: 'AF445566', transferAmount: 120000 },
  { content: 'AIFORGE 778899 mua goi gold', transferAmount: 800000 },
  { content: 'AIVIDEO 334455 mua silver', transferAmount: 300000 },
  { transaction_content: 'CT AF123123', transfer_amount: 120000 }
];

function extractOrderCode(str) {
  if (!str || typeof str !== 'string') return null;
  const clean = str.toUpperCase();
  
  // 1. Direct AF followed by 6 digits (AF123456 or AF-123456 or AF 123456)
  const m1 = clean.match(/AF[-\s]?(\d{6})/i);
  if (m1) return 'AF' + m1[1];
  
  // 2. AIVIDEO / AIFORGE / SEPAY / DH / ORDER followed by 6 digits
  const m2 = clean.match(/(?:AIVIDEO|AIFORGE|SEPAY|ORDER|DH|BILL|DON|GOI)[-\s:]*(\d{6})/i);
  if (m2) return 'AF' + m2[1];
  
  // 3. Any 6-digit number that starts with AF or has keyword
  const m3 = clean.match(/(?:AIVIDEO|AIFORGE|SEPAY|AF)[^\d]*(\d{6})/i);
  if (m3) return 'AF' + m3[1];

  // 4. Standalone 6 digits
  const m4 = clean.match(/(?:^|[^\d])(\d{6})(?:[^\d]|$)/);
  if (m4) return 'AF' + m4[1];

  return null;
}

testPayloads.forEach((p, i) => {
  const c = p.content || p.description || p.transaction_content || p.code || '';
  const code = extractOrderCode(c) || (p.code ? extractOrderCode(p.code) : null);
  console.log(`Test ${i+1}: "${c}" => ${code}`);
});
