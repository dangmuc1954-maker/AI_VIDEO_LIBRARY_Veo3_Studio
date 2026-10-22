const fs = require('fs');
const path = require('path');
const asarPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\app.asar';

console.log('asar exists?', fs.existsSync(asarPath));
if (fs.existsSync(asarPath)) {
  const stat = fs.statSync(asarPath);
  console.log('asar size:', stat.size);
}

// Let's check public-runtime-config.json
const cfgPath = 'C:\\Users\\admin\\AppData\\Local\\Programs\\aiforge-studio\\resources\\public-runtime-config.json';
if (fs.existsSync(cfgPath)) {
  console.log('public-runtime-config.json:', fs.readFileSync(cfgPath, 'utf-8'));
}
