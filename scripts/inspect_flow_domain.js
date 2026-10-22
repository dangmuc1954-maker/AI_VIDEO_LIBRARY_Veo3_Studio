const https = require('https');

async function testUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    console.log(`URL: ${url}`);
    console.log(`Status: ${res.status}`);
    console.log(`Final URL: ${res.url}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    console.log(`Has __NEXT_DATA__: ${text.includes('__NEXT_DATA__')}`);
    console.log(`Has /api/auth/session: ${text.includes('/api/auth/session')}`);
    console.log(`Has session-token: ${text.includes('session-token')}`);
    console.log(`Has recaptcha: ${text.includes('recaptcha')}`);
    console.log(`Title: ${text.match(/<title>([^<]*)<\/title>/i)?.[1]}`);
    
    // Check auth endpoint directly
    const authRes = await fetch('https://flow.google.com/api/auth/session');
    console.log(`\nflow.google.com/api/auth/session status: ${authRes.status}`);
    const authText = await authRes.text();
    console.log(`flow.google.com/api/auth/session body: ${authText.substring(0, 200)}`);
  } catch (err) {
    console.error('Error:', err);
  }
}

testUrl('https://flow.google.com/');
