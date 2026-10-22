const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'extracted_original');
console.log('srcDir exists:', fs.existsSync(srcDir), srcDir);
