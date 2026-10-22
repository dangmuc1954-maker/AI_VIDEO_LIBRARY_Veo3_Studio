const https = require('https');

https.get('https://aitoolforge.shop/v1/workflow-store/catalog', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const json = JSON.parse(data);
    json.products.forEach((p, idx) => {
      console.log(`--- [${idx+1}] ${p.name} ---`);
      console.log('ID:', p.id);
      console.log('Price:', p.priceVnd, 'PricingType:', p.pricingType, 'Free:', p.isFree);
      console.log('Tags:', p.tags);
      console.log('Required Providers:', p.requiredProviders);
      console.log('ThumbnailUrl:', p.thumbnailUrl);
      console.log('Created:', p.createdAt, 'Updated:', p.updatedAt);
    });
  });
});
