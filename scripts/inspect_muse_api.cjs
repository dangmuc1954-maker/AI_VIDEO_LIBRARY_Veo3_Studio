const https = require('https');

https.get('https://muse.ai/', (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const scripts = html.match(/src=["']([^"']+\.js[^"']*)["']/g);
    console.log('Scripts:', scripts);
  });
}).on('error', err => console.log('Error:', err.message));
