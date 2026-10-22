const fs = require('fs');
const path = require('path');

const userUploadsDir = 'C:/Users/admin/.gemini/antigravity-ide/brain/de24d734-6a8f-44ac-a8d1-49eb2997c8c3/.user_uploaded';
const files = fs.readdirSync(userUploadsDir);
console.log('User uploaded files:');
for (const f of files) {
  const p = path.join(userUploadsDir, f);
  const st = fs.statSync(p);
  console.log(f, 'size:', st.size, 'time:', new Date(st.mtimeMs).toLocaleTimeString());
}
