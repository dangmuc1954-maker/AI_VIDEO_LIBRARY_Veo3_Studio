const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

// Find all strings in quotes containing non-ascii or english text
const strings = content.match(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g) || [];
console.log('Total string literals:', strings.length);

const interesting = strings.filter(s => 
  s.includes('Trình duyệt') || 
  s.includes('Tùy') || 
  s.includes('tùy') || 
  s.includes('chỉnh') || 
  s.includes('Mặc định') || 
  s.includes('mặc định') || 
  s.includes('custom') || 
  s.includes('provider') ||
  s.includes('default')
);

console.log('Interesting strings:', interesting.slice(0, 50));
