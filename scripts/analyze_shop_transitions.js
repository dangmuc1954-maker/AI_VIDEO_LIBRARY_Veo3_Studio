const fs = require('fs');

const shopVideoStudio = fs.readFileSync('scratch/shop_app_unpacked/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');

console.log('--- PHÂN TÍCH SOURCE APP GỐC: VIDEO STUDIO & CHUYỂN CẢNH ---');
console.log('1. Có canvas không:', shopVideoStudio.includes('canvas'));
console.log('2. Có webgl không:', shopVideoStudio.includes('webgl') || shopVideoStudio.includes('getContext'));
console.log('3. Có shader không:', shopVideoStudio.includes('shader') || shopVideoStudio.includes('fragment'));
console.log('4. Có transition trong style/class không:');

// Find all occurrences of transition in the component
let p = 0;
while ((p = shopVideoStudio.indexOf('transition', p)) !== -1) {
  const sub = shopVideoStudio.substring(p - 40, p + 120);
  if (!sub.includes('transition-all') && !sub.includes('transition-colors') && !sub.includes('transition-opacity')) {
    console.log(`[${p}]:`, sub);
  }
  p += 15;
}
