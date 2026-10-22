const fs = require('fs');
const path = require('path');

const targetDir = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen';

// 1. package.json
const pkg = {
  name: "xieng-nuong-be-huyen",
  version: "1.0.0",
  description: "Hệ thống POS 20 bàn & Quản lý bán hàng Xiêng Nướng Bé Huyền 24/24 trên Vercel Cloud",
  main: "api/index.js",
  scripts: {
    start: "node server.js",
    deploy: "vercel --prod"
  },
  dependencies: {}
};
fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2), 'utf-8');

// 2. vercel.json
const vercelConfig = {
  version: 2,
  rewrites: [
    { source: "/api/(.*)", destination: "/api/index.js" },
    { source: "/api", destination: "/api/index.js" },
    { source: "/", destination: "/public/index.html" },
    { source: "/(.*)", destination: "/public/$1" }
  ]
};
fs.writeFileSync(path.join(targetDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2), 'utf-8');

console.log('Fixed vercel.json and package.json!');
