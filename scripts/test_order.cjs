const https = require('https');

const token = "eyJhbGciOiJFZERTQSIsImtpZCI6IjIwMjYtcTMifQ.eyJpYXQiOjE3ODk5NjA0MjYsIm5iZiI6MTc4OTk2MDM2NiwiZXhwIjoxNzg5OTc0ODI2LCJqdGkiOiJjN2IyZGU1MS1kNGNiLTQ3M2UtYjI2Ny0zNzY1NDgzOGNiYWMiLCJsaWNlbnNlSWQiOiJjbXVhbzgwOHIwZzY5cTMwMWt6ZjBrbm45IiwiYWN0aXZhdGlvbklkIjoiY211YW84MDh3MGc2Y3EzMDE2ZG13MjJrMCIsImN1c3RvbWVySWQiOiJjbXVhbzgwOG8wZzY3cTMwMTI2N3lzZTY5IiwiY3VzdG9tZXJJZGVudGlmaWVyIjoidHJpc18xNzg5OTYwNDI5MjM3IiwibWFjaGluZUNvZGUiOiI0ZmMwNDNjYzI3N2VkYjk1ZjJiYzBhMzBhMDg4Njg1NTAxZTY5Mzc5ZTBjYzZiZTFjMDYxMzQ0YTAxNmE3NDk2IiwicGxhbiI6InBybyIsInBsYW5OYW1lIjoiUHJvIiwicGxhblRpZXIiOiJwcm8iLCJzdGF0dXMiOiJhY3RpdmUiLCJmZWF0dXJlcyI6eyJpbWFnZUdlbmVyYXRpb24iOnRydWUsInZpZGVvR2VuZXJhdGlvbiI6dHJ1ZSwidHRzIjp0cnVlLCJjaGF0Ijp0cnVlLCJ3b3JrZmxvd3MiOnRydWUsInByZW1pdW1UZW1wbGF0ZXMiOnRydWUsInByb3ZpZGVyQ29uZmlnIjp0cnVlLCJ1cGRhdGVzIjp0cnVlfSwiY2FwYWJpbGl0aWVzIjpbInVwc2NhbGVfaW1hZ2UiLCJ1cHNjYWxlX3ZpZGVvIiwicmVtb3ZlX3dhdGVybWFya19pbWFnZSIsInJlbW92ZV93YXRlcm1hcmtfdmlkZW8iXSwibGltaXRzIjp7Im1heEJhdGNoU2l6ZSI6NTAsIm1heFBhcmFsbGVsSm9icyI6OCwibWF4UHJvdmlkZXJBY2NvdW50cyI6MTAsImltYWdlQ29uY3VycmVuY3kiOjQsImltYWdlUGVyaW9kUXVvdGEiOjQwMCwidmlkZW9Db25jdXJyZW5jeSI6NCwidmlkZW9QZXJpb2RRdW90YSI6NDAwLCJ0dHNDb25jdXJyZW5jeSI6NCwidHRzUGVyaW9kUXVvdGEiOjEwMCwid29ya2Zsb3dDb25jdXJyZW5jeSI6NCwid29ya2Zsb3dRdW90YU1vZGUiOiJpbmhlcml0cy1vdXRwdXQiLCJ1bmxpbWl0ZWQiOmZhbHNlfSwidG9rZW5FeHBpcmVzQXQiOiIyMDI2LTA5LTIxVDA3OjEzOjQ2LjMxMFoiLCJsaWNlbnNlRXhwaXJlc0F0IjoiMjAyNi0wOS0yNFQwMzoxMzo0Ni4yOTVaIiwib2ZmbGluZVVudGlsIjoiMjAyNi0wOS0yMVQwNzoxMzo0Ni4zMTBaIiwic2VydmVyVGltZSI6IjIwMjYtMDktMjFUMDM6MTM6NDYuMzEwWiIsInN0YXR1c1ZlcnNpb24iOjEsImFwcFZlcnNpb24iOiIwLjEuMC1idWlsZC4yMDI2MDkxMjEyNDAwMyIsImlzcyI6ImFpZm9yZ2UtbGljZW5zZS1zZXJ2ZXIiLCJhdWQiOiJhaWZvcmdlLXN0dWRpbyJ9.tEPQRYqhVdRbqlPU0WuvUe5bhpGujiBRDVsaNNbDJ6Znq-4nYjJztk2et7_RkVdWGtZdH9GYjhS4jxUL3-cCBg";

const id = '2f0f0fed-b25f-4970-af89-1a2d0a05423c';

function post(url, payload = {}) {
  return new Promise(resolve => {
    const b = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${token}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(b)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(b);
    req.end();
  });
}

(async () => {
  console.log('Creating order for:', id);
  const orderRes = await post(`https://aitoolforge.shop/v1/workflow-store/products/${id}/orders`);
  console.log('Order res:', orderRes);
})();
