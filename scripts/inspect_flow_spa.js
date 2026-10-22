const fs = require('fs');

async function inspectFlow() {
  const res = await fetch('https://flow.google.com/', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });
  const html = await res.text();
  
  // Find all script tags
  const scripts = [...html.matchAll(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  console.log('Scripts:', scripts);
  
  // Find inline config or data
  const inlineScripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  console.log('Inline script count:', inlineScripts.length);
  for (let i = 0; i < inlineScripts.length; i++) {
    const s = inlineScripts[i];
    if (s.includes('WIZ_global_data') || s.includes('AF_initData') || s.includes('xsrf') || s.includes('token') || s.includes('auth') || s.includes('api')) {
      console.log(`Inline script ${i} (length ${s.length}):`);
      console.log(s.substring(0, 400));
    }
  }
}

inspectFlow();
