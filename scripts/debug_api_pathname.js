const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const apiIndexPath = path.join(targetDir, 'api', 'index.js');
let code = fs.readFileSync(apiIndexPath, 'utf-8');

code = code.replace(
  "return sendJson(res, 404, { error: 'API route not found' });",
  "return sendJson(res, 404, { error: 'API route not found', pathname, reqUrl, rawUrl: req.url, headers: req.headers });"
);

fs.writeFileSync(apiIndexPath, code, 'utf-8');
console.log('Added debug info to 404 handler in api/index.js');
