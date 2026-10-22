async function printWiz() {
  const res = await fetch('https://flow.google.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  const m = html.match(/window\["WIZ_global_data"\]\s*=\s*(\{[\s\S]*?\});/);
  if (m) {
    try {
      const data = JSON.parse(m[1]);
      console.log('WIZ_global_data keys:', Object.keys(data));
      for (const [k, v] of Object.entries(data)) {
        if (typeof v === 'string' && (v.startsWith('http') || v.includes('api') || v.includes('token') || v.includes('key'))) {
          console.log(`  ${k}: ${v}`);
        }
      }
    } catch (e) {
      console.log('Parse error:', e.message);
      console.log(m[1].slice(0, 1000));
    }
  } else {
    console.log('WIZ_global_data not found with regex');
  }
}

printWiz();
