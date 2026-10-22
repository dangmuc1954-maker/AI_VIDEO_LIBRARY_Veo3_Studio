const https = require('https');

function fetchTranscript(videoId) {
  return new Promise(resolve => {
    https.get(`https://www.youtube.com/watch?v=${videoId}`, res => {
      let html = '';
      res.on('data', c => html += c);
      res.on('end', () => {
        // Find title and description
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        const descMatch = html.match(/\"shortDescription\":\"([^\"]+)\"/);
        resolve({
          title: titleMatch ? titleMatch[1] : '',
          desc: descMatch ? descMatch[1] : ''
        });
      });
    }).on('error', e => resolve({ error: e.message }));
  });
}

(async () => {
  const info = await fetchTranscript('C6SEAZiTpMo');
  console.log('Video C6SEAZiTpMo info:', info);
})();
