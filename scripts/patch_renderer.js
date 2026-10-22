const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../dist/AIForge_Studio_Customer_Edition/out/renderer/assets/LicenseCenter-D-RJQ6lX.js');

if (!fs.existsSync(filePath)) {
  console.log('File not found:', filePath);
  process.exit(1);
}

let code = fs.readFileSync(filePath, 'utf8');

// 1. Fix de(a,t)
code = code.replace(/\|\|a\.toUpperCase\(\)/g, '||(typeof a==="string"?a.toUpperCase():"")');

// 2. Fix pe(a)
code = code.replace(/a\.durationCode\?\.trim\(\)\.toUpperCase\(\)/g, '(a&&a.durationCode?a.durationCode.trim().toUpperCase():"")');

// 3. Fix Pa(a)
code = code.replace(/const t=a\.trim\(\)\.replace\(/g, 'const t=(typeof a==="string"?a.trim():"").replace(');

// 4. Fix le(a)
code = code.replace(/a\.charAt\(0\)\.toUpperCase\(\)\+a\.slice\(1\)/g, '(a?(a.charAt(0).toUpperCase()+a.slice(1)):"")');

// 5. Fix te() so clicking Free Trial or Buy immediately executes without blocking
code = code.replace(/te=async\(\)=>[\s\S]*?Z\(\),!1\)/g, 'te=async()=>!0');

fs.writeFileSync(filePath, code, 'utf8');
console.log('✅ LicenseCenter-D-RJQ6lX.js successfully patched with regex!');
