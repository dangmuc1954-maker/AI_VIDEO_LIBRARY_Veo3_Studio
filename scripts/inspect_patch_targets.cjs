const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('Includes "Tài khoản Google Flow":', c.includes('Tài khoản Google Flow đang tự động kết nối lại'));

const idx1 = c.indexOf('Tài khoản Google Flow đang tự động kết nối lại');
if (idx1 !== -1) {
  console.log('Context 1:', c.substring(idx1 - 100, idx1 + 200));
}

const idx2 = c.indexOf('async runVideoJob(e,t){');
if (idx2 !== -1) {
  console.log('Context 2 (runVideoJob):', c.substring(idx2, idx2 + 400));
}

const idx3 = c.indexOf('if(await this.validateJob(e),this.providerId==="veo3")');
if (idx3 !== -1) {
  console.log('Context 3 (runJob):', c.substring(idx3, idx3 + 300));
}
