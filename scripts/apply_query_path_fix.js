const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';

// 1. vercel.json
const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js?path=$1" },
    { source: "/api", destination: "/api/index.js?path=" }
  ]
};
fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');

// 2. api/index.js
const apiIndexPath = path.join(targetDir, 'api', 'index.js');
let code = fs.readFileSync(apiIndexPath, 'utf-8');

// Replace pathname resolution
const oldPathResolution = `  // Resolve true path across all Vercel proxy rewrites
  const reqUrl = req.headers['x-forwarded-uri'] || req.headers['x-vercel-original-url'] || req.headers['x-real-url'] || req.url || '';
  const parsedUrl = url.parse(reqUrl, true);
  let pathname = (parsedUrl.pathname || '/').replace(/\\/+$/, '') || '/';`;

const newPathResolution = `  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname || '/';
  if (parsedUrl.query && parsedUrl.query.path !== undefined) {
    pathname = '/api/' + parsedUrl.query.path;
  } else if (req.headers['x-forwarded-uri']) {
    pathname = url.parse(req.headers['x-forwarded-uri']).pathname;
  }
  pathname = pathname.replace(/\\/+$/, '') || '/';`;

code = code.replace(oldPathResolution, newPathResolution);
// Clean up debug info from 404 handler
code = code.replace(
  "return sendJson(res, 404, { error: 'API route not found', pathname, reqUrl, rawUrl: req.url, headers: req.headers });",
  "return sendJson(res, 404, { error: 'API route not found', pathname });"
);

fs.writeFileSync(apiIndexPath, code, 'utf-8');
console.log('Applied robust ?path=$1 query rewrite to vercel.json and api/index.js!');
