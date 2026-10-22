const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';

// 1. .vercelignore to ignore local server.js
const vercelIgnore = `server.js
local_server.js
scripts/
`;
fs.writeFileSync(path.join(targetDir, '.vercelignore'), vercelIgnore, 'utf-8');

// 2. vercel.json exactly like vercel_server
const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js" },
    { source: "/api", destination: "/api/index.js" },
    { source: "/(.*)", destination: "/public/$1" }
  ]
};
fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');

// 3. Update api/index.js to resolve original URL properly
const apiIndexPath = path.join(targetDir, 'api', 'index.js');
let apiIndex = fs.readFileSync(apiIndexPath, 'utf-8');

apiIndex = apiIndex.replace(
  '  const parsedUrl = url.parse(req.url, true);\n  const pathname = parsedUrl.pathname;',
  `  // Resolve true path across all Vercel proxy rewrites
  const reqUrl = req.headers['x-forwarded-uri'] || req.headers['x-vercel-original-url'] || req.headers['x-real-url'] || req.url || '';
  const parsedUrl = url.parse(reqUrl, true);
  let pathname = (parsedUrl.pathname || '/').replace(/\\/+$/, '') || '/';`
);

fs.writeFileSync(apiIndexPath, apiIndex, 'utf-8');
console.log('Setup Vercel Standard structure successfully!');
