const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';

const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js?path=$1" },
    { source: "/api", destination: "/api/index.js?path=" },
    { source: "/", destination: "/public/index.html" },
    { source: "/index.html", destination: "/public/index.html" },
    { source: "/(.*)", destination: "/public/$1" }
  ]
};

fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');
console.log('Updated vercel.json: Rewriting / to /public/index.html');
