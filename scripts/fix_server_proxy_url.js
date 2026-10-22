const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';
const serverJsPath = path.join(targetDir, 'server.js');
let serverJs = fs.readFileSync(serverJsPath, 'utf-8');

serverJs = serverJs.replace(
  '  const parsedUrl = url.parse(req.url, true);\n  const pathname = parsedUrl.pathname;',
  `  // Resolve true path across local and Vercel Serverless proxy rewrites
  const reqUrl = req.headers['x-forwarded-uri'] || req.headers['x-vercel-original-url'] || req.headers['x-real-url'] || req.url || '';
  const parsedUrl = url.parse(reqUrl, true);
  const pathname = parsedUrl.pathname;`
);

fs.writeFileSync(serverJsPath, serverJs, 'utf-8');
console.log('Updated server.js to resolve true Vercel proxy URL!');
