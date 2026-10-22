const fs = require('fs');

async function checkRoutes() {
  const res = await fetch('https://flow.google.com/');
  const html = await res.text();
  
  // Find all links
  const links = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log('Unique links on flow.google.com:', [...new Set(links)]);
  
  // Test common routes
  for (const route of ['/studio', '/tools', '/tools/flow', '/explore', '/projects']) {
    const r = await fetch('https://flow.google.com' + route, { redirect: 'manual' });
    console.log(`Route ${route}: status ${r.status}, location: ${r.headers.get('location')}`);
  }
}

checkRoutes();
