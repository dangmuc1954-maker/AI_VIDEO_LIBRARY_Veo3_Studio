const fs = require('fs');
const path = require('path');

const distMain = 'dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js';

if (fs.existsSync(distMain)) {
  let code = fs.readFileSync(distMain, 'utf8');

  // Fix plan names in generateAutonomousToken
  code = code.replace(/planName\s*=\s*'Basic\s*\(1\s*Tháng\)'/g, "planName = 'Basic'");
  code = code.replace(/planName\s*=\s*'Silver\s*\(3\s*Tháng\)'/g, "planName = 'Silver'");
  code = code.replace(/planName\s*=\s*'Gold\s*VIP\s*\(1\s*Năm\)'/g, "planName = 'Gold VIP'");
  code = code.replace(/planName\s*=\s*'Trải\s*Nghiệm\s*Free\s*\(3\s*Ngày\)'/g, "planName = 'Trải Nghiệm Free'");

  fs.writeFileSync(distMain, code, 'utf8');
  console.log('✅ Updated dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js successfully!');
} else {
  console.log('Dist main not found at:', distMain);
}
