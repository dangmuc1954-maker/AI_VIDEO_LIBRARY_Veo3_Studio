async function inspectHtmlScripts() {
  const res = await fetch('https://flow.google.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const idx = html.indexOf('https://aisandbox-pa.googleapis.com');
  const start = html.lastIndexOf('<script', idx);
  const end = html.indexOf('</script>', idx);
  console.log('Script containing aisandbox-pa:');
  console.log(html.slice(start, end + 9));
}
inspectHtmlScripts();
