const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';

const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js?path=$1" },
    { source: "/api", destination: "/api/index.js?path=" },
    { source: "/style.css", destination: "/public/style.css" },
    { source: "/app.js", destination: "/public/app.js" },
    { source: "/manifest.json", destination: "/public/manifest.json" },
    { source: "/", destination: "/public/index.html" }
  ]
};

fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');
console.log('Updated vercel.json with explicit static rewrites!');
