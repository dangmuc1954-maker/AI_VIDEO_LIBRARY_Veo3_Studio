const https = require('https');

const id = 'cmtcbvpbp000gms01hcoqwwug';
const url = `https://aitoolforge.shop/v1/workflow-store/products/${id}/download`;

console.log('Testing download:', url);
https.get(url, res => {
  console.log('Status code:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Response:', d.substring(0, 500));
  });
});
