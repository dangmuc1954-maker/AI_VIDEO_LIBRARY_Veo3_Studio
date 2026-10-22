const fs = require('fs');

const log = JSON.parse(fs.readFileSync('flow_gen_net_log.json', 'utf8'));
const ogi = log.find(x => x.url && x.url.includes('ogiZ0b'));
if (ogi) {
  console.log('=== FLOW CAPTURED ogiZ0b ===');
  const params = new URLSearchParams(ogi.body);
  const fReq = params.get('f.req');
  const parsedFReq = JSON.parse(fReq);
  console.log('rpcId:', parsedFReq[0][0][0]);
  const innerJson = parsedFReq[0][0][1];
  const parsedInner = JSON.parse(innerJson);
  console.log('parsedInner structure:');
  console.log(JSON.stringify(parsedInner, null, 2));
}

if (fs.existsSync('flow_submit_requests.json')) {
  console.log('=== flow_submit_requests.json ===');
  const reqs = JSON.parse(fs.readFileSync('flow_submit_requests.json', 'utf8'));
  console.log(JSON.stringify(reqs, null, 2).slice(0, 1500));
}
