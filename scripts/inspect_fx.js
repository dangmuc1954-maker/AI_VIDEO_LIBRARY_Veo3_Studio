const https = require('https');

https.get('https://labs.google/fx', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('labs.google/fx length:', d.length);
    console.log('Title match:', d.match(/<title[^>]*>([^<]+)<\/title>/i));
    const buttons = d.match(/<button[^>]*>([\s\S]*?)<\/button>/gi) || [];
    console.log('Buttons:', buttons.slice(0, 10));
    const links = d.match(/href="([^"]+)"/g) || [];
    console.log('Auth links:', links.filter(l => l.includes('auth') || l.includes('signin') || l.includes('google') || l.includes('flow')));
  });
});
