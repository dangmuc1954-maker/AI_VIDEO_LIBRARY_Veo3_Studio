const https = require('https');

https.get('https://flow.google.com/', res => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Body length:', d.length);
    // Find all script tags
    const scriptMatches = d.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
    console.log('Script tags count:', scriptMatches.length);
    for (const s of scriptMatches) {
      if (s.includes('src=')) {
        console.log('External script:', s.slice(0, 150));
      } else if (s.includes('auth') || s.includes('session') || s.includes('token') || s.includes('api') || s.includes('config')) {
        console.log('Inline script with keywords:', s.slice(0, 300));
      }
    }
  });
});
