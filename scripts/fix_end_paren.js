const fs = require('fs');
let code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const target = '")})]})}export{Qn as default};';
const replacement = '")])})}export{Qn as default};';

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', code, 'utf8');
  console.log('Fixed end paren.');
} else {
  console.log('Target not found, showing last 50 chars:');
  console.log(code.slice(-50));
}
