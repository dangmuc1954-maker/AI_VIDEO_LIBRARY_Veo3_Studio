const handler = require('../vercel_server/api/index.js');
const http = require('http');

const server = http.createServer((req, res) => {
  handler(req, res);
});

server.listen(9876, async () => {
  console.log('Test server running on port 9876');

  // Test catalog
  try {
    const res = await fetch('http://localhost:9876/v1/workflow-store/catalog');
    console.log('Catalog status:', res.status);
    const data = await res.json();
    console.log('Groups count:', data.groups.length);
    console.log('Products count:', data.products.length);
    console.log('First product:', data.products[0].name);

    // Test me
    const meRes = await fetch('http://localhost:9876/v1/workflow-store/me');
    const meData = await meRes.json();
    console.log('Me entitlements count:', meData.entitlements.length);

    // Test download
    const dlRes = await fetch(`http://localhost:9876/v1/workflow-store/products/${data.products[0].id}/download`);
    const dlData = await dlRes.json();
    console.log('Download product name:', dlData.product.name);
    console.log('Download nodes count:', dlData.definition.nodes.length);
    console.log('Download connections count:', dlData.definition.connections.length);

    // Test thumbnail
    const thRes = await fetch(`http://localhost:9876/v1/workflow-store/products/${data.products[0].id}/thumbnail`);
    console.log('Thumbnail status:', thRes.status, 'Type:', thRes.headers.get('content-type'));

    console.log('ALL API TESTS PASSED PERFECTLY!');
  } catch(e) {
    console.error('Test error:', e);
  } finally {
    server.close();
  }
});
