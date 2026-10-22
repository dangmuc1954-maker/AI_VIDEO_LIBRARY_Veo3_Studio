const https = require('https');

const url = 'https://aitoolforge.shop/v1/workflow-store/catalog';

console.log('Fetching:', url);
https.get(url, { headers: { 'User-Agent': 'AIForge-Studio/1.0.0' } }, res => {
  console.log('Status code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Catalog response keys:', Object.keys(json));
      console.log(`Products count: ${json.products ? json.products.length : 'none'}`);
      if (json.products) {
        json.products.forEach((p, idx) => {
          console.log(`[${idx+1}] ID: ${p.id} | Name: ${p.name} | Price: ${p.priceVnd || p.price} | Status: ${p.status}`);
          console.log(`     Summary: ${p.summary || p.description}`);
          console.log(`     Thumbnail: ${p.thumbnailUrl}`);
        });
      }
    } catch(e) {
      console.log('Raw output:', data.substring(0, 1000));
    }
  });
}).on('error', err => {
  console.error('Fetch error:', err.message);
});
