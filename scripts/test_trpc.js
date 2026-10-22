const https = require('https');

const req = https.request('https://labs.google/fx/api/trpc/project.createProject', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  console.log('trpc status:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('trpc body:', d));
});

req.write(JSON.stringify({ json: { projectTitle: "test", toolName: "PINHOLE" } }));
req.end();
