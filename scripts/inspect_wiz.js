const https = require('https');

https.get('https://flow.google.com/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const idx = d.indexOf('window.WIZ_global_data =');
    if (idx !== -1) {
      console.log('--- WIZ_global_data ---');
      console.log(d.slice(idx, idx + 1200));
    }
    const idx2 = d.indexOf('AF_initDataCallback');
    if (idx2 !== -1) {
      console.log('--- AF_initDataCallback ---');
      console.log(d.slice(idx2, idx2 + 1200));
    }
  });
});
