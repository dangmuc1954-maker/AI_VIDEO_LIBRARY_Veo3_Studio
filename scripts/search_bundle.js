const https = require('https');

// Fetch the main JS bundle from flow.google.com
https.get('https://flow.google.com/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const match = d.match(/src="(https:\/\/www\.gstatic\.com\/_\/mss\/boq-labs-ai-sandbox\/_\/js\/[^"]+)"/);
    if (!match) {
      console.log('No boq-labs-ai-sandbox script found');
      return;
    }
    const scriptUrl = match[1];
    console.log('Script URL:', scriptUrl);
    https.get(scriptUrl, sRes => {
      let sData = '';
      sRes.on('data', c => sData += c);
      sRes.on('end', () => {
        console.log('Bundle loaded! Length:', sData.length);
        const keywords = ['aisandbox-pa', 'batchCheck', 'createProject', 'video:batchCheck', 'veo_3_1', 'lite_low_priority', 'PINHOLE', 'trpc', 'ya29', 'authorization', 'bearer'];
        for (const kw of keywords) {
          const idx = sData.toLowerCase().indexOf(kw.toLowerCase());
          console.log(`Keyword "${kw}": found at ${idx}`);
          if (idx !== -1) {
            console.log(sData.slice(Math.max(0, idx - 100), Math.min(sData.length, idx + 200)));
          }
        }
      });
    });
  });
});
