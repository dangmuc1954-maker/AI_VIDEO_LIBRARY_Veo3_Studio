const https = require('https');
const fs = require('fs');

https.get('https://aitoolforge.shop/v1/workflow-store/catalog', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    fs.writeFileSync('scripts/catalog_full.json', d, 'utf-8');
    console.log('Saved scripts/catalog_full.json. Total length:', d.length);
  });
});
